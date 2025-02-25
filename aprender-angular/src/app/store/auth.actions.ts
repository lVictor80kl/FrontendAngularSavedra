import { createAction, props } from '@ngrx/store';

// Acción para guardar el token
export const setToken = createAction(
  '[Auth] Set Token',
  props<{ token: string }>()
);

// Acción para limpiar el token (logout)
export const clearToken = createAction('[Auth] Clear Token');