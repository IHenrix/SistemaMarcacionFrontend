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
  private player?: sdk.SpeakerAudioDestination;

  // Observables para estados
  public isRecording$ = new Subject<boolean>();
  public isSpeaking$ = new Subject<boolean>();
  public isPaused$ = new Subject<boolean>();
  public isLoading$ = new Subject<boolean>(); // Nuevo: indica si está cargando desde Azure
  public recognizedText$ = new Subject<string>();
  public error$ = new Subject<string>();
  public autoSendMessage$ = new Subject<string>(); // Nuevo: para auto-envío
  public audioFinished$ = new Subject<void>(); // Emite cuando el audio termina completamente

  private silenceTimer?: any;
  private lastRecognizedText = '';
  private audioEndTimer?: any; // Timer para detectar cuando termina el audio

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
        // Limpiar timer anterior si existe
        this.clearAudioEndTimer();

        // Indicar que está cargando
        this.isLoading$.next(true);
        this.isPaused$.next(false);

        // Eliminar emojis del texto antes de sintetizar
        const cleanText = this.removeEmojis(text);
        console.log('📝 Texto original:', text);
        console.log('🧹 Texto sin emojis:', cleanText);

        // Crear player con control manual
        this.player = new sdk.SpeakerAudioDestination();
        const audioConfig = sdk.AudioConfig.fromSpeakerOutput(this.player);
        this.synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, audioConfig);

        this.synthesizer.speakTextAsync(
          cleanText,
          (result) => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              console.log('✅ Audio sintetizado correctamente - cambiando a isSpeaking');
              // IMPORTANTE: Emitir isSpeaking ANTES de isLoading para evitar race condition
              this.isSpeaking$.next(true);
              this.isLoading$.next(false);

              // Calcular duración del audio en milisegundos
              const audioDuration = result.audioDuration / 10000; // AudioDuration está en ticks (100ns), convertir a ms
              console.log(`⏱️ Duración del audio: ${audioDuration}ms`);

              // Programar evento de fin de audio
              this.audioEndTimer = setTimeout(() => {
                console.log('🎵 Audio terminado por duración - reseteando estados');
                this.isLoading$.next(false);
                this.isSpeaking$.next(false);
                this.isPaused$.next(false);
                this.synthesizer?.close();
                this.synthesizer = undefined;
                this.player = undefined;
                // Emitir DESPUÉS de actualizar todos los estados
                setTimeout(() => {
                  console.log('🔔 Emitiendo audioFinished$');
                  this.audioFinished$.next();
                }, 0);
                resolve();
              }, audioDuration);
            } else {
              console.error('❌ Error en síntesis:', result.errorDetails);
              this.error$.next(`Error en síntesis: ${result.errorDetails}`);
              this.isLoading$.next(false);
              this.isSpeaking$.next(false);
              this.synthesizer?.close();
              this.synthesizer = undefined;
              this.player = undefined;
              reject(result.errorDetails);
            }
          },
          (error) => {
            console.error('❌ Error al sintetizar audio:', error);
            this.error$.next(`Error: ${error}`);
            this.isLoading$.next(false);
            this.isSpeaking$.next(false);
            this.synthesizer?.close();
            this.synthesizer = undefined;
            this.player = undefined;
            reject(error);
          }
        );
      } catch (error) {
        console.error('❌ Error al configurar síntesis:', error);
        this.error$.next('Error al reproducir audio');
        this.isLoading$.next(false);
        this.isSpeaking$.next(false);
        reject(error);
      }
    });
  }

  /**
   * Pausa la reproducción de audio
   */
  pauseSpeaking(): void {
    if (this.player) {
      try {
        this.player.pause();
        this.isPaused$.next(true);
        this.isSpeaking$.next(false);
        console.log('Audio pausado');
      } catch (error) {
        console.error('Error al pausar audio:', error);
      }
    }
  }

  /**
   * Reanuda la reproducción de audio
   */
  resumeSpeaking(): void {
    if (this.player) {
      try {
        this.player.resume();
        this.isPaused$.next(false);
        this.isSpeaking$.next(true);
        console.log('Audio reanudado');
      } catch (error) {
        console.error('Error al reanudar audio:', error);
      }
    }
  }

  /**
   * Detiene completamente la reproducción de audio
   * @param emitFinished Si debe emitir el evento audioFinished$ (default: false)
   */
  stopSpeaking(emitFinished: boolean = false): void {
    // Limpiar timer de fin de audio
    this.clearAudioEndTimer();

    if (this.player) {
      try {
        this.player.pause();
      } catch (error) {
        console.error('Error al pausar player:', error);
      }
    }

    if (this.synthesizer) {
      try {
        this.synthesizer.close();
      } catch (error) {
        console.error('Error al cerrar synthesizer:', error);
      }
      this.synthesizer = undefined;
    }

    this.player = undefined;
    this.isLoading$.next(false);
    this.isSpeaking$.next(false);
    this.isPaused$.next(false);

    // Solo emitir si se indica explícitamente
    if (emitFinished) {
      setTimeout(() => this.audioFinished$.next(), 0);
    }
  }

  /**
   * Verifica si hay audio cargando o reproduciéndose
   */
  isSpeakingNow(): boolean {
    return this.synthesizer !== undefined || this.player !== undefined;
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
   * Limpia el timer de fin de audio
   */
  private clearAudioEndTimer(): void {
    if (this.audioEndTimer) {
      clearTimeout(this.audioEndTimer);
      this.audioEndTimer = undefined;
    }
  }

  /**
   * Elimina emojis del texto
   * Utiliza regex para remover todos los emojis Unicode
   */
  private removeEmojis(text: string): string {
    // Regex que cubre los rangos Unicode de emojis
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{231A}\u{231B}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2934}\u{2935}\u{2B05}-\u{2B07}\u{2B1B}\u{2B1C}\u{3030}\u{303D}\u{3297}\u{3299}\u{FE0F}\u{200D}]/gu;

    // Remover emojis y limpiar espacios múltiples
    return text.replace(emojiRegex, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Limpia recursos
   */
  dispose(): void {
    this.clearSilenceTimer();
    this.clearAudioEndTimer();
    this.stopRecognition();
    this.stopSpeaking();
  }
}
