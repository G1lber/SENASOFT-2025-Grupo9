import {Routes} from '@angular/router';
import {Contenido} from './components/contenido/contenido';
import {Header} from './components/header/header';
import {Chat} from './components/chat/chat';

function authGuard() {

}

export const routes: Routes = [
  { path: '',
  component: Contenido
},
  {
    path: 'asesor',
    component: Contenido,
    canActivate: [authGuard],
    children: [
      {path: 'asesor', component: Chat},

    ]
  },
  {path: '**', redirectTo: ''}
];
