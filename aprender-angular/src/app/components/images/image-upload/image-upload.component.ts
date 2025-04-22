import { Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild, AfterViewInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ImageService, ImageInfo } from "../../../services/image.service";
import Cropper from 'cropperjs';

@Component({
  selector: "app-image-upload",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./image-upload.component.html",
  styleUrls: ["./image-upload.component.css"],
})
export class ImageUploadComponent implements OnDestroy {
  @Output() uploadComplete = new EventEmitter<ImageInfo>();
  @ViewChild("image") imageElement!: ElementRef<HTMLImageElement>;

  imageSource = "";
  croppedImage = "";
  showCropper = false;

  // Configuración
  maxSize = 5; // MB
  minWidth = 800;
  minHeight = 600;

  errorMessage = "";
  originalFile: File | null = null;
  
  // Usando any para evitar problemas de tipo
  private cropper: any = null;

  constructor(private imageService: ImageService) {}

  ngOnDestroy() {
    this.destroyCropper();
  }

  fileChangeEvent(event: any): void {
    this.errorMessage = "";
    const file = event.target.files[0];

    if (!file) return;

    this.originalFile = file;

    // Validaciones
    if (!this.imageService.isValidImageFormat(file.type)) {
      this.errorMessage = "Formato no válido. Solo se permiten JPG, PNG y WebP.";
      return;
    }

    if (file.size > this.maxSize * 1024 * 1024) {
      this.errorMessage = `El archivo es demasiado grande. Máximo: ${this.maxSize}MB`;
      return;
    }

    // Cargar imagen
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageSource = e.target.result;
      this.showCropper = true;

      // Inicializar cropper después de que la imagen se cargue
      setTimeout(() => {
        this.initCropper();
      }, 500); // Aumentado el tiempo de espera
    };
    reader.readAsDataURL(file);
  }

  initCropper() {
    try {
      if (!this.imageElement || !this.imageElement.nativeElement) {
        console.error("Elemento de imagen no disponible");
        return;
      }

      // Asegurarse de que cualquier instancia anterior se destruya correctamente
      this.destroyCropper();

      // Esperar a que la imagen esté completamente cargada
      const img = this.imageElement.nativeElement;
      
      if (img.complete) {
        this.setupCropper();
      } else {
        img.onload = () => {
          this.setupCropper();
        };
      }
    } catch (error) {
      console.error("Error al inicializar Cropper:", error);
      this.errorMessage = "Error al inicializar el editor de imágenes.";
    }
  }

  setupCropper() {
    try {
      // Asegurarnos de que Cropper existe antes de inicializarlo
      if (!Cropper) {
        console.error("Cropper no está disponible");
        this.errorMessage = "No se pudo cargar la biblioteca de recorte de imágenes.";
        return;
      }

      const img = this.imageElement.nativeElement;
      
      // Crear una nueva instancia de Cropper
      this.cropper = new Cropper(img, {
        viewMode: 1, // Restringir el área de recorte al tamaño del lienzo
        dragMode: 'move', // Permitir mover la imagen dentro del recortador
        aspectRatio: NaN, // Permitir cualquier relación de aspecto
        autoCropArea: 0.8, // El 80% del área de la imagen será recortable por defecto
        restore: false,
        guides: true,
        center: true,
        highlight: true,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        ready: () => {
          console.log("Cropper inicializado correctamente");
          // Actualizar vista previa cuando el cropper esté listo
          this.updatePreview();
        }, 
        crop: () => {
          // Actualizar vista previa en cada cambio
          this.updatePreview();
        }
      }as any); 
    } catch (error) {
      console.error("Error al configurar Cropper:", error);
      this.errorMessage = "Error al configurar el editor de imágenes.";
    }
  }

  updatePreview() {
    if (!this.cropper) {
      console.warn("No hay instancia de Cropper para actualizar vista previa");
      return;
    }
    
    try {
      const canvas = this.cropper.getCroppedCanvas({
        maxWidth: 200,
        maxHeight: 200
      });
      
      if (canvas) {
        this.croppedImage = canvas.toDataURL('image/png');
      }
    } catch (error) {
      console.error("Error al actualizar vista previa:", error);
    }
  }

  destroyCropper() {
    try {
      if (this.cropper) {
        console.log("Destruyendo instancia de Cropper");
        this.cropper.destroy();
        this.cropper = null;
      }
    } catch (error) {
      console.error("Error al destruir cropper:", error);
    }
  }

  rotateLeft() {
    try {
      if (this.cropper) {
        console.log("Rotando a la izquierda");
        this.cropper.rotate(-90);
      } else {
        console.warn("No hay instancia de Cropper para rotar");
      }
    } catch (error) {
      console.error("Error al rotar:", error);
    }
  }

  rotateRight() {
    try {
      if (this.cropper) {
        console.log("Rotating image...");
        this.cropper.rotate(90);
      } else {
        console.warn("No hay instancia de Cropper para rotar");
      }
    } catch (error) {
      console.error("Error al rotar:", error);
    }
  }

  zoomIn() {
    try {
      if (this.cropper) {
        console.log("Acercando zoom");
        this.cropper.zoom(0.1);
      } else {
        console.warn("No hay instancia de Cropper para zoom");
      }
    } catch (error) {
      console.error("Error al hacer zoom:", error);
    }
  }

  zoomOut() {
    try {
      if (this.cropper) {
        console.log("Alejando zoom");
        this.cropper.zoom(-0.1);
      } else {
        console.warn("No hay instancia de Cropper para zoom");
      }
    } catch (error) {
      console.error("Error al hacer zoom:", error);
    }
  }

  saveImage() {
    try {
      if (!this.cropper) {
        console.warn("No hay instancia de Cropper para guardar");
        return;
      }
      
      if (this.errorMessage || !this.originalFile) {
        return;
      }

      // Obtener canvas con máxima calidad
      const canvas = this.cropper.getCroppedCanvas({
        maxWidth: 4096,
        maxHeight: 4096,
        fillColor: "#fff",
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });

      if (canvas) {
        // Convertir a PNG para mantener calidad
        this.croppedImage = canvas.toDataURL("image/png");

        // Verificar dimensiones con una imagen temporal
        const img = new Image();
        img.onload = () => {
          if (img.width < this.minWidth || img.height < this.minHeight) {
            this.errorMessage = `La imagen debe tener al menos ${this.minWidth}x${this.minHeight}px`;
            return;
          }

          // Crear objeto de información de imagen
          const imageInfo: ImageInfo = {
            src: this.croppedImage,
            name: this.originalFile!.name.replace(/\.[^/.]+$/, "") + "_cropped.png",
            type: "image/png",
            size: this.getBase64Size(this.croppedImage),
            width: img.width,
            height: img.height,
            createdAt: new Date(),
          };

          // Guardar en el servicio y emitir evento
          this.imageService.addImage(imageInfo);
          this.uploadComplete.emit(imageInfo);
          this.resetCropper();
        };
        img.src = this.croppedImage;
      }
    } catch (error) {
      console.error("Error al guardar imagen:", error);
      this.errorMessage = "Error al procesar la imagen.";
    }
  }

  resetCropper() {
    this.destroyCropper();
    this.imageSource = "";
    this.croppedImage = "";
    this.showCropper = false;
    this.errorMessage = "";
    this.originalFile = null;
  }

  private getBase64Size(base64String: string): number {
    const base64HeaderLength = base64String.indexOf(',') + 1;
    const stringLength = base64String.length - base64HeaderLength;
    return Math.round((stringLength * 3) / 4);
  }
}