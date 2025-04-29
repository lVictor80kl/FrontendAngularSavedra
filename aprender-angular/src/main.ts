import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideRouter, withComponentInputBinding } from '@angular/router'; // Importa el enrutador
import { provideStore } from '@ngrx/store';
import { authReducer, authFeatureKey } from './app/store/auth.reducer';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; // Asegúrate de tener un archivo de rutas definido

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule, FormsModule, ReactiveFormsModule),
    provideRouter(routes, withComponentInputBinding()), // Configura las rutas
    provideStore({ [authFeatureKey]: authReducer }) // <-- Provee el store globalmente
  ]
}).catch(err => console.error(err));