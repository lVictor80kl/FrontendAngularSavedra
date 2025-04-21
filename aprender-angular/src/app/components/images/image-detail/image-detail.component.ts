import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageService, ImageInfo } from '../../../services/image.service';

@Component({
  selector: 'app-image-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-detail.component.html',
  styleUrls: ['./image-detail.component.css']
})
export class ImageDetailComponent implements OnInit {
  image: ImageInfo | null = null;

  constructor(
    private imageService: ImageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const imageId = params['id'];
      if (imageId) {
        this.imageService.selectImage(imageId);
        this.imageService.selectedImage$.subscribe(image => {
          this.image = image;
          if (!image) {
            // Si no se encuentra la imagen, redirigir a la lista
            this.router.navigate(['/images']);
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/images']);
  }

  deleteImage(): void {
    if (this.image && confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
      this.imageService.deleteImage(this.image.id!);
      this.router.navigate(['/images']);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return bytes + ' bytes';
    } else if (bytes < 1048576) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / 1048576).toFixed(1) + ' MB';
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Desconocido';
    return new Date(date).toLocaleString();
  }
}