import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import Login from '../models/login';
import {CV} from '../models/CV';
@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Método para realizar el login
  login(data: Login): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  postForm(data:CV): Observable<any>{
    return this.http.post(`${this.apiUrl}/forms/createform`, data);
  }
}