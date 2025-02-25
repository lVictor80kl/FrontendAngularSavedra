import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme-service.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone:true,
  imports: [RouterLink]
})
export class LandingComponent implements OnInit {

  constructor(private themeService:ThemeService) { }

  ngOnInit(): void {
    this.applyStyles();
    this.themeService.theme$.subscribe(theme => {
      if (theme) {
        this.applyTheme(theme);
      }
    });
  }
  applyTheme(theme: any) {
    // Aplicar los estilos globales
    document.documentElement.style.setProperty('--red', theme.primaryColor);
    document.documentElement.style.setProperty('--white', theme.secondaryColor);
    document.documentElement.style.setProperty('--gray', theme.accentColor);
    // document.documentElement.style.setProperty('--additional-color-1', theme.additionalColor1);
    // document.documentElement.style.setProperty('--additional-color-2', theme.additionalColor2);
    // document.documentElement.style.setProperty('--title-font-size', `${theme.sizeTitle}px`);
    // document.documentElement.style.setProperty('--subtitle-font-size', `${theme.sizeSubtitle}px`);
    // document.documentElement.style.setProperty('--text-font-size', `${theme.sizeText}px`);
    // document.documentElement.style.setProperty('--main-font', theme.mainFont);
    // document.documentElement.style.setProperty('--secondary-font', theme.secondaryFont);
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