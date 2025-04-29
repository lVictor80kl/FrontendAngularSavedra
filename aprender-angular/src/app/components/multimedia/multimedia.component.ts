import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { VideoUploadComponent } from '../video-upload/video-upload.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-multimedia',
  standalone: true,
  imports: [CommonModule, ImageUploadComponent, VideoUploadComponent, SidebarComponent],
  templateUrl: './multimedia.component.html',
  styleUrls: ['./multimedia.component.css']
})
export class MultimediaComponent implements OnInit {
  images: string[] = [
    'assets/imgs/advertising-1.jpg',
    'assets/imgs/advertising-2.jpg',
    'assets/imgs/advertising-3.jpg',
    'assets/imgs/advertising-4.jpg',
    'assets/imgs/branding-1.jpg',
    'assets/imgs/branding-2.jpg',
    'assets/imgs/branding-3.jpg',
    'assets/imgs/branding-4.jpg',
    'assets/imgs/branding-5.jpg',
    'assets/imgs/web-1.jpg',
    'assets/imgs/web-2.jpg',
    'assets/imgs/web-3.jpg',
    'assets/imgs/web-4.jpg',
  ];
  currentIndex = 0;
  intervalId: any;

  ngOnInit() {
    this.startCarousel();
  }

  startCarousel() {
    this.intervalId = setInterval(() => {
      this.next();
    }, 2500);
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
