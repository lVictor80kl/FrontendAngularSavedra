import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectToken } from '../store/auth.reducer';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private store: Store) {}

  isAuthenticated() {
    return this.store.select(selectToken).pipe(
      map((token) => !!token) 
    );
  }
}