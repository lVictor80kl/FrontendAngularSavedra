import { Component, inject, signal } from '@angular/core';
import { TangramComponent } from '../tangram/tangram.component';
import { LoadingService } from './loading.service';

@Component({
  selector: 'app-loading',
  imports: [TangramComponent],
  standalone: true,
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css'
})
export class LoadingComponent {
  loading = inject(LoadingService)
}
