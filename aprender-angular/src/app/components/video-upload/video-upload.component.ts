import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { MultimediaService } from '../../services/multimedia.service';

interface Video {
  id?: string;
  title: string;
  description: string;
  file: File | null;
  subtitles: { language: 'es' | 'en'; file: File; isDefault: boolean }[];
  thumbnailUrl?: string | null;
  url?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type SupportedLanguage = 'es' | 'en';

interface TimedSubtitle {
  id: number;
  text: string;
  startTime: number;
  endTime: number;
}

interface PlayedVideo {
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string | null;
}

@Component({
  selector: 'app-video-upload',
  standalone: true,
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.scss'],
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule]
})
export class VideoUploadComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;

  videoForm: FormGroup;
  videoFile: File | null = null;
  subtitleFiles: { [key: string]: File } = {};
  videoPreviewUrl: string | null = null;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  currentLanguage: SupportedLanguage = 'es';
  languageChangeObserver: MutationObserver | null = null;
  videoPlaybackInterval: any = null;
  currentSubtitleIndex: number = -1;
  currentlyDisplayedSubtitle: string | null = null;

  readonly MAX_VIDEO_SIZE = 50 * 1024 * 1024;
  readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
  readonly ALLOWED_SUBTITLE_TYPES = ['text/vtt', 'application/x-subrip', 'text/plain'];
  readonly SUPPORTED_LANGUAGES = ['es', 'en'] as const;

  timedSubtitles: Record<SupportedLanguage, TimedSubtitle[]> = {
    es: [],
    en: [],
  };

  playedVideos: PlayedVideo[] = [];
  carouselIndex = 0;

  constructor(
    private fb: FormBuilder,
    private multimediaService: MultimediaService,
    private cdr: ChangeDetectorRef
  ) {
    this.videoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      videoFile: [null, Validators.required],
      subtitleEs: [null, Validators.required],
      subtitleEn: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.detectBrowserLanguage();
    this.setupLanguageChangeObserver();
  }

  ngOnDestroy(): void {
    if (this.languageChangeObserver) {
      this.languageChangeObserver.disconnect();
    }
    if (this.videoPreviewUrl) {
      URL.revokeObjectURL(this.videoPreviewUrl);
    }
    this.clearVideoPlaybackInterval();
    this.cleanupSubtitleUrls();
  }

  detectBrowserLanguage(): void {
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (browserLang === 'es' || browserLang === 'en') {
      this.currentLanguage = browserLang as SupportedLanguage;
    } else {
      this.currentLanguage = 'en';
    }
  }

  setupLanguageChangeObserver(): void {
    this.languageChangeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
          const htmlElement = document.querySelector('html');
          if (htmlElement) {
            const newLang = htmlElement.getAttribute('lang')?.split('-')[0].toLowerCase();
            if (newLang === 'es' || newLang === 'en') {
              if (this.currentLanguage !== newLang) {
                this.currentLanguage = newLang as SupportedLanguage;
                if (this.videoPlayerRef?.nativeElement) {
                  this.updateActiveSubtitle(this.videoPlayerRef.nativeElement.currentTime);
                }
              }
            }
          }
        }
      });
    });

    const htmlElement = document.querySelector('html');
    if (htmlElement) {
      this.languageChangeObserver.observe(htmlElement, { attributes: true });
    }
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!this.ALLOWED_VIDEO_TYPES.includes(file.type)) {
        this.errorMessage = 'Formato de video no válido. Por favor, sube un archivo MP4 o WebM.';
        this.videoFile = null;
        this.videoPreviewUrl = null;
        return;
      }

      if (file.size > this.MAX_VIDEO_SIZE) {
        this.errorMessage = `El archivo es demasiado grande. El tamaño máximo permitido es ${this.MAX_VIDEO_SIZE / (1024 * 1024)}MB.`;
        this.videoFile = null;
        this.videoPreviewUrl = null;
        return;
      }

      if (this.videoPreviewUrl) {
        URL.revokeObjectURL(this.videoPreviewUrl);
      }

      this.videoFile = file;
      this.errorMessage = null;
      this.videoPreviewUrl = URL.createObjectURL(file);
      this.videoForm.patchValue({ videoFile: file });

      this.currentSubtitleIndex = -1;
      this.currentlyDisplayedSubtitle = null;
    }
  }

  async onSubtitleSelected(event: Event, language: SupportedLanguage): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (!this.isValidSubtitleFormat(file, fileExtension || '')) {
        this.errorMessage = `Formato de subtítulos no válido para ${language === 'es' ? 'español' : 'inglés'}. Por favor, sube un archivo VTT o SRT.`;
        return;
      }

      try {
        const hasMinLines = await this.multimediaService.validateSubtitlesMinLines(file);

        if (!hasMinLines) {
          this.errorMessage = `El archivo de subtítulos en ${language === 'es' ? 'español' : 'inglés'} debe contener al menos 10 líneas de diálogo.`;
          return;
        }

        this.subtitleFiles[language] = file;
        this.errorMessage = null;

        if (language === 'es') {
          this.videoForm.patchValue({ subtitleEs: file });
        } else {
          this.videoForm.patchValue({ subtitleEn: file });
        }

        await this.parseSubtitles(file, language);

      } catch (error) {
        this.errorMessage = `Error al procesar el archivo de subtítulos: ${error}`;
      }
    }
  }

  isValidSubtitleFormat(file: File, extension: string): boolean {
    return this.ALLOWED_SUBTITLE_TYPES.includes(file.type) ||
           ['vtt', 'srt'].includes(extension);
  }

  cleanupSubtitleUrls(): void {
    Object.keys(this.subtitleFiles).forEach(lang => {
      const url = this.getSubtitleUrl(lang as SupportedLanguage);
      if (url) {
        URL.revokeObjectURL(url);
      }
    });
  }

  getSubtitleUrl(language: SupportedLanguage): string {
    if (this.subtitleFiles[language]) {
      return URL.createObjectURL(this.subtitleFiles[language]);
    }
    return '';
  }

  changeLanguage(language: SupportedLanguage): void {
    if (language !== this.currentLanguage) {
      this.currentLanguage = language;
      this.updateActiveSubtitle(this.videoPlayerRef?.nativeElement?.currentTime || 0);
    }
  }

  onVideoPlay(): void {
    this.clearVideoPlaybackInterval();
    this.videoPlaybackInterval = setInterval(() => {
      if (this.videoPlayerRef?.nativeElement) {
        const currentTime = this.videoPlayerRef.nativeElement.currentTime;
        this.updateActiveSubtitle(currentTime);
      }
    }, 100);
  }

  onVideoPause(): void {
    this.clearVideoPlaybackInterval();
  }

  onVideoEnded(): void {
    this.clearVideoPlaybackInterval();
    this.currentSubtitleIndex = -1;
    this.currentlyDisplayedSubtitle = null;
  }

  clearVideoPlaybackInterval(): void {
    if (this.videoPlaybackInterval) {
      clearInterval(this.videoPlaybackInterval);
      this.videoPlaybackInterval = null;
    }
  }

  updateActiveSubtitle(currentTime: number): void {
    const currentSubtitles = this.timedSubtitles[this.currentLanguage];

    const activeSubtitle = currentSubtitles.find(
      sub => currentTime >= sub.startTime && currentTime <= sub.endTime
    );

    if (activeSubtitle) {
      this.currentlyDisplayedSubtitle = activeSubtitle.text;
    } else {
      this.currentlyDisplayedSubtitle = null;
    }
  }

  async parseSubtitles(file: File, language: SupportedLanguage): Promise<void> {
    const text = await file.text();
    const parsedSubtitles: TimedSubtitle[] = [];
    const lines = text.split(/\r\n|\r|\n/).filter(line => line.trim() !== '' && !line.startsWith('WEBVTT'));
    let i = 0;
    let dialogLineCount = 0;
    while (i < lines.length && dialogLineCount < 10) {
      const timeLine = lines[i].split(' --> ');
      if (timeLine.length === 2) {
        const startTime = this.parseTimeString(timeLine[0]);
        const endTime = this.parseTimeString(timeLine[1]);
        i++;
        let subtitleText = '';
        while (i < lines.length && !lines[i].includes('-->')) {
          subtitleText += lines[i] + ' ';
          i++;
        }
        parsedSubtitles.push({ id: parsedSubtitles.length + 1, text: subtitleText.trim(), startTime: startTime, endTime: endTime });
        dialogLineCount++;
      } else {
        i++;
      }
    }
    this.timedSubtitles[language] = parsedSubtitles.sort((a, b) => a.startTime - b.startTime);
    console.log('Primeras 10 líneas de subtítulos parseadas:', this.timedSubtitles[language]);
  }

  parseTimeString(timeString: string): number {
    const parts = timeString.replace(',', '.').split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const secondsAndMilliseconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + secondsAndMilliseconds;
  }

  generateThumbnailForUpload(callback: () => void): void {
    if (this.videoPlayerRef && this.videoPlayerRef.nativeElement.videoWidth > 0 && this.videoPlayerRef.nativeElement.videoHeight > 0) {
      const video = this.videoPlayerRef.nativeElement;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL('image/jpeg');
      this.playedVideos.unshift({ title: this.videoForm.value.title, description: this.videoForm.value.description, url: URL.createObjectURL(this.videoFile as File), thumbnailUrl: thumbnailUrl });
      callback();
    } else if (this.videoPreviewUrl) {
      const videoElement = document.createElement('video');
      videoElement.src = this.videoPreviewUrl;
      videoElement.addEventListener('loadedmetadata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        canvas.getContext('2d')?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL('image/jpeg');
        this.playedVideos.unshift({ title: this.videoForm.value.title, description: this.videoForm.value.description, url: URL.createObjectURL(this.videoFile as File), thumbnailUrl: thumbnailUrl });
        callback();
      });
    } else {
      callback();
    }
  }

  onSubmit(): void {
    if (this.videoForm.invalid || !this.videoFile || !this.subtitleFiles['es'] || !this.subtitleFiles['en']) {
      this.errorMessage = 'Por favor, completa todos los campos y selecciona los archivos requeridos.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    if (this.videoFile) {
      this.generateThumbnailForUpload(() => {
        const thumbnailUrlToSend = this.playedVideos.length > 0 ? this.playedVideos[0].thumbnailUrl : null;
        const newVideoData: Omit<Video, 'id' | 'url' | 'createdAt' | 'updatedAt'> = {
          title: this.videoForm.value.title,
          description: this.videoForm.value.description,
          file: this.videoFile,
          subtitles: [
            { language: 'es', file: this.subtitleFiles['es'], isDefault: this.currentLanguage === 'es' },
            { language: 'en', file: this.subtitleFiles['en'], isDefault: this.currentLanguage === 'en' },
          ],
          thumbnailUrl: thumbnailUrlToSend,
        };

        this.multimediaService.addVideo(newVideoData).subscribe({
          next: (uploadedVideo: Video) => {
            this.successMessage = 'Video subido correctamente.';
            this.playedVideos.unshift({
              title: uploadedVideo.title,
              description: uploadedVideo.description,
              url: this.videoPreviewUrl || '', // Asegúrate de tener la URL correcta aquí
              thumbnailUrl: uploadedVideo.thumbnailUrl
            });
            this.carouselIndex = 0;
            this.resetForm();
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.errorMessage = 'Ocurrió un error al subir el video. Por favor, inténtalo de nuevo.';
            console.error('Error al subir video:', error);
            this.isSubmitting = false;
            this.cdr.detectChanges();
          },
          complete: () => {
            this.isSubmitting = false;
            this.cdr.detectChanges();
          }
        });
      });
    } else {
      this.errorMessage = 'Por favor, selecciona un archivo de video.';
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  resetForm(): void {
    this.videoForm.reset();
    this.videoFile = null;
    this.subtitleFiles = {};
    this.timedSubtitles = { es: [], en: [] };
    this.currentlyDisplayedSubtitle = null;
    this.currentSubtitleIndex = -1;

    if (this.videoPreviewUrl) {
      URL.revokeObjectURL(this.videoPreviewUrl);
      this.videoPreviewUrl = null;
    }
    setTimeout(() => {
      this.successMessage = null;
      this.cdr.detectChanges();
    }, 5000);
  }

  prevVideo(): void {
    this.carouselIndex = Math.max(0, this.carouselIndex - 1);
  }

  nextVideo(): void {
    this.carouselIndex = Math.min(
      this.playedVideos.length - 1,
      this.carouselIndex + 1
    );
  }

  get currentPlayedVideo(): PlayedVideo | undefined {
    return this.playedVideos[this.carouselIndex];
  }
}