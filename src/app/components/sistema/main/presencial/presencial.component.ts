import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedImports } from '../../../../shared/shared/shared.imports';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-presencial',
  templateUrl: './presencial.component.html',
  standalone: true,
  imports: [SharedImports],
  styleUrls: ['./presencial.component.scss'],
})
export class PresencialComponent implements OnInit, OnDestroy {
  protected horaActual = '';
  protected fechaActual = '';

  private readonly router = inject(Router);
  protected fase = 0;
  protected finalizado = false;
  protected textoBoton = 'Iniciar marcación';

  private readonly HORA_INICIO_JORNADA = '07:45 AM';
  private readonly HORA_INICIO_REFRIGERIO = '12:34 PM';
  private readonly HORA_FIN_REFRIGERIO = '01:20 PM';
  private readonly HORA_FIN_JORNADA = '05:05 PM';

  protected inicioJornada: string | null = null;
  protected inicioRefrigerio: string | null = null;
  protected finRefrigerio: string | null = null;
  protected finJornada: string | null = null;

  private temporizador: any;

  ngOnInit(): void {
    this.actualizarHora();
    this.temporizador = setInterval(() => this.actualizarHora(), 1000);
    this.fechaActual = this.formatearFecha(new Date());
  }

  ngOnDestroy(): void {
    clearInterval(this.temporizador);
  }

  siguientePaso(): void {
    const ahora = new Date();
    const horaActualHumana = this.formatearHora(ahora, true);

    switch (this.fase) {
      case 0:
        this.inicioJornada = this.HORA_INICIO_JORNADA;
        this.fase = 1;
        this.textoBoton = 'Iniciar refrigerio';
        this.mostrarAlerta('Inicio de jornada', horaActualHumana);
        break;
      case 1:
        this.inicioRefrigerio = this.HORA_INICIO_REFRIGERIO;
        this.fase = 2;
        this.textoBoton = 'Finalizar refrigerio';
        this.mostrarAlerta('Inicio de refrigerio', horaActualHumana);
        break;
      case 2:
        this.finRefrigerio = this.HORA_FIN_REFRIGERIO;
        this.fase = 3;
        this.textoBoton = 'Finalizar marcación';
        this.mostrarAlerta('Fin de refrigerio', horaActualHumana);
        break;
      case 3:
        this.finJornada = this.HORA_FIN_JORNADA;
        this.finalizado = true;
        this.textoBoton = 'Marcación finalizada';
        this.mostrarResumen();
        break;
    }
  }

  private mostrarAlerta(titulo: string, hora: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Marcación registrada',
      text: `${titulo} realizada correctamente a las ${hora}.`,
      confirmButtonColor: '#00A5A5',
      confirmButtonText: 'Aceptar',
    });
  }

  private mostrarResumen(): void {
    Swal.fire({
      icon: 'success',
      title: 'Marcación finalizada',
      html: `
        <div style="text-align:center;line-height:1.6">
          <div><b>Inicio de jornada:</b> ${this.inicioJornada}</div>
          <div><b>Inicio de refrigerio:</b> ${this.inicioRefrigerio}</div>
          <div><b>Fin de refrigerio:</b> ${this.finRefrigerio}</div>
          <div><b>Fin de marcación:</b> ${this.finJornada}</div>
        </div>
      `,
      confirmButtonColor: '#00A5A5',
      confirmButtonText: 'Aceptar',
    });
  }

  private actualizarHora(): void {
    const ahora = new Date();
    this.horaActual = this.formatearHora(ahora, true);
  }

  private formatearFecha(fecha: Date): string {
    const dd = String(fecha.getDate()).padStart(2, '0');
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const yyyy = fecha.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  private formatearHora(fecha: Date, mostrarSegundos = true): string {
    let horas = fecha.getHours();
    const minutos = fecha.getMinutes();
    const segundos = fecha.getSeconds();
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12 || 12;

    const hh = String(horas).padStart(2, '0');
    const mm = String(minutos).padStart(2, '0');
    const ss = String(segundos).padStart(2, '0');

    return mostrarSegundos
      ? `${hh} : ${mm} : ${ss} ${ampm}`
      : `${hh}:${mm} ${ampm}`;
  }

  protected retornar(): void {
    this.router.navigate(['/menu-principal']);
  }
}
