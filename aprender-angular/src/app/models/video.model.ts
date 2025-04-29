// models/video.model.ts

export interface Subtitle {
  language: 'es' | 'en';
  file: File;
  isDefault: boolean; // Asegúrate de que esta propiedad esté definida
}

export interface Video {
  id?: string;
  title: string;
  description: string;
  file: File | null; // Permitir null
  subtitles: Subtitle[];
  thumbnailUrl?: string | null;
  url?: string;
  createdAt?: Date;
  updatedAt?: Date;
}