import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  private requestCount = 0;

  constructor(private spinner: NgxSpinnerService) { }

  /**
   * Muestra el spinner
   */
  show(): void {
    this.requestCount++;
    this.spinner.show(undefined, {
      type: 'timer',
      size: 'medium',
      bdColor: 'rgba(0, 0, 0, 0.8)',
      color: '#00A5A5',
      fullScreen: true
    });
  }

  /**
   * Oculta el spinner
   */
  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.spinner.hide();
    }
  }

  /**
   * Fuerza el ocultamiento del spinner
   */
  forceHide(): void {
    this.requestCount = 0;
    this.spinner.hide();
  }
}
