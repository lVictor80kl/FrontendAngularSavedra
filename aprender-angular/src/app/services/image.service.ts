// services/image.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Image {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  format: string;
  width: number;
  height: number;
  size: number;
  uploadDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = '/api/images'; // Ajustar según la API real

  constructor(private http: HttpClient) { }

  getImages(): Observable<Image[]> {
    return this.http.get<Image[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  getImageById(id: string): Observable<Image> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Image>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    
    const req = new HttpRequest('POST', this.apiUrl, formData, {
      reportProgress: true
    });
    
    return this.http.request(req).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            return {
              type: 'progress',
              loaded: event.loaded,
              total: event.total
            };
          case HttpEventType.Response:
            return {
              type: 'complete',
              body: event.body
            };
          default:
            return {
              type: 'other'
            };
        }
      }),
      catchError(this.handleError)
    );
  }

  updateImage(id: string, data: any): Observable<Image> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Image>(url, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteImage(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en el servicio de imágenes:', error);
    let errorMessage = 'Ha ocurrido un error en el servidor. Inténtelo de nuevo más tarde.';
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}