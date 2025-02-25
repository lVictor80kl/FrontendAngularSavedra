import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import Login from '../models/Login';
import {CV} from '../models/CV';
import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { setToken } from '../store/auth.actions';
import { selectToken } from '../store/auth.reducer';
import { Pallette } from '../models/Color';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private store:Store) {}

  // Método para realizar el login
  login(data: Login): Observable<{message: string; token: string}> {
    return this.http.post<{ message: string; token: string }>(`${this.apiUrl}/auth/login`, data).pipe(
      tap((response) => {
        // Guarda el token en el store
        this.store.dispatch(setToken({ token: response.token }));
      })
    );
  }

  postForm(data:CV): Observable<any>{
    let token: string | null = null;
    this.store.select(selectToken).pipe().subscribe((t) => (token = t));
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Incluye el token en la cabecera
    });

    return this.http.post(`${this.apiUrl}/forms/createform`, data, {headers});
  }

  createPallette(data:any): Observable<any>{
    return this.http.post(`${this.apiUrl}/pallettes/create`, data,)
  }

  getPallettes(id:any): Observable<any>{
    return this.http.get(`${this.apiUrl}/pallettes/get/${id}`)
  }

  deletePallette(id:any): Observable<any>{
    return this.http.delete(`${this.apiUrl}/pallettes/delete/${id}`)
  }

  updatePallette(data:any, id:any): Observable<any>{
    return this.http.patch(`${this.apiUrl}/pallettes/update/${id}`, data)
  }
}