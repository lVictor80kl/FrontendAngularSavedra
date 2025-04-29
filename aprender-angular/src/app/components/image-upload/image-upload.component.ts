import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

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
  maxFileSize = 5;

  rotation = 0;
  scale = 1;

  savedImages: string[] = [];
  carouselStartIndex = 0;
  visibleImageCount = 3;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  handleFileChange(event: any): void {
    const { file, errorMessage } = fileChangeEvent(event, this.maxFileSize, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
    this.errorMessage = errorMessage;

    if (file) {
      this.imageFile = file;
      this.imageFileType = file.type;
      this.imageFormat = file.type.split('/')[1];
      this.imageChangedEvent = event;
      this.showCropper = true;
      this.rotation = 0;
      this.scale = 1;
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
      this.errorMessage = `La imagen recortada es demasiado pequeña. Las dimensiones mínimas son ${this.minWidth}x${this.minHeight}px.`;
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

  saveImage() {
    if (this.errorMessage || !this.croppedImage) {
      return;
    }

    this.savedImages.push(this.croppedImage);

    const link = document.createElement('a');
    link.href = this.croppedImage;
    link.download = `cropped_image.${this.imageFormat || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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