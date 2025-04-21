import { Component, type ElementRef, EventEmitter, type OnDestroy, Output, ViewChild } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import type { ImageService, ImageInfo } from "../../../services/image.service"


@Component({
  selector: "app-image-upload",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./image-upload.component.html",
  styleUrls: ["./image-upload.component.css"],
})
export class ImageUploadComponent implements OnDestroy {
  @Output() uploadComplete = new EventEmitter<ImageInfo>()
  @ViewChild("image") imageElement!: ElementRef

  imageSource = ""
  croppedImage = ""
  showCropper = false

  // Configuración
  maxSize = 5 // MB
  minWidth = 800
  minHeight = 600

  errorMessage = ""
  originalFile: File | null = null

  // Usar tipo any para evitar errores de TypeScript
  private cropper: any = null

  constructor(private imageService: ImageService) {}

  ngOnDestroy() {
    this.destroyCropper()
  }

  fileChangeEvent(event: any): void {
    this.errorMessage = ""
    const file = event.target.files[0]

    if (!file) return

    this.originalFile = file

    // Validaciones
    if (!this.imageService.isValidImageFormat(file.type)) {
      this.errorMessage = "Formato no válido. Solo se permiten JPG, PNG y WebP."
      return
    }

    if (file.size > this.maxSize * 1024 * 1024) {
      this.errorMessage = `El archivo es demasiado grande. Máximo: ${this.maxSize}MB`
      return
    }

    // Cargar imagen
    const reader = new FileReader()
    reader.onload = (e: any) => {
      this.imageSource = e.target.result
      this.showCropper = true

      // Inicializar cropper después de que la imagen se cargue
      setTimeout(() => {
        this.initCropper()
      }, 100)
    }
    reader.readAsDataURL(file)
  }

  initCropper() {
    try {
      if (this.imageElement && this.imageElement.nativeElement) {
        this.destroyCropper()

        // Usar importación dinámica para evitar errores
        import("cropperjs").then((CropperModule) => {
          this.cropper = new CropperModule.default(this.imageElement.nativeElement, {
            viewMode: 1,
            dragMode: "move",
            autoCropArea: 1,
            restore: false,
            modal: true,
            guides: true,
            highlight: true,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
          })
        })
      }
    } catch (error) {
      console.error("Error al inicializar Cropper:", error)
      this.errorMessage = "Error al inicializar el editor de imágenes."
    }
  }

  destroyCropper() {
    try {
      if (this.cropper) {
        this.cropper.destroy()
        this.cropper = null
      }
    } catch (error) {
      console.error("Error al destruir cropper:", error)
    }
  }

  rotateLeft() {
    try {
      if (this.cropper) {
        this.cropper.rotate(-90)
      }
    } catch (error) {
      console.error("Error al rotar:", error)
    }
  }

  rotateRight() {
    try {
      if (this.cropper) {
        this.cropper.rotate(90)
      }
    } catch (error) {
      console.error("Error al rotar:", error)
    }
  }

  zoomIn() {
    try {
      if (this.cropper) {
        this.cropper.zoom(0.1)
      }
    } catch (error) {
      console.error("Error al hacer zoom:", error)
    }
  }

  zoomOut() {
    try {
      if (this.cropper) {
        this.cropper.zoom(-0.1)
      }
    } catch (error) {
      console.error("Error al hacer zoom:", error)
    }
  }

  saveImage() {
    try {
      if (this.cropper && !this.errorMessage && this.originalFile) {
        // Obtener canvas
        const canvas = this.cropper.getCroppedCanvas({
          maxWidth: 4096,
          maxHeight: 4096,
          fillColor: "#fff",
          imageSmoothingEnabled: true,
          imageSmoothingQuality: "high",
        })

        if (canvas) {
          this.croppedImage = canvas.toDataURL("image/png")

          // Verificar dimensiones
          const img = new Image()
          img.onload = () => {
            if (img.width < this.minWidth || img.height < this.minHeight) {
              this.errorMessage = `La imagen debe tener al menos ${this.minWidth}x${this.minHeight}px`
              return
            }

            // Crear objeto de imagen
            const imageInfo: ImageInfo = {
              src: this.croppedImage,
              name: this.originalFile!.name,
              type: "image/png",
              size: this.getBase64Size(this.croppedImage),
              width: img.width,
              height: img.height,
              createdAt: new Date(),
            }

            // Guardar y emitir
            this.imageService.addImage(imageInfo)
            this.uploadComplete.emit(imageInfo)
            this.resetCropper()
          }
          img.src = this.croppedImage
        }
      }
    } catch (error) {
      console.error("Error al guardar imagen:", error)
      this.errorMessage = "Error al procesar la imagen."
    }
  }

  resetCropper() {
    this.destroyCropper()
    this.imageSource = ""
    this.croppedImage = ""
    this.showCropper = false
    this.errorMessage = ""
    this.originalFile = null
  }

  private getBase64Size(base64String: string): number {
    const stringLength = base64String.length - "data:image/png;base64,".length
    return Math.round((stringLength * 3) / 4)
  }
}
