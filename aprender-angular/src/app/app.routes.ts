import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { FormularioComponent } from './components/formulario/formulario.component';



export const routes: Routes = [
    {path:'landing', component: LandingComponent},
    {path:'login', component: LoginComponent},
    {path:'form', component:FormularioComponent},
    {path:'', redirectTo:'/landing', pathMatch: 'full' }
];
