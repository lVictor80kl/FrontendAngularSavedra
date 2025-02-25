import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root', // Esto asegura que el servicio sea singleton
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<any>(null);
  theme$ = this.themeSubject.asObservable();

  constructor() {}

  applyTheme(theme: any) {
    this.themeSubject.next(theme);
  }

  
}
