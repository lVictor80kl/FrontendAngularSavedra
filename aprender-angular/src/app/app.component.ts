import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router'; // Importa RouterModule para RouterOutlet
import { CommonModule } from '@angular/common'; // Importa CommonModule para directivas comunes de Angular
import { LoadingComponent } from "./components/loading/loading.component";
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, // Necesario para directivas como *ngIf, *ngFor, etc.
    RouterModule, // Necesario para RouterOutlet
    LoadingComponent, // Componente independiente
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'aprender-angular';
}