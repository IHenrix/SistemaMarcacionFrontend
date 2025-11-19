import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { SharedImports } from '@app/shared/shared.imports';

interface Horario {
  id: number;
  nombre: string;
  entrada: string;
  inicioRefri: string;
  finRefri: string;
  salida: string;
  toleranciaEntrada: number;
  toleranciaSalida: number;
  toleranciaRefri: number;
  dias: string[];
  color: string;
  uso: number;
  vigente?: boolean;
}

interface PersonaAsignacion {
  id: number;
  nombre: string;
  area: string;
  rol: string;
  horarioId: number;
  desde: string;
  hasta?: string;
  excepcion?: string;
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [SharedImports],
  templateUrl: './horarios.html',
  styleUrl: './horarios.scss',
})
export class HorariosComponent {
  protected readonly diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  protected selectedTab: 'asignar' | 'horarios' = 'asignar';
  protected searchPersona = '';
  protected searchPersonaSelect = '';
  protected searchHorario = '';

  protected horarios: Horario[] = [
    {
      id: 1,
      nombre: 'Turno regular',
      entrada: '08:00',
      inicioRefri: '13:00',
      finRefri: '14:00',
      salida: '17:30',
      toleranciaEntrada: 10,
      toleranciaSalida: 5,
      toleranciaRefri: 10,
      dias: ['L', 'M', 'X', 'J', 'V'],
      color: 'var(--utp-cyan)',
      uso: 18,
      vigente: true,
    },
    {
      id: 2,
      nombre: 'Sábado corto',
      entrada: '09:00',
      inicioRefri: '12:30',
      finRefri: '13:00',
      salida: '14:00',
      toleranciaEntrada: 5,
      toleranciaSalida: 5,
      toleranciaRefri: 5,
      dias: ['S'],
      color: 'var(--utp-yellow)',
      uso: 6,
    },
    {
      id: 3,
      nombre: 'Turno noche',
      entrada: '22:00',
      inicioRefri: '02:00',
      finRefri: '02:30',
      salida: '06:00',
      toleranciaEntrada: 5,
      toleranciaSalida: 5,
      toleranciaRefri: 5,
      dias: ['L', 'M', 'X', 'J', 'V'],
      color: 'var(--utp-purple, #7136f2)',
      uso: 4,
    },
  ];

  protected personas: PersonaAsignacion[] = [
    { id: 1, nombre: 'Ricardo Prada', area: 'Ventas', rol: 'ADMIN', horarioId: 1, desde: '01/11', excepcion: 'N/A' },
    { id: 2, nombre: 'Fabrizzio Cornejo', area: 'Operaciones', rol: 'OPERATIVO', horarioId: 1, desde: '05/11' },
    { id: 3, nombre: 'Jenniffer Rodríguez', area: 'Operaciones', rol: 'OPERATIVO', horarioId: 2, desde: '12/11' },
    { id: 4, nombre: 'Juan Morales', area: 'Soporte', rol: 'ADMIN', horarioId: 3, desde: '15/11', excepcion: 'Feriado 25/12' },
  ];

  protected selectedHorarioId = this.horarios[0]?.id ?? null;

  protected horarioForm = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    entrada: new FormControl('08:00', Validators.required),
    inicioRefri: new FormControl('13:00', Validators.required),
    finRefri: new FormControl('14:00', Validators.required),
    salida: new FormControl('17:30', Validators.required),
    toleranciaEntrada: new FormControl(10, [Validators.required, Validators.min(0)]),
    toleranciaSalida: new FormControl(5, [Validators.required, Validators.min(0)]),
    toleranciaRefri: new FormControl(10, [Validators.required, Validators.min(0)]),
    dias: new FormControl<string[]>(['L', 'M', 'X', 'J', 'V'], Validators.required),
    color: new FormControl('var(--utp-cyan)'),
  });

  protected asignacionForm = new FormGroup({
    persona: new FormControl<number | null>(null, Validators.required),
    horarioId: new FormControl<number | null>(this.selectedHorarioId, Validators.required),
    fechaInicio: new FormControl<string>(this.hoyISO(), Validators.required),
    fechaFin: new FormControl<string | null>(null),
  });

  protected get personasFiltradas(): PersonaAsignacion[] {
    const term = this.searchPersona.trim().toLowerCase();
    if (!term) return this.personas;
    return this.personas.filter((p) => `${p.nombre} ${p.area} ${p.rol}`.toLowerCase().includes(term));
  }

  protected get personasFiltradasSelect(): PersonaAsignacion[] {
    const term = this.searchPersonaSelect.trim().toLowerCase();
    if (!term) return this.personas;
    return this.personas.filter((p) => `${p.nombre} ${p.area} ${p.rol}`.toLowerCase().includes(term));
  }

  protected get horariosFiltrados(): Horario[] {
    const term = this.searchHorario.trim().toLowerCase();
    if (!term) return this.horarios;
    return this.horarios.filter((h) => h.nombre.toLowerCase().includes(term));
  }

  protected seleccionarTab(tab: 'asignar' | 'horarios') {
    this.selectedTab = tab;
  }

  protected toggleDia(dia: string) {
    const dias = this.horarioForm.get('dias')?.value ?? [];
    const existe = dias.includes(dia);
    const next = existe ? dias.filter((d) => d !== dia) : [...dias, dia];
    this.horarioForm.patchValue({ dias: next });
  }

  protected esDiaActivo(dia: string): boolean {
    return this.horarioForm.get('dias')?.value?.includes(dia) ?? false;
  }

  protected crearHorario() {
    if (this.horarioForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Completa los campos',
        text: 'Falta definir nombre, horas o tolerancias',
        confirmButtonColor: '#00A5A5',
      });
      return;
    }

    const nuevo: Horario = {
      id: Date.now(),
      nombre: this.horarioForm.value.nombre!.trim(),
      entrada: this.horarioForm.value.entrada!,
      inicioRefri: this.horarioForm.value.inicioRefri!,
      finRefri: this.horarioForm.value.finRefri!,
      salida: this.horarioForm.value.salida!,
      toleranciaEntrada: this.horarioForm.value.toleranciaEntrada ?? 0,
      toleranciaSalida: this.horarioForm.value.toleranciaSalida ?? 0,
      toleranciaRefri: this.horarioForm.value.toleranciaRefri ?? 0,
      dias: this.horarioForm.value.dias ?? [],
      color: this.horarioForm.value.color ?? 'var(--utp-cyan)',
      uso: 0,
    };

    this.horarios = [nuevo, ...this.horarios];
    this.selectedHorarioId = nuevo.id;
    this.asignacionForm.patchValue({ horarioId: nuevo.id });

    Swal.fire({
      icon: 'success',
      title: 'Horario creado',
      text: `${nuevo.nombre} ahora está disponible para asignar.`,
      confirmButtonColor: '#00A5A5',
      timer: 1600,
      timerProgressBar: true,
      showConfirmButton: false,
    });

    this.horarioForm.reset({
      nombre: '',
      entrada: '08:00',
      inicioRefri: '13:00',
      finRefri: '14:00',
      salida: '17:30',
      toleranciaEntrada: 10,
      toleranciaSalida: 5,
      toleranciaRefri: 10,
      dias: ['L', 'M', 'X', 'J', 'V'],
      color: 'var(--utp-cyan)',
    });
  }

  protected asignarHorario() {
    if (this.asignacionForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona persona y horario',
        text: 'Debes elegir a quién aplicar y desde cuándo.',
        confirmButtonColor: '#00A5A5',
      });
      return;
    }

    const personaId = Number(this.asignacionForm.value.persona);
    const horarioId = this.asignacionForm.value.horarioId as number;
    const desde = this.asignacionForm.value.fechaInicio;
    const hasta = this.asignacionForm.value.fechaFin ?? undefined;

    this.personas = this.personas.map((p) =>
      p.id === personaId ? { ...p, horarioId, desde: this.formatFecha(desde), hasta } : p
    );

    Swal.fire({
      icon: 'success',
      title: 'Horario asignado',
      text: 'La persona tendrá el nuevo horario desde la fecha indicada.',
      confirmButtonColor: '#00A5A5',
      timer: 1400,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  protected duplicarHorario(horario: Horario) {
    const copia: Horario = {
      ...horario,
      id: Date.now(),
      nombre: `${horario.nombre} (copia)`,
      vigente: false,
      uso: 0,
    };
    this.horarios = [copia, ...this.horarios];
    this.selectedHorarioId = copia.id;
    this.asignacionForm.patchValue({ horarioId: copia.id });
  }

  protected accionPendienteBackend() {
    Swal.fire({
      icon: 'info',
      title: 'Acción pendiente',
      text: 'Esta acción se conectará al backend en la siguiente etapa.',
      confirmButtonColor: '#00A5A5',
    });
  }

  protected timelineSegments(horario: Horario) {
    const total = this.diffMin(horario.entrada, horario.salida);
    const antesRefri = this.diffMin(horario.entrada, horario.inicioRefri);
    const refri = this.diffMin(horario.inicioRefri, horario.finRefri);
    const despuesRefri = this.diffMin(horario.finRefri, horario.salida);

    const pct = (min: number) => Math.max(5, Math.round((min / total) * 100));

    return [
      { label: 'Entrada', width: pct(antesRefri), class: 'seg-entrada' },
      { label: 'Refrigerio', width: pct(refri), class: 'seg-refri' },
      { label: 'Salida', width: pct(despuesRefri), class: 'seg-salida' },
    ];
  }

  protected horarioActual(persona: PersonaAsignacion) {
    return this.horarios.find((h) => h.id === persona.horarioId);
  }

  protected resolverDias(dias: string[]) {
    return this.diasSemana.map((d) => ({
      dia: d,
      activo: dias.includes(d),
    }));
  }

  protected formatoDias(dias: string[]) {
    if (!dias || dias.length === 0) return 'Sin días';
    return dias.join(' · ');
  }

  private diffMin(inicio: string, fin: string): number {
    const ini = this.toMin(inicio);
    const end = this.toMin(fin);
    return end >= ini ? end - ini : end + 1440 - ini; // soporta turnos que cruzan medianoche
  }

  private toMin(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  private hoyISO() {
    return new Date().toISOString().slice(0, 10);
  }

  private formatFecha(fechaIso?: string | null) {
    if (!fechaIso) return '';
    const [yyyy, mm, dd] = fechaIso.split('-');
    return `${dd}/${mm}`;
  }
}
