import { Component } from '@angular/core';
import {Header} from '../header/header';
import {RouterOutlet} from '@angular/router';
import {Footer} from '../footer/footer';

@Component({
  selector: 'app-contenido',
  imports: [
    Header,
    RouterOutlet,
    Footer
  ],
  templateUrl: './contenido.html',
  styleUrl: './contenido.css'
})
export class Contenido {

}
