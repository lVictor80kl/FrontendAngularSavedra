import { createReducer, on } from '@ngrx/store';
import { setToken, clearToken } from './auth.actions';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const authFeatureKey = 'auth';

export interface AuthState {
  token: string | null;
}

export const initialState: AuthState = {
  token: null,
};

export const authReducer = createReducer(
  initialState,
  on(setToken, (state, { token }) => ({ ...state, token })), // Guarda el token
  on(clearToken, (state) => ({ ...state, token: null })) // Limpia el token
);

export const selectAuthState = createFeatureSelector<AuthState>(authFeatureKey);

export const selectToken = createSelector(
    selectAuthState,
    (state: AuthState) => state.token
  );