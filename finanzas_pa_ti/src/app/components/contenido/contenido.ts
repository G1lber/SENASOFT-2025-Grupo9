import { Component } from '@angular/core';
import {Header} from '../header/header';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-contenido',
  imports: [
    Header,
    RouterOutlet
  ],
  templateUrl: './contenido.html',
  styleUrl: './contenido.css'
})
export class Contenido {

}
