import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { FormularioComponent } from './components/formulario/formulario.component';
import { PersonalizacionFormComponent } from './components/personalizacion-form/personalizacion-form.component';
import { authGuard } from './auth.guard';
import { ImageListComponent } from './components/images/image-list/image-list.component';
import { ImageDetailComponent } from './components/images/image-detail/image-detail.component';


export const routes: Routes = [
    {path:'landing', component: LandingComponent},
    {path:'login', component: LoginComponent},
    {path:'form', component:FormularioComponent, canActivate: [authGuard]},
    {path: 'styles', component: PersonalizacionFormComponent, canActivate: [authGuard]},
    {path:'', redirectTo:'/landing', pathMatch: 'full' },
    {path: 'images', component: ImageListComponent },
    {path: 'images/detail/:id', component: ImageDetailComponent },
];
