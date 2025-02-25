import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { clearToken } from '../../store/auth.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2> <span style="font-family: Arial, Sans-Serif;">Menu</span></h2>
      </div>
      <div class="sidebar-content">
        <ul class="sidebar-menu">
        <li>
            <a routerLink="/landing" routerLinkActive="active" >
              <span style="font-family: Arial, Sans-Serif;">Home</span>
            </a>
          </li>
          <li>
            <a routerLink="/styles" routerLinkActive="active" >
              <span style="font-family: Arial, Sans-Serif;">Personalización</span>
            </a>
          </li>
          <li>
            <a routerLink="/form" routerLinkActive="active">
              <span style="font-family: Arial, Sans-Serif;">Formulario</span>
            </a>
          </li>
           <li>
            <a routerLink="/multimedia" routerLinkActive="active">
              <span style="font-family: Arial, Sans-Serif;">Multimedia</span>
            </a>
          </li>
        </ul>
      </div>
      <div class="sidebar-footer">
        <button class="logout-button" (click)="logout()">
          Cerrar Sesión
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      width: 250px;
      background-color: #0810A6;
      color: #F2F2F2;
      padding: 1rem;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
    }

    .sidebar-header {
      padding: 1rem 0;
      border-bottom: 1px solid #BFBFBF;
    }

    .sidebar-header h2 {
      color: #F2F2F2;
      text-align: center;
      font-size: 1.5rem;
      margin: 0;
    }

    .sidebar-content {
      flex: 1;
    }

    .sidebar-menu {
      list-style: none;
      padding: 0;
      margin: 2rem 0;
    }

    .sidebar-menu li {
      margin: 1rem 0;
    }

    .sidebar-menu a {
      display: block;
      padding: 0.75rem 1rem;
      color: #F2F2F2;
      text-decoration: none;
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }

    .sidebar-menu a:hover {
      background-color: #F25C78;
    }

    .sidebar-menu a.active {
      background-color: #F25C78;
    }

    .sidebar-footer {
      padding: 1rem 0;
      border-top: 1px solid #BFBFBF;
    }

    .logout-button {
      width: 100%;
      padding: 0.75rem 1rem;
      background-color: #F25C78;
      color: #F2F2F2;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      font-size: 1rem;
    }

    .logout-button:hover {
      background-color: #0D0D0D;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 200px;
      }
    }
  `]
})


export class SidebarComponent {

  constructor(private authService: AuthService, private router: Router, private store: Store) {}


  logout() {
    this.store.dispatch(clearToken());
    this.router.navigate(['/login']);
  }
}
