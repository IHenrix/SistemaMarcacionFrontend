import { Component, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '@app/services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss'
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private chatbotService = inject(ChatbotService);

  protected isOpen = false;
  protected isLoading = false;
  protected messages: ChatMessage[] = [];
  protected userInput = '';
  private shouldScrollToBottom = false;

  toggleChat(): void {
    this.isOpen = !this.isOpen;

    // Mensaje de bienvenida al abrir por primera vez
    if (this.isOpen && this.messages.length === 0) {
      this.messages.push({
        message: '¡Hola! Soy tu asistente del Sistema de Marcaciones. ¿En qué puedo ayudarte hoy?',
        sender: 'bot',
        timestamp: new Date()
      });
      this.shouldScrollToBottom = true;
    }
  }

  sendMessage(): void {
    const trimmedMessage = this.userInput.trim();

    if (!trimmedMessage || this.isLoading) {
      return;
    }

    // Agregar mensaje del usuario
    this.messages.push({
      message: trimmedMessage,
      sender: 'user',
      timestamp: new Date()
    });

    console.log('Mensaje enviado:', trimmedMessage);
    console.log('Mensajes actuales:', this.messages);

    this.userInput = '';
    this.isLoading = true;
    this.shouldScrollToBottom = true;

    // Enviar al chatbot
    this.chatbotService.sendMessage(trimmedMessage).subscribe({
      next: (response) => {
        console.log('Respuesta recibida:', response);
        const botMessage = response?.response || 'No recibí respuesta del servidor.';

        this.messages.push({
          message: botMessage,
          sender: 'bot',
          timestamp: new Date()
        });

        console.log('Mensajes después de respuesta:', this.messages);
        this.isLoading = false;
        this.shouldScrollToBottom = true;
      },
      error: (error) => {
        console.error('Error completo:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);

        let errorMessage = 'Lo siento, hubo un error al procesar tu mensaje.';

        if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica que n8n esté ejecutándose.';
        } else if (error.status === 401) {
          errorMessage = 'Error de autenticación. Por favor inicia sesión nuevamente.';
        }

        this.messages.push({
          message: errorMessage,
          sender: 'bot',
          timestamp: new Date()
        });
        this.isLoading = false;
        this.shouldScrollToBottom = true;
      }
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
