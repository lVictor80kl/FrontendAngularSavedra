// services/multimedia.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Video, Subtitle } from '../models/video.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MultimediaService {
  private baseUrl = 'http://localhost:3000/media';

  // Simulación de una base de datos local
  private videos: Video[] = [];
  private videosSubject = new BehaviorSubject<Video[]>([]);
  
  constructor(private http: HttpClient) {
    // Cargar datos iniciales si existen en localStorage
    this.loadFromLocalStorage();
  }
  
  // Subir una imagen
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file); // Multer espera 'file' como nombre de campo
    return this.http.post(`${this.baseUrl}/upload-image`, formData);
  }

  // Subir un video
  uploadVideo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file); // Multer espera 'file' como nombre de campo
    return this.http.post(`${this.baseUrl}/upload-video`, formData);
  }

  // Obtener todas las imágenes
  getImages(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/images`);
  }

  // Obtener todos los videos
  getVideos(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/videos`);
  }

  // Obtener una imagen por nombre de archivo
  getImage(filename: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/image/${filename}`, { responseType: 'blob' });
  }

  // Obtener un video por nombre de archivo
  getVideo(filename: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/video/${filename}`, { responseType: 'blob' });
  }

  // Agregar un nuevo video
  addVideo(videoData: Omit<Video, 'id'>): Observable<Video> {
    const formData = new FormData();
    formData.append('title', videoData.title);
    formData.append('description', videoData.description);
    formData.append('file', videoData.file as File);
    // Enviar subtítulos como espera el backend
    const subEs = videoData.subtitles.find(s => s.language === 'es');
    const subEn = videoData.subtitles.find(s => s.language === 'en');
    if (subEs) formData.append('subtitlesEs', subEs.file);
    if (subEn) formData.append('subtitlesEn', subEn.file);
    if (videoData.thumbnailUrl) {
      formData.append('thumbnailUrl', videoData.thumbnailUrl);
    }
    // Log para depuración
    console.log('FormData para video:', Array.from(formData.entries()));
    return this.http.post<Video>(`${this.baseUrl}/upload-video`, formData);
  }
  
  // Obtener un video por ID
  getVideoById(id: string): Observable<Video | undefined> {
    const video = this.videos.find(v => v.id === id);
    return of(video);
  }
  
  // Eliminar un video
  deleteVideo(id: string): void {
    this.videos = this.videos.filter(v => v.id !== id);
    this.videosSubject.next([...this.videos]);
    this.saveToLocalStorage();
  }
  
  // Guardar en localStorage
  private saveToLocalStorage(): void {
    try {
      // Nota: Esto es solo para simulación. En un entorno real,
      // no se guardarían archivos grandes como videos en localStorage
      const serializedVideos = JSON.stringify(this.videos.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        url: video.url,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt
      })));
      localStorage.setItem('videos', serializedVideos);
    } catch (error) {
      console.error('Error al guardar videos en localStorage:', error);
    }
  }
  
  // Cargar desde localStorage
  private loadFromLocalStorage(): void {
    try {
      const serializedVideos = localStorage.getItem('videos');
      if (serializedVideos) {
        const videosData = JSON.parse(serializedVideos);
        // Nota: Esto es solo una simulación y no incluye los archivos reales
        this.videos = videosData;
        this.videosSubject.next([...this.videos]);
      }
    } catch (error) {
      console.error('Error al cargar videos desde localStorage:', error);
    }
  }
  
  // Validar que un archivo de subtítulos tenga al menos 10 líneas de diálogo
  async validateSubtitlesMinLines(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (!content) {
            resolve(false);
            return;
          }
          
          // Contar líneas de diálogo en formato VTT o SRT
          let dialogueLines = 0;
          
          if (file.name.endsWith('.vtt')) {
            // Para WebVTT: buscar líneas que no son metadatos ni tiempos
            const lines = content.split('\n');
            let inCue = false;
            
            for (const line of lines) {
              const trimmedLine = line.trim();
              
              // Detectar el inicio de una nueva entrada de subtítulo
              if (trimmedLine.includes('-->')) {
                inCue = true;
                continue;
              }
              
              // Contar línea de diálogo (no vacía cuando estamos en una entrada)
              if (inCue && trimmedLine && !trimmedLine.match(/^\d+$/)) {
                dialogueLines++;
                inCue = false; // Consideramos cada entrada como una línea
              }
              
              // Línea vacía indica fin de entrada
              if (inCue && !trimmedLine) {
                inCue = false;
              }
            }
          } else if (file.name.endsWith('.srt')) {
            // Para SRT: similar al anterior
            const blocks = content.split('\n\n');
            dialogueLines = blocks.filter(block => {
              const lines = block.split('\n');
              return lines.length >= 3; // Número, tiempo, texto
            }).length;
          } else {
            // Para otros formatos: contamos líneas no vacías
            const lines = content.split('\n');
            dialogueLines = lines.filter(line => line.trim() !== '').length;
          }
          
          resolve(dialogueLines >= 10);
        } catch (error) {
          reject('Error al procesar el archivo: ' + error);
        }
      };
      
      reader.onerror = () => {
        reject('Error al leer el archivo');
      };
      
      reader.readAsText(file);
    });
  }
}