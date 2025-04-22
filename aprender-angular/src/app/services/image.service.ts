import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface ImageInfo {
  id?: string;
  src: string;
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private images: ImageInfo[] = [];
  private imagesSubject = new BehaviorSubject<ImageInfo[]>([]);
  private selectedImageSubject = new BehaviorSubject<ImageInfo | null>(null);

  // Observables que los componentes pueden suscribirse
  public images$ = this.imagesSubject.asObservable();
  public selectedImage$ = this.selectedImageSubject.asObservable();

  constructor() {
    // Cargar imágenes guardadas en localStorage al iniciar
    this.loadFromStorage();
  }

  getImages(): Observable<ImageInfo[]> {
    return this.images$;
  }

  addImage(image: ImageInfo): void {
    // Asignar un ID único si no tiene
    if (!image.id) {
      image.id = uuidv4();
    }
    
    // Agregar la imagen al arreglo
    this.images.push(image);
    
    // Actualizar el observable y localStorage
    this.imagesSubject.next([...this.images]);
    this.saveToStorage();
  }

  selectImage(id: string): void {
    const image = this.images.find(img => img.id === id) || null;
    this.selectedImageSubject.next(image);
  }

  deleteImage(id: string): void {
    // Filtrar la imagen a eliminar
    this.images = this.images.filter(img => img.id !== id);
    
    // Actualizar el observable y localStorage
    this.imagesSubject.next([...this.images]);
    this.saveToStorage();
    
    // Si la imagen seleccionada era la que se eliminó, limpiar la selección
    const selectedImage = this.selectedImageSubject.value;
    if (selectedImage && selectedImage.id === id) {
      this.selectedImageSubject.next(null);
    }
  }

  isValidImageFormat(mimeType: string): boolean {
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validFormats.includes(mimeType);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('gallery_images', JSON.stringify(this.images));
    } catch (error) {
      console.error('Error saving images to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const savedImages = localStorage.getItem('gallery_images');
      if (savedImages) {
        this.images = JSON.parse(savedImages);
        
        // Convertir fechas de string a objeto Date
        this.images.forEach(img => {
          if (img.createdAt) {
            img.createdAt = new Date(img.createdAt);
          }
        });
        
        this.imagesSubject.next([...this.images]);
      }
    } catch (error) {
      console.error('Error loading images from localStorage:', error);
    }
  }
}