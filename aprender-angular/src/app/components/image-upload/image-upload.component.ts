import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { MultimediaService } from '../../services/multimedia.service';
import { HttpClient } from '@angular/common/http';

export function fileChangeEvent(event: any, maxFileSize: number, validFormats: string[]): {
  file: File | null,
  errorMessage: string
} {
  let errorMessage = '';
  const file = event.target.files[0];

  if (!file) {
    errorMessage = 'No se seleccionó ningún archivo.';
    return { file: null, errorMessage };
  }

  if (!validFormats.includes(file.type)) {
    errorMessage = 'Formato no válido. Por favor, sube una imagen JPG, PNG o WebP.';
    return { file: null, errorMessage };
  }

  if (file.size > maxFileSize * 1024 * 1024) {
    errorMessage = `La imagen es demasiado grande. El tamaño máximo es de ${maxFileSize}MB.`;
    return { file: null, errorMessage };
  }

  return { file, errorMessage };
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCropperComponent],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper = false;
  imageFormat: string = '';
  imageFileType: string = '';
  imageFile: File | null = null;
  errorMessage: string = '';

  minWidth = 800;
  minHeight = 600;
  maxWidth = 3840; // 4K UHD width
  maxHeight = 2160; // 4K UHD height
  maxFileSize = 5;

  rotation = 0;
  scale = 1;

  savedImages: string[] = [];
  carouselStartIndex = 0;
  visibleImageCount = 3;

  constructor(private changeDetectorRef: ChangeDetectorRef, private multimediaService: MultimediaService) { }

  handleFileChange(event: any): void {
    const { file, errorMessage } = fileChangeEvent(event, this.maxFileSize, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
    this.errorMessage = errorMessage;

    if (file) {
      // Validar dimensiones máximas y mínimas antes de mostrar el cropper
      const img = new Image();
      img.onload = () => {
        if (img.width < this.minWidth || img.height < this.minHeight) {
          this.errorMessage = `La imagen es demasiado pequeña. Mínimo: ${this.minWidth}x${this.minHeight}px.`;
          return;
        }
        if (img.width > this.maxWidth || img.height > this.maxHeight) {
          this.errorMessage = `La imagen es demasiado grande. Máximo: ${this.maxWidth}x${this.maxHeight}px.`;
          return;
        }
        this.imageFile = file;
        this.imageFileType = file.type;
        this.imageFormat = file.type.split('/')[1];
        this.imageChangedEvent = event;
        this.showCropper = true;
        this.rotation = 0;
        this.scale = 1;
      };
      img.onerror = () => {
        this.errorMessage = 'No se pudo leer la imagen.';
      };
      img.src = URL.createObjectURL(file);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    console.log('Imagen Cropped Event (completo):', event);
    this.croppedImage = event.base64 || '';
    if (!this.croppedImage && event.objectUrl) {
      this.croppedImage = event.objectUrl;
    }
    console.log('this.croppedImage (para guardar/descargar):', this.croppedImage);
    this.changeDetectorRef.detectChanges();
    if (event.width && event.height && (event.width < this.minWidth || event.height < this.minHeight)) {
      this.errorMessage = `La imagen recortada es demasiado pequeña. Mínimo: ${this.minWidth}x${this.minHeight}px.`;
    } else if (event.width && event.height && (event.width > this.maxWidth || event.height > this.maxHeight)) {
      this.errorMessage = `La imagen recortada es demasiado grande. Máximo: ${this.maxWidth}x${this.maxHeight}px.`;
    } else {
      this.errorMessage = '';
    }
  }

  imageLoaded() {
    this.showCropper = true;
  }

  cropperReady() {
    // Cropper está listo
  }

  loadImageFailed() {
    this.errorMessage = 'No se pudo cargar la imagen. Por favor, intenta con otra.';
    this.showCropper = false;
  }

  rotateLeft() {
    this.rotation -= 90;
  }

  rotateRight() {
    this.rotation += 90;
  }

  zoomIn() {
    this.scale += 0.1;
  }

  zoomOut() {
    if (this.scale > 0.1) {
      this.scale -= 0.1;
    }
  }

  resetImage() {
    this.rotation = 0;
    this.scale = 1;
  }

  async saveImage() {
    if (this.errorMessage) {
      return;
    }

    // Si no hay base64 del cropper, intenta convertir el archivo original a base64
    if (!this.croppedImage || typeof this.croppedImage !== 'string' || !this.croppedImage.startsWith('data:image/') || this.croppedImage.indexOf(',') === -1) {
      if (this.imageFile) {
        this.croppedImage = await this.convertFileToBase64(this.imageFile);
      } else {
        alert('Debes recortar la imagen antes de guardar.');
        return;
      }
    }

    const arr = this.croppedImage.split(',');
    let mime = 'image/png';
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (mimeMatch) {
      mime = mimeMatch[1];
    }
    let bstr;
    try {
      bstr = atob(arr[1]);
    } catch (e) {
      alert('El recorte de la imagen es inválido. Intenta recortar de nuevo.');
      return;
    }
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const file = new File([u8arr], `cropped_image.${this.imageFormat || 'png'}`, { type: mime });

    this.multimediaService.uploadImage(file).subscribe({
      next: (res) => {
        console.log('Imagen subida correctamente al backend:', res);
        alert('Imagen subida correctamente al servidor.');
      },
      error: (err) => {
        console.error('Error al subir imagen al backend:', err);
        alert('Error al subir la imagen al servidor.');
      }
    });

    this.savedImages.push(this.croppedImage);

    const link = document.createElement('a');
    link.href = this.croppedImage;
    link.download = `cropped_image.${this.imageFormat || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  clearImage() {
    this.imageChangedEvent = '';
    this.croppedImage = '';
    this.showCropper = false;
    this.errorMessage = '';
    this.imageFile = null;
    this.rotation = 0;
    this.scale = 1;
  }

  prevImage() {
    this.carouselStartIndex = Math.max(0, this.carouselStartIndex - 1);
  }

  nextImage() {
    this.carouselStartIndex = Math.min(this.savedImages.length - this.visibleImageCount, this.carouselStartIndex + 1);
  }

  get visibleSavedImages(): string[] {
    return this.savedImages.slice(this.carouselStartIndex, this.carouselStartIndex + this.visibleImageCount);
  }

  get showPrevButton(): boolean {
    return this.carouselStartIndex > 0;
  }

  get showNextButton(): boolean {
    return this.carouselStartIndex < this.savedImages.length - this.visibleImageCount;
  }
}