import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ImageService, ImageInfo } from '../../../services/image.service';

@Component({
  selector: 'app-image-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.css']
})
export class ImageListComponent implements OnInit {
  images: ImageInfo[] = [];

  constructor(
    private imageService: ImageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.imageService.getImages().subscribe(images => {
      this.images = images;
    });
  }

  viewImageDetail(imageId: string): void {
    this.imageService.selectImage(imageId);
    this.router.navigate(['/images/detail', imageId]);
  }

  deleteImage(event: Event, imageId: string): void {
    event.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
      this.imageService.deleteImage(imageId);
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
}