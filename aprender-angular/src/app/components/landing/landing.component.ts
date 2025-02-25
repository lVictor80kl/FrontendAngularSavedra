import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme-service.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  imports: [RouterLink],
  providers: [ThemeService]
})
export class LandingComponent implements OnInit {

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    console.log('OnInit');
    this.loadStylesFromLocalStorage();
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
      document.documentElement.style.setProperty('--main-font', mainFont);
      document.documentElement.style.setProperty('--secondary-font', secondaryFont);
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