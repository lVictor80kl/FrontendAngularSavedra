import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  private apiUrl = 'https://api.ejemplo.com/data';

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  postData(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
