import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SharedImports } from '@app/shared/shared.imports';
import { MarcacionItem, MarcacionService, TipoMarcacion } from '@app/services/marcacion.service';
import { UsuarioService } from '@app/services/usuario.service';

@Component({
  selector: 'app-presencial',
  standalone: true,
  imports: [SharedImports],
  styleUrls: ['./presencial.scss'],
  templateUrl: './presencial.html',
})
export class PresencialComponent implements OnInit, OnDestroy {
  protected horaActual = '';
  protected fechaActual = '';
  protected sinPerfil = false;

  private readonly router = inject(Router);
  private readonly marcacionService = inject(MarcacionService);
  private readonly usuarioService = inject(UsuarioService);

  protected fase = 0;
  protected finalizado = false;
  protected textoBoton = 'Iniciar marcacion';

  protected inicioJornada: string | null = null;
  protected inicioRefrigerio: string | null = null;
  protected finRefrigerio: string | null = null;
  protected finJornada: string | null = null;
  protected tardanzaMensaje: string | null = null;
  protected tardanzaActual = false;

  private temporizador: any;

  ngOnInit(): void {
    this.actualizarHora();
    this.temporizador = setInterval(() => this.actualizarHora(), 1000);
    this.fechaActual = this.formatearFecha(new Date());
    this.verificarPerfil();
    this.cargarResumenHoy();
  }

  ngOnDestroy(): void {
    clearInterval(this.temporizador);
  }

  siguientePaso(): void {
    if (this.sinPerfil) {
      Swal.fire({
        icon: 'warning',
        title: 'Perfil incompleto',
        text: 'No puedes marcar porque tu usuario no tiene una persona asociada.',
        confirmButtonColor: '#00A5A5',
      });
      return;
    }

    const ahora = new Date();
    const horaActualHumana = this.formatearHora(ahora, false);
    const fechaISO = this.fechaISO(ahora);

    switch (this.fase) {
      case 0:
        this.registrarBackend('ENTRADA', fechaISO, ahora, () => {
          this.inicioJornada = horaActualHumana;
          this.evaluarTardanza('ENTRADA', horaActualHumana);
          this.fase = 1;
          this.textoBoton = 'Iniciar refrigerio';
          this.mostrarAlerta('Inicio de jornada', horaActualHumana);
        });
        break;
      case 1:
        this.registrarBackend('INICIO_REFRI', fechaISO, ahora, () => {
          this.inicioRefrigerio = horaActualHumana;
          this.evaluarTardanza('INICIO_REFRI', horaActualHumana);
          this.fase = 2;
          this.textoBoton = 'Finalizar refrigerio';
          this.mostrarAlerta('Inicio de refrigerio', horaActualHumana);
        });
        break;
      case 2:
        this.registrarBackend('FIN_REFRI', fechaISO, ahora, () => {
          this.finRefrigerio = horaActualHumana;
          this.evaluarTardanza('FIN_REFRI', horaActualHumana);
          this.fase = 3;
          this.textoBoton = 'Finalizar marcacion';
          this.mostrarAlerta('Fin de refrigerio', horaActualHumana);
        });
        break;
      case 3:
        this.registrarBackend('SALIDA', fechaISO, ahora, () => {
          this.finJornada = horaActualHumana;
          this.evaluarTardanza('SALIDA', horaActualHumana);
          this.finalizado = true;
          this.textoBoton = 'Marcacion finalizada';
          this.mostrarResumen();
        });
        break;
    }
  }

  private mostrarAlerta(titulo: string, hora: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Marcacion registrada',
      text: `${titulo} realizada correctamente a las ${hora}.`,
      confirmButtonColor: '#00A5A5',
      confirmButtonText: '<span style="padding: 0 15px;">Aceptar</span>',
    });
  }

  private mostrarResumen(): void {
    Swal.fire({
      icon: 'success',
      title: 'Marcacion finalizada',
      html: `
        <div style="text-align:center;line-height:1.6">
          <div><b>Inicio de jornada:</b> ${this.inicioJornada}</div>
          <div><b>Inicio de refrigerio:</b> ${this.inicioRefrigerio}</div>
          <div><b>Fin de refrigerio:</b> ${this.finRefrigerio}</div>
          <div><b>Fin de marcacion:</b> ${this.finJornada}</div>
        </div>
      `,
      confirmButtonColor: '#00A5A5',
      confirmButtonText: '<span style="padding: 0 15px;">Aceptar</span>',
    });
  }

  private actualizarHora(): void {
    const ahora = new Date();
    this.horaActual = this.formatearHora(ahora, true);
  }

  private registrarBackend(tipo: TipoMarcacion, fechaISO: string, horaDate: Date, onSuccess: () => void) {
    const hora = this.formatearHora24(horaDate);
    this.marcacionService.registrar({ tipo, fecha: fechaISO, hora }).subscribe({
      next: () => onSuccess(),
      error: (err) =>
        Swal.fire({
          icon: 'error',
          title: 'No se pudo registrar la marcacion',
          text: err.error?.message || 'Intenta nuevamente.',
          confirmButtonColor: '#00A5A5',
        }),
    });
  }

  private formatearHora24(fecha: Date): string {
    const hh = String(fecha.getHours()).padStart(2, '0');
    const mm = String(fecha.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private fechaISO(fecha: Date): string {
    return fecha.toISOString().slice(0, 10);
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

    return mostrarSegundos ? `${hh} : ${mm} : ${ss} ${ampm}` : `${hh}:${mm} ${ampm}`;
  }

  private formatearHoraDemo(hhmm24: string) {
    const [h, m] = hhmm24.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return this.formatearHora(date, false);
  }

  protected retornar(): void {
    this.router.navigate(['/menu-principal']);
  }

  private cargarResumenHoy() {
    this.marcacionService.resumenHoy().subscribe({
      next: (res) => {
        const datos = res.data;
        if (!datos || !datos.marcaciones || datos.marcaciones.length === 0) return;

        let ultimaFase = 0;
        for (const m of datos.marcaciones) {
          const horaHumana = this.formatearHoraDemo(m.hora);
          switch (m.tipo) {
            case 'ENTRADA':
              this.inicioJornada = horaHumana;
              ultimaFase = Math.max(ultimaFase, 1);
              this.evaluarTardanza('ENTRADA', horaHumana);
              break;
            case 'INICIO_REFRI':
              this.inicioRefrigerio = horaHumana;
              ultimaFase = Math.max(ultimaFase, 2);
              this.evaluarTardanza('INICIO_REFRI', horaHumana);
              break;
            case 'FIN_REFRI':
              this.finRefrigerio = horaHumana;
              ultimaFase = Math.max(ultimaFase, 3);
              this.evaluarTardanza('FIN_REFRI', horaHumana);
              break;
            case 'SALIDA':
              this.finJornada = horaHumana;
              ultimaFase = Math.max(ultimaFase, 4);
              this.finalizado = true;
              this.evaluarTardanza('SALIDA', horaHumana);
              break;
          }
        }

        this.fase = ultimaFase;

        // Actualizar texto del botón según la fase
        if (this.finalizado) {
          this.textoBoton = 'Marcacion finalizada';
        } else {
          const textos = ['Iniciar marcacion', 'Iniciar refrigerio', 'Finalizar refrigerio', 'Finalizar marcacion'];
          this.textoBoton = textos[this.fase];
        }
      },
      error: () => {
        // silencioso
      },
    });
  }

  private evaluarTardanza(tipo: TipoMarcacion, horaHumana: string) {
    const objetivo: Record<TipoMarcacion, string> = {
      ENTRADA: '08:00',
      INICIO_REFRI: '13:00',
      FIN_REFRI: '14:00',
      SALIDA: '17:00',
    };
    const esperado = objetivo[tipo];
    if (!esperado) {
      this.tardanzaMensaje = null;
      this.tardanzaActual = false;
      return;
    }
    const minutosEsperado = this.aMinutos(esperado);
    const minutosReal = this.aMinutos(this.desformatearHora(horaHumana));
    const diff = minutosReal - minutosEsperado;
    const tolerancia = 5; // minutos de gracia
    if (diff > tolerancia) {
      this.tardanzaActual = true;
      this.tardanzaMensaje = `Tardanza de ${diff} min (esperado ${esperado}, registrado ${horaHumana})`;
    } else {
      this.tardanzaActual = false;
      this.tardanzaMensaje = null;
    }
  }

  private aMinutos(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  private desformatearHora(horaHumana: string): string {
    // convierte "08:15 AM" o "08:15" a "08:15"
    const match = horaHumana.match(/(\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
    return horaHumana;
  }

  private verificarPerfil() {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (res) => {
        this.sinPerfil = !res.success || !res.data || !res.data.id;
      },
      error: () => {
        this.sinPerfil = true;
      },
    });
  }
}








