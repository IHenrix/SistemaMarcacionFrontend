import { Component, inject, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '@app/services/chatbot.service';
import { SpeechService } from '@app/services/speech.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss'
})
export class ChatbotComponent implements AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('textareaInput') private textareaInput!: ElementRef<HTMLTextAreaElement>;

  private chatbotService = inject(ChatbotService);
  private speechService = inject(SpeechService);

  protected isOpen = false;
  protected isLoading = false;
  protected messages: ChatMessage[] = [];
  protected userInput = '';
  private shouldScrollToBottom = false;

  // Estados de voz
  protected isRecording = false;
  protected isSpeaking = false;
  protected isPaused = false;
  protected isLoadingAudio = false;
  protected speakingMessageIndex: number | null = null;

  private subscriptions: Subscription[] = [];

  constructor() {
    // Subscribirse a eventos de Speech Service
    this.subscriptions.push(
      this.speechService.isRecording$.subscribe(isRecording => {
        this.isRecording = isRecording;
      }),
      this.speechService.isSpeaking$.subscribe(isSpeaking => {
        this.isSpeaking = isSpeaking;
      }),
      this.speechService.isPaused$.subscribe(isPaused => {
        this.isPaused = isPaused;
      }),
      this.speechService.isLoading$.subscribe(isLoading => {
        this.isLoadingAudio = isLoading;
      }),
      this.speechService.recognizedText$.subscribe(text => {
        // Agregar texto reconocido al input
        this.userInput = text;

        // Ajustar altura del textarea después de agregar el texto
        setTimeout(() => {
          if (this.textareaInput) {
            const textarea = this.textareaInput.nativeElement;
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 120);
            textarea.style.height = newHeight + 'px';
          }
        }, 0);
      }),
      this.speechService.autoSendMessage$.subscribe(message => {
        // Auto-enviar mensaje después del silencio
        if (message.trim()) {
          this.userInput = message;
          this.sendMessage();
        }
      }),
      this.speechService.error$.subscribe(error => {
        console.error('Error en Speech Service:', error);
        alert(error);
      }),
      this.speechService.audioEnded$.subscribe(() => {
        // Resetear índice cuando el audio termina completamente
        console.log('Audio terminado - reseteando speakingMessageIndex');
        this.speakingMessageIndex = null;
      })
    );
  }

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

    this.userInput = '';
    this.isLoading = true;
    this.shouldScrollToBottom = true;

    // Resetear altura del textarea
    if (this.textareaInput) {
      this.textareaInput.nativeElement.style.height = 'auto';
    }

    // Enviar al chatbot
    this.chatbotService.sendMessage(trimmedMessage).subscribe({
      next: (response) => {
        const botMessage = response?.response || 'No recibí respuesta del servidor.';

        this.messages.push({
          message: botMessage,
          sender: 'bot',
          timestamp: new Date()
        });

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

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;

    // Reset height to recalculate
    textarea.style.height = 'auto';

    // Set new height based on scrollHeight, with a max of 120px (approx 5 lines)
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = newHeight + 'px';
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

  // Métodos de voz
  toggleRecording(): void {
    if (this.isRecording) {
      // Detener grabación
      this.speechService.stopRecognition();
    } else {
      // Iniciar grabación
      this.speechService.startRecognition();
    }
  }

  speakMessage(message: string, index: number): void {
    console.log('Click en botón de audio. Index:', index, 'Speaking index:', this.speakingMessageIndex);
    console.log('Estados - Loading:', this.isLoadingAudio, 'Speaking:', this.isSpeaking, 'Paused:', this.isPaused);

    // Si es el mismo mensaje
    if (this.speakingMessageIndex === index) {
      // Si está cargando → cancelar
      if (this.isLoadingAudio) {
        console.log('Cancelando carga de audio');
        this.speechService.stopSpeaking();
        this.speakingMessageIndex = null;
        return;
      }

      // Si está hablando → pausar
      if (this.isSpeaking) {
        console.log('Pausando audio');
        this.speechService.pauseSpeaking();
        return;
      }

      // Si está pausado → reanudar
      if (this.isPaused) {
        console.log('Reanudando audio');
        this.speechService.resumeSpeaking();
        return;
      }
    }

    // Si hay otro mensaje reproduciéndose, detenerlo
    this.speechService.stopSpeaking();

    // Marcar este mensaje como el que se está reproduciendo
    this.speakingMessageIndex = index;
    console.log('Iniciando reproducción del mensaje', index);

    // Reproducir el mensaje
    this.speechService.speakText(message).catch(error => {
      console.error('Error al reproducir mensaje:', error);
      // El índice se reseteará automáticamente con el observable audioEnded$
    });
  }

  ngOnDestroy(): void {
    // Limpiar subscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // Limpiar recursos de Speech Service
    this.speechService.dispose();
  }
}
