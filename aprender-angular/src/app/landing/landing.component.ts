import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
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