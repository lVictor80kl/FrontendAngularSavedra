import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme-service.service';
import { TangramComponent } from '../tangram/tangram.component';
import { LoadingService } from '../loading/loading.service';
import { ImageListComponent } from '../images/image-list/image-list.component';
import { ImageUploadComponent } from '../images/image-upload/image-upload.component';
import { handleImageUpload } from '../../services/image.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, TangramComponent, ImageListComponent, ImageUploadComponent],
  providers: [ThemeService]
})
export class LandingComponent implements OnInit {
  _loading = inject(LoadingService);

  constructor(private themeService: ThemeService) { 
    this.applyFonts();
  }

  ngOnInit(): void {
    console.log('OnInit');
    this.loadStylesFromLocalStorage();

    this._loading.isLoading.set(true);

    setTimeout(() => {
      this._loading.isLoading.set(false);
    }, 18000);
  }

  applyFonts() {
    const mainFontUrl = localStorage.getItem('mainFontUrl');
    const secondaryFontUrl = localStorage.getItem('secondaryFontUrl');
    let main;
    let secondary;

    if (mainFontUrl && secondaryFontUrl) {
      main = mainFontUrl.split('\\');
      secondary = secondaryFontUrl.split('\\');
      console.log(main, secondary);
    }

    if (main && secondary) {
      const mainUrl = `http://localhost:3000/${main[0]}/${main[1]}`;
      const secondaryUrl = `http://localhost:3000/${secondary[0]}/${secondary[1]}`;
      const fontFace = new FontFace('CustomFont', `url(${mainUrl})`);
      const subFontFace = new FontFace('CustomFontSecondary', `url(${secondaryUrl})`);

      console.log(mainUrl, secondaryUrl);

      fontFace.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        console.log('Font Loaded and Applied');
      }).catch((error) => {
        console.error('Error loading font:', error);
      });

      subFontFace.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        console.log('Secondary Font Loaded and Applied');
      });
    }
  }

  applyTheme(theme: any) {
    console.log('Aplicando tema:', theme);
    document.documentElement.style.setProperty('--primary', theme.primaryColor);
    document.documentElement.style.setProperty('--secondary', theme.secondaryColor);
    document.documentElement.style.setProperty('--white', theme.secondaryColor);
    document.documentElement.style.setProperty('--accent', theme.accentColor);
    document.documentElement.style.setProperty('--additional-color-1', theme.additionalColor1);
    document.documentElement.style.setProperty('--additional-color-2', theme.additionalColor2);
  }

  saveThemeToLocalStorage(theme: any) {
    console.log('Guardando tema en localStorage');
    localStorage.setItem('primaryColor', theme.primaryColor);
    localStorage.setItem('secondaryColor', theme.secondaryColor);
    localStorage.setItem('accentColor', theme.accentColor);
    localStorage.setItem('additionalColor1', theme.additionalColor1);
    localStorage.setItem('additionalColor2', theme.additionalColor2);
    localStorage.setItem('sizeTitle', theme.sizeTitle);
    localStorage.setItem('sizeSubtitle', theme.sizeSubtitle);
    localStorage.setItem('sizeText', theme.sizeText);
    localStorage.setItem('mainFont', theme.mainFont);
    localStorage.setItem('secondaryFont', theme.secondaryFont);
  }

  loadStylesFromLocalStorage(): void {
    console.log('Cargando tema desde localStorage');
    const primaryColor = localStorage.getItem('primaryColor');
    const secondaryColor = localStorage.getItem('secondaryColor');
    const accentColor = localStorage.getItem('accentColor');
    const additionalColor1 = localStorage.getItem('additionalColor1');
    const additionalColor2 = localStorage.getItem('additionalColor2');
    const sizeTitle = `${localStorage.getItem('sizeTitle')}px`;
    const sizeSubtitle = `${localStorage.getItem('sizeSubtitle')}px`;
    const sizeText = `${localStorage.getItem('sizeText')}px`;
    const mainFont = localStorage.getItem('mainFont');
    const secondaryFont = localStorage.getItem('secondaryFont');

    console.log(sizeTitle, sizeSubtitle, sizeText);
    console.log(mainFont, secondaryFont);

    if (primaryColor && secondaryColor && accentColor && additionalColor1 && additionalColor2) {
      document.documentElement.style.setProperty('--primary', primaryColor);
      document.documentElement.style.setProperty('--secondary', secondaryColor);
      document.documentElement.style.setProperty('--accent', accentColor);
      document.documentElement.style.setProperty('--additional-color-1', additionalColor1);
      document.documentElement.style.setProperty('--additional-color-2', additionalColor2);
    }
    if (sizeTitle && sizeSubtitle && sizeText) {
      document.documentElement.style.setProperty('--title-font-size', sizeTitle);
      document.documentElement.style.setProperty('--subtitle-font-size', sizeSubtitle);
      document.documentElement.style.setProperty('--text-font-size', sizeText);
    }
    if (mainFont && secondaryFont) {
      this.applyFonts();
    }

    this.applyStyles();
  }

  applyStyles(): void {
    const serviceSection = document.getElementById('service');
    if (!serviceSection) return;

    const backgroundColor = localStorage.getItem('backgroundColor');
    const textColor = localStorage.getItem('textColor');
    const fontSize = localStorage.getItem('fontSize');

    if (backgroundColor && textColor && fontSize) {
      // Apply background color
      serviceSection.style.backgroundColor = backgroundColor;

      // Apply text color to all text elements
      const textElements = serviceSection.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, .service-card');
      textElements.forEach(element => {
        (element as HTMLElement).style.color = textColor;
      });

      // Apply font size to paragraphs
      const paragraphs = serviceSection.querySelectorAll('p, .service-card .body');
      paragraphs.forEach(element => {
        (element as HTMLElement).style.fontSize = fontSize;
      });

      // Apply larger font size to headings
      const headings = serviceSection.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingSize = (parseInt(fontSize) * 1.5) + 'px';
      headings.forEach(element => {
        (element as HTMLElement).style.fontSize = headingSize;
      });
    }
  }
}