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
  protected pruebaExposicion = 1; // 0: normal, 1: demo paso a paso
  protected sinPerfil = false;
  protected bloqueoMarcacion = false;
  protected ultimaMarcacionFecha: string | null = null;
  protected ultimaMarcacionCompleta = false;

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
    this.cargarUltimaMarcacion();
    this.actualizarHora();
    this.temporizador = setInterval(() => this.actualizarHora(), 1000);
    this.fechaActual = this.formatearFecha(new Date());
    this.verificarPerfil();
    this.cargarResumenHoy();
  }

  private cargarUltimaMarcacion() {
    this.marcacionService.ultima().subscribe({
      next: (res) => {
        const data = res.data;
        if (!data || !data.fecha) return;
        this.ultimaMarcacionFecha = data.fecha;
        this.ultimaMarcacionCompleta = !!data.completado;
        this.setCountersFromMarcaciones(data.marcaciones);
        if (this.pruebaExposicion === 1) {
          this.evaluarSiguienteDiaDemo();
        }
      },
      error: () => {
        // silencioso
      },
    });
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

    if (this.pruebaExposicion === 0 && this.bloqueoMarcacion) {
      Swal.fire({
        icon: 'info',
        title: 'Marcacion registrada',
        text: 'Ya registraste marcacion hoy. Solo se muestra el resumen.',
        confirmButtonColor: '#00A5A5',
      });
      return;
    }

    if (this.pruebaExposicion === 1) {
      this.ejecutarPasoDemo();
      return;
    }

    const ahora = new Date();
    const horaActualHumana = this.formatearHora(ahora, true);
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

  // Modo demo: paso a paso con offsets aleatorios
  private ejecutarPasoDemo() {
    const baseDate = this.obtenerFechaBaseDemo();
    const fecha = this.fechaISO(baseDate);
    const tipos: TipoMarcacion[] = ['ENTRADA', 'INICIO_REFRI', 'FIN_REFRI', 'SALIDA'];
    const objetivos = ['08:00', '13:00', '14:00', '17:00'];

    if (this.fase > 3) {
      this.finalizado = true;
      this.textoBoton = 'Marcacion finalizada';
      this.mostrarResumen();
      return;
    }

    const idx = this.fase;
    const rand = this.randomOffsetMinutes(-20, 20);
    const horaDemo = this.aplicarOffset(objetivos[idx], rand);
    const tipo = tipos[idx];

        this.marcacionService.registrar({ tipo, fecha, hora: horaDemo }).subscribe({
      next: () => {
        const horaHumana = this.formatearHoraDemo(horaDemo);
        switch (idx) {
          case 0:
            this.inicioJornada = horaHumana;
            this.evaluarTardanza('ENTRADA', horaHumana);
            this.textoBoton = 'Iniciar refrigerio';
            break;
          case 1:
            this.inicioRefrigerio = horaHumana;
            this.evaluarTardanza('INICIO_REFRI', horaHumana);
            this.textoBoton = 'Finalizar refrigerio';
            break;
          case 2:
            this.finRefrigerio = horaHumana;
            this.evaluarTardanza('FIN_REFRI', horaHumana);
            this.textoBoton = 'Finalizar marcacion';
            break;
          case 3:
            this.finJornada = horaHumana;
            this.evaluarTardanza('SALIDA', horaHumana);
            this.finalizado = true;
            this.textoBoton = 'Marcacion finalizada';
            this.ultimaMarcacionFecha = this.fechaISO(baseDate);
            this.ultimaMarcacionCompleta = true;
            break;
        }
        this.fase++;
        this.mostrarAlerta('Marcacion registrada (demo)', horaHumana);
        if (this.finalizado) {
          this.mostrarResumen();
        }
      },
      error: (err) =>
        Swal.fire({
          icon: 'error',
          title: 'Demo detenida',
          text: err.error?.message || 'Error al registrar marcacion demo.',
          confirmButtonColor: '#00A5A5',
        }),
    });
  }

  private evaluarSiguienteDiaDemo() {
    if (this.pruebaExposicion !== 1) return;
    if (!this.ultimaMarcacionFecha || !this.ultimaMarcacionCompleta) return;

    const siguiente = this.sumarDias(this.ultimaMarcacionFecha, 1);
    Swal.fire({
      icon: 'question',
      title: '¿Probar el siguiente dia?',
      text: `Se generaran marcaciones demo para ${this.formatearFecha(new Date(siguiente))}`,
      showCancelButton: true,
      confirmButtonColor: '#00A5A5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, generar',
      cancelButtonText: 'No, continuar',
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.setItem('pruebaExposicionBase', siguiente);
        this.resetDemoState();
        this.fase = 0;
        this.finalizado = false;
      }
    });
  }

  private obtenerFechaBaseDemo(): Date {
    const almacenada = localStorage.getItem('pruebaExposicionBase');
    if (almacenada) {
      return new Date(almacenada);
    }
    const hoy = new Date();
    localStorage.setItem('pruebaExposicionBase', hoy.toISOString().slice(0, 10));
    return hoy;
  }

  private resetDemoState(limpiarBase = false) {
    this.fase = 0;
    this.finalizado = false;
    this.textoBoton = 'Iniciar marcacion';
    this.inicioJornada = null;
    this.inicioRefrigerio = null;
    this.finRefrigerio = null;
    this.finJornada = null;
    if (limpiarBase) {
      localStorage.removeItem('pruebaExposicionBase');
    }
  }

  private aplicarOffset(hhmm: string, offsetMin: number): string {
    const [h, m] = hhmm.split(':').map(Number);
    const base = new Date();
    base.setHours(h, m, 0, 0);
    base.setMinutes(base.getMinutes() + offsetMin);
    return this.formatearHora24(base);
  }

  private formatearHora24(fecha: Date): string {
    const hh = String(fecha.getHours()).padStart(2, '0');
    const mm = String(fecha.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private fechaISO(fecha: Date): string {
    return fecha.toISOString().slice(0, 10);
  }

  private sumarDias(fechaISO: string, dias: number) {
    const d = new Date(fechaISO);
    d.setDate(d.getDate() + dias);
    return d.toISOString().slice(0, 10);
  }

  private randomOffsetMinutes(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
        this.bloqueoMarcacion = this.pruebaExposicion === 0;
        this.textoBoton = 'Marcacion registrada';
        for (const m of datos.marcaciones) {
          const horaHumana = this.formatearHoraDemo(m.hora);
          let ultimoTipo: TipoMarcacion | null = null;
          switch (m.tipo) {
            case 'ENTRADA':
              this.inicioJornada = horaHumana;
              ultimoTipo = 'ENTRADA';
              break;
            case 'INICIO_REFRI':
              this.inicioRefrigerio = horaHumana;
              ultimoTipo = 'INICIO_REFRI';
              break;
            case 'FIN_REFRI':
              this.finRefrigerio = horaHumana;
              ultimoTipo = 'FIN_REFRI';
              break;
            case 'SALIDA':
              this.finJornada = horaHumana;
              this.finalizado = this.pruebaExposicion === 0;
              this.textoBoton = this.pruebaExposicion === 0 ? 'Marcacion finalizada' : this.textoBoton;
              ultimoTipo = 'SALIDA';
              break;
          }
          if (ultimoTipo) {
            this.evaluarTardanza(ultimoTipo, horaHumana);
          }
        }
        // Si ya tiene las cuatro, marcamos como finalizado (en modo normal se bloquea; en demo puede continuar)
        const completadas = this.inicioJornada && this.inicioRefrigerio && this.finRefrigerio && this.finJornada;
        if (completadas) {
          this.finalizado = this.pruebaExposicion === 0;
          this.textoBoton = this.pruebaExposicion === 0 ? 'Marcacion finalizada' : 'Continuar marcacion';
          this.ultimaMarcacionFecha = datos.fecha;
          this.ultimaMarcacionCompleta = true;
        }
        // Solo advertencia si ya tuvo marcacion previa; en demo no se bloquea
        if (this.pruebaExposicion === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Marcaciones de hoy',
            text: 'Ya existen registros hoy. Se muestra el resumen.',
            confirmButtonColor: '#00A5A5',
          });
        } else if (datos.marcaciones.length > 0) {
          Swal.fire({
            icon: 'info',
            title: 'Ya tienes marcaciones',
            text: 'Puedes seguir registrando en modo demo.',
            confirmButtonColor: '#00A5A5',
          });
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

  private setCountersFromMarcaciones(marcaciones: MarcacionItem[]) {
    if (!marcaciones || marcaciones.length === 0) return;
    for (const m of marcaciones) {
      const horaHumana = this.formatearHoraDemo(m.hora);
      switch (m.tipo) {
        case 'ENTRADA':
          this.inicioJornada = this.inicioJornada || horaHumana;
          break;
        case 'INICIO_REFRI':
          this.inicioRefrigerio = this.inicioRefrigerio || horaHumana;
          break;
        case 'FIN_REFRI':
          this.finRefrigerio = this.finRefrigerio || horaHumana;
          break;
        case 'SALIDA':
          this.finJornada = this.finJornada || horaHumana;
          this.finalizado = this.pruebaExposicion === 0;
          this.textoBoton = this.pruebaExposicion === 0 ? 'Marcacion finalizada' : this.textoBoton;
          break;
      }
    }
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








