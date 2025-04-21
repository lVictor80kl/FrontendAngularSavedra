import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tangram',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tangram.component.html',
  styleUrls: ['./tangram.component.css']
})
export class TangramComponent implements OnInit, OnDestroy {
  currentShape = 0;
  nextShape = 1;
  isAnimating = false;
  showNextShape = false;
  private interval: any;

  ngOnInit(): void {
    // Mostrar la primera figura al inicio
    this.currentShape = 0;
    this.nextShape = 1;
    
    this.interval = setInterval(() => {
      // Activar la animación para la transición a la siguiente figura
      this.isAnimating = true;
      this.showNextShape = false;
      
      // Después de que termine la animación, actualizar la figura actual
      // y preparar la siguiente
      setTimeout(() => {
        this.showNextShape = true;
        
        setTimeout(() => {
          this.isAnimating = false;
          this.currentShape = this.nextShape;
          this.nextShape = (this.nextShape + 1) % 3;
        }, 100); // Pequeño retraso para asegurar la transición suave
        
      }, 1000); // Duración de la animación
      
    }, 1000); // Tiempo total entre cambios de figura
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}