import { Injectable } from '@angular/core';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { environment } from '@env/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private speechConfig: sdk.SpeechConfig;
  private audioConfig: sdk.AudioConfig;
  private recognizer?: sdk.SpeechRecognizer;
  private synthesizer?: sdk.SpeechSynthesizer;

  // Observables para estados
  public isRecording$ = new Subject<boolean>();
  public isSpeaking$ = new Subject<boolean>();
  public recognizedText$ = new Subject<string>();
  public error$ = new Subject<string>();
  public autoSendMessage$ = new Subject<string>(); // Nuevo: para auto-envío

  private silenceTimer?: any;
  private lastRecognizedText = '';

  constructor() {
    // Configurar Speech Services
    this.speechConfig = sdk.SpeechConfig.fromSubscription(
      environment.azureSpeech.apiKey,
      environment.azureSpeech.region
    );

    // Configurar idioma español de Perú
    this.speechConfig.speechRecognitionLanguage = 'es-PE';
    this.speechConfig.speechSynthesisLanguage = 'es-PE';

    // Voz femenina en español
    this.speechConfig.speechSynthesisVoiceName = 'es-PE-CamilaNeural';

    // Configurar audio del micrófono
    this.audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
  }

  /**
   * Inicia el reconocimiento de voz (Speech-to-Text)
   * Escucha continuamente hasta que se llame stopRecognition()
   */
  startRecognition(): void {
    try {
      // Crear reconocedor
      this.recognizer = new sdk.SpeechRecognizer(this.speechConfig, this.audioConfig);

      this.isRecording$.next(true);

      // Evento cuando se reconoce texto
      this.recognizer.recognized = (_s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          console.log('Texto reconocido:', e.result.text);
          this.lastRecognizedText = e.result.text;
          this.recognizedText$.next(e.result.text);

          // Reiniciar timer de silencio (2 segundos sin hablar = auto-enviar)
          this.resetSilenceTimer();
        } else if (e.result.reason === sdk.ResultReason.NoMatch) {
          console.log('No se reconoció ningún texto');
        }
      };

      // Evento de error
      this.recognizer.canceled = (_s, e) => {
        console.error('Error en reconocimiento:', e.errorDetails);
        this.error$.next(`Error: ${e.errorDetails}`);
        this.isRecording$.next(false);
        this.clearSilenceTimer();
        this.recognizer?.close();
      };

      // Iniciar reconocimiento continuo
      this.recognizer.startContinuousRecognitionAsync(
        () => {
          console.log('Reconocimiento iniciado');
        },
        (error) => {
          console.error('Error al iniciar reconocimiento:', error);
          this.error$.next(`Error al iniciar: ${error}`);
          this.isRecording$.next(false);
        }
      );
    } catch (error) {
      console.error('Error al configurar reconocimiento:', error);
      this.error$.next('Error al configurar el micrófono');
      this.isRecording$.next(false);
    }
  }

  /**
   * Detiene el reconocimiento de voz
   */
  stopRecognition(): void {
    this.clearSilenceTimer();
    this.lastRecognizedText = '';

    if (this.recognizer) {
      this.recognizer.stopContinuousRecognitionAsync(
        () => {
          console.log('Reconocimiento detenido');
          this.isRecording$.next(false);
          this.recognizer?.close();
          this.recognizer = undefined;
        },
        (error) => {
          console.error('Error al detener reconocimiento:', error);
          this.isRecording$.next(false);
        }
      );
    }
  }

  /**
   * Sintetiza texto a voz (Text-to-Speech)
   * @param text Texto a convertir en audio
   */
  speakText(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Crear sintetizador
        const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
        this.synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, audioConfig);

        this.isSpeaking$.next(true);

        this.synthesizer.speakTextAsync(
          text,
          (result) => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              console.log('Audio sintetizado correctamente');
              this.isSpeaking$.next(false);
              this.synthesizer?.close();
              this.synthesizer = undefined;
              resolve();
            } else {
              console.error('Error en síntesis:', result.errorDetails);
              this.error$.next(`Error en síntesis: ${result.errorDetails}`);
              this.isSpeaking$.next(false);
              this.synthesizer?.close();
              this.synthesizer = undefined;
              reject(result.errorDetails);
            }
          },
          (error) => {
            console.error('Error al sintetizar audio:', error);
            this.error$.next(`Error: ${error}`);
            this.isSpeaking$.next(false);
            this.synthesizer?.close();
            this.synthesizer = undefined;
            reject(error);
          }
        );
      } catch (error) {
        console.error('Error al configurar síntesis:', error);
        this.error$.next('Error al reproducir audio');
        this.isSpeaking$.next(false);
        reject(error);
      }
    });
  }

  /**
   * Detiene la reproducción de audio
   */
  stopSpeaking(): void {
    if (this.synthesizer) {
      this.synthesizer.close();
      this.synthesizer = undefined;
      this.isSpeaking$.next(false);
    }
  }

  /**
   * Reinicia el timer de silencio
   * Se llama cada vez que se reconoce texto
   */
  private resetSilenceTimer(): void {
    this.clearSilenceTimer();

    // Después de 2 segundos de silencio, auto-enviar mensaje
    this.silenceTimer = setTimeout(() => {
      if (this.lastRecognizedText.trim()) {
        console.log('Silencio detectado. Auto-enviando mensaje...');
        this.autoSendMessage$.next(this.lastRecognizedText);
        this.stopRecognition();
        this.lastRecognizedText = '';
      }
    }, 2000); // 2 segundos de silencio
  }

  /**
   * Limpia el timer de silencio
   */
  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = undefined;
    }
  }

  /**
   * Limpia recursos
   */
  dispose(): void {
    this.clearSilenceTimer();
    this.stopRecognition();
    this.stopSpeaking();
  }
}
