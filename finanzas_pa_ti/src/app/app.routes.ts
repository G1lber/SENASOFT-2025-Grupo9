import { Routes } from '@angular/router';
import { Contenido } from './components/contenido/contenido';
import { Login } from './components/login/login';
import { Chat } from './components/chat/chat';

export function authGuard() {
  return true;
}

export const routes: Routes = [
  {
    path: '',
    component: Login
  },
  {
    path: 'inicio',
    component: Contenido,
    children: [
      { path: 'asesor', component: Chat }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
