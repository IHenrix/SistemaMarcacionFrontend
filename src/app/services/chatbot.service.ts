import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AuthService } from './auth.service';

export interface ChatMessage {
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatbotRequest {
  message: string;
  token: string;
}

export interface ChatbotResponse {
  success: boolean;
  response: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly chatbotUrl = environment.chatbotUrl;
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  sendMessage(message: string): Observable<ChatbotResponse> {
    const token = this.authService.getToken();

    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    const body: ChatbotRequest = {
      message,
      token
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<ChatbotResponse>(this.chatbotUrl, body, { headers });
  }
}
