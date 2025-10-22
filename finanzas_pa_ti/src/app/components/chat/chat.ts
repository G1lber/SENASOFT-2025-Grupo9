import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Mensaje {
  tipo: 'bot' | 'usuario';
  texto: string;
}
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit {
  mensajes: ({ tipo: string; texto: string } | { tipo: string; texto: string } | { tipo: string; texto: string } | {
    tipo: string;
    texto: string
  })[] = [];
  nuevoMensaje: string = '';

  ngOnInit() {
    // Simula que recibes los mensajes de un JSON (puede venir de un servicio)
    const jsonMensajes = [
      { tipo: 'bot', texto: '¡Hola! 👋 Soy Dr. Andrés Bot, tu asistente financiero. ¿Cuál es tu objetivo en este momento?' },
      { tipo: 'usuario', texto: 'Comprar una casa en unos años.' },
      { tipo: 'bot', texto: '¡Excelente meta! 🏠 ¿Quieres que te ayude a crear un plan financiero personalizado?' },
      { tipo: 'usuario', texto: 'Sí, quiero crear mi plan.' }
    ];

    this.mensajes = jsonMensajes;
  }

  enviarMensaje() {
    if (this.nuevoMensaje.trim() === '') return;

    // Agrega mensaje del usuario
    this.mensajes.push({ tipo: 'usuario', texto: this.nuevoMensaje });

    // Simula respuesta automática del bot
    setTimeout(() => {
      this.mensajes.push({
        tipo: 'bot',
        texto: 'Gracias por tu mensaje, estoy procesando tu solicitud 🤖 hola '
      });
    }, 1000);

    this.nuevoMensaje = '';
  }

}
