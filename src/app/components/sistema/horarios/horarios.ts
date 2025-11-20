import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { SharedImports } from '@app/shared/shared.imports';
import { HorarioService } from '@app/services/horario.service';
import { AsignacionHorario, Horario, HorarioRequest } from '@app/models/horario.model';
import { UsuarioService } from '@app/services/usuario.service';
import { PersonaAsignacionDTO } from '@app/models/usuario.model';

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
export class HorariosComponent implements OnInit {
  protected readonly diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  protected selectedTab: 'asignar' | 'horarios' = 'asignar';
  protected searchPersona = '';
  protected searchPersonaSelect = '';
  protected searchHorario = '';

  protected horarios: Horario[] = [];
  protected personas: PersonaAsignacion[] = [];

  protected selectedHorarioId: number | null = null;
  protected loadingHorarios = false;
  protected loadingAsignaciones = false;

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

  private readonly horarioService = inject(HorarioService);
  private readonly usuarioService = inject(UsuarioService);

  ngOnInit(): void {
    this.cargarPersonas();
    this.cargarHorarios();
  }

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

    const payload: HorarioRequest = {
      nombre: this.horarioForm.value.nombre!.trim(),
      entrada: this.horarioForm.value.entrada!,
      inicio_refri: this.horarioForm.value.inicioRefri!,
      fin_refri: this.horarioForm.value.finRefri!,
      salida: this.horarioForm.value.salida!,
      tol_entrada_min: this.horarioForm.value.toleranciaEntrada ?? 0,
      tol_salida_min: this.horarioForm.value.toleranciaSalida ?? 0,
      tol_refri_min: this.horarioForm.value.toleranciaRefri ?? 0,
      dias: (this.horarioForm.value.dias as string[] | number[]).map((d) => Number(d)),
      color: this.horarioForm.value.color ?? null,
    };

    this.horarioService.crearHorario(payload).subscribe({
      next: () => {
        this.cargarHorarios();
        Swal.fire({
          icon: 'success',
          title: 'Horario creado',
          text: `${payload.nombre} ahora está disponible para asignar.`,
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
      },
      error: (err) =>
        Swal.fire({
          icon: 'error',
          title: 'No se pudo crear',
          text: err.error?.message || 'Error al guardar el horario.',
          confirmButtonColor: '#00A5A5',
        }),
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
    const payload = {
      id_horario: this.asignacionForm.value.horarioId as number,
      fecha_inicio: this.asignacionForm.value.fechaInicio!,
      fecha_fin: this.asignacionForm.value.fechaFin ?? null,
      prioridad: 'PERSONA' as const,
      id_persona: personaId,
    };

    this.horarioService.asignarHorario(payload).subscribe({
      next: () => {
        this.cargarAsignaciones();
        Swal.fire({
          icon: 'success',
          title: 'Horario asignado',
          text: 'La persona tendrá el nuevo horario desde la fecha indicada.',
          confirmButtonColor: '#00A5A5',
          timer: 1400,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      },
      error: (err) =>
        Swal.fire({
          icon: 'error',
          title: 'No se pudo asignar',
          text: err.error?.message || 'Error al asignar el horario.',
          confirmButtonColor: '#00A5A5',
        }),
    });
  }

  protected duplicarHorario(horario: Horario) {
    const copia: HorarioRequest = {
      nombre: `${horario.nombre} (copia)`,
      entrada: horario.entrada,
      inicio_refri: horario.inicio_refri,
      fin_refri: horario.fin_refri,
      salida: horario.salida,
      tol_entrada_min: horario.tol_entrada_min,
      tol_salida_min: horario.tol_salida_min,
      tol_refri_min: horario.tol_refri_min,
      dias: horario.dias,
      color: horario.color ?? null,
    };

    this.horarioService.crearHorario(copia).subscribe({
      next: () => this.cargarHorarios(),
      error: (err) =>
        Swal.fire({
          icon: 'error',
          title: 'No se pudo duplicar',
          text: err.error?.message || 'Error al duplicar.',
          confirmButtonColor: '#00A5A5',
        }),
    });
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
    const antesRefri = this.diffMin(horario.entrada, horario.inicio_refri);
    const refri = this.diffMin(horario.inicio_refri, horario.fin_refri);
    const despuesRefri = this.diffMin(horario.fin_refri, horario.salida);

    const pct = (min: number) => Math.max(5, Math.round((min / total) * 100));

    return [
      { label: 'Entrada', width: pct(antesRefri), class: 'seg-entrada' },
      { label: 'Refrigerio', width: pct(refri), class: 'seg-refri' },
      { label: 'Salida', width: pct(despuesRefri), class: 'seg-salida' },
    ];
  }

  protected horarioActual(persona: PersonaAsignacion) {
    return this.horarios.find((h) => h.id_horario === persona.horarioId);
  }

  protected resolverDias(dias: number[]) {
    return this.diasSemana.map((_, idx) => ({
      dia: this.diasSemana[idx],
      activo: dias.includes(idx),
    }));
  }

  protected formatoDias(dias: number[]) {
    if (!dias || dias.length === 0) return 'Sin días';
    return dias
      .map((d) => this.diasSemana[d] ?? d)
      .join(' · ');
  }

  private cargarPersonas() {
    this.usuarioService.listarUsuarios().subscribe({
      next: (res) => {
        const personasDto: PersonaAsignacionDTO[] = res.data ?? [];
        this.personas = personasDto.map((p) => ({
          id: p.id_persona,
          nombre: `${p.nombres} ${p.apellidos}`,
          area: p.area_nombre ?? 'Área',
          rol: p.roles?.[0] ?? 'N/A',
          horarioId: 0,
          desde: '',
        }));
        this.cargarAsignaciones(); // después de tener personas, aplicamos asignaciones
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'No se pudieron cargar personas',
          text: err.error?.message || 'Error al cargar la lista de personas.',
          confirmButtonColor: '#00A5A5',
        });
      },
    });
  }

  private cargarHorarios() {
    this.loadingHorarios = true;
    this.horarioService.listarHorarios().subscribe({
      next: (res) => {
        this.horarios = (res.data ?? []).map((h) => ({
          ...h,
          color: h.color ?? 'var(--utp-cyan)',
        }));
        this.selectedHorarioId = this.horarios[0]?.id_horario ?? null;
        this.asignacionForm.patchValue({ horarioId: this.selectedHorarioId });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'No se pudieron cargar los horarios',
          text: err.error?.message || 'Error de carga de horarios.',
          confirmButtonColor: '#00A5A5',
        });
      },
      complete: () => (this.loadingHorarios = false),
    });
  }

  private cargarAsignaciones() {
    this.loadingAsignaciones = true;
    this.horarioService.listarAsignaciones().subscribe({
      next: (res) => {
        const asignaciones: AsignacionHorario[] = res.data ?? [];
        this.personas = this.personas.map((p) => {
          const asign = asignaciones.find((a) => a.id_persona === p.id);
          if (asign) {
            return {
              ...p,
              horarioId: asign.id_horario,
              desde: this.formatFecha(asign.fecha_inicio),
              hasta: asign.fecha_fin ? this.formatFecha(asign.fecha_fin) : undefined,
            };
          }
          return p;
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'No se pudieron cargar asignaciones',
          text: err.error?.message || 'Error de carga de asignaciones.',
          confirmButtonColor: '#00A5A5',
        });
      },
      complete: () => (this.loadingAsignaciones = false),
    });
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
    return `${dd}/${mm}/${yyyy}`;
  }
}
