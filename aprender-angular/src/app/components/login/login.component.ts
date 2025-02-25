import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserDataService } from '../../services/user-data.service';
import Login from '../../models/Login'; // Importamos la interfaz Login
import { NgIf } from '@angular/common'; // Importamos NgIf

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf], // Importamos FormsModule directamente aquí
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  // Usamos la interfaz Login para definir el tipo de loginData
  loginData: Login = { email: '', password: '' };

  // Variable para controlar si hay un error en el login
  loginError: boolean = false;
  loginSuccess: boolean = false;

  constructor(private router: Router, private userService: UserDataService) {}

  // Función que se ejecuta al enviar el formulario
  onSubmit() {
    // Reiniciamos el estado de error
    this.loginError = false;
    this.loginSuccess = false;

    // Llamamos al servicio de login y pasamos los datos del formulario
    this.userService.login(this.loginData).subscribe({
      next: (response) => {
        // Si el login es exitoso, redirigimos al usuario a la ruta '/form'
        this.loginSuccess = true
        setTimeout( () => {
          this.router.navigate(['/form']);
        }, 2000)
      },
      error: (error) => {
        // Si hay un error, activamos la bandera de error
        this.loginError = true;
        console.error('Error en el login:', error);
      },
    });
  }
}