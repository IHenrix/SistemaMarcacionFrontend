import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import {
  AdminPersonasService,
  PersonaDto,
} from '../../../services/admin-personas.service';
import { PersonaModalComponent } from './persona-modal';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-personas-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './personas-tab.html',
  styleUrls: ['./personas-tab.scss'],
})
export class PersonasTabComponent implements OnInit {
  private fb = inject(FormBuilder);
  private personasService = inject(AdminPersonasService);
  private dialog = inject(MatDialog);
  private spinner = inject(NgxSpinnerService);

  personas: PersonaDto[] = [];
  personasFiltradas: PersonaDto[] = [];
  personasPagina: PersonaDto[] = [];
  filtrosForm!: FormGroup;
  totalRegistros = 0;
  totalFiltrados = 0;
  page = 1;
  pageSize = 10;

  get totalPaginas() {
    return Math.max(1, Math.ceil(this.totalFiltrados / this.pageSize));
  }

  ngOnInit(): void {
    this.buildFiltros();
    this.cargarDatos();
  }

  private buildFiltros() {
    this.filtrosForm = this.fb.group({
      nombres: [''],
      apellidos: [''],
      sinUsuario: [false],
      estado: [1],
      busqueda: [''],
      pageSize: [10],
    });
  }

  cargarDatos() {
    const { nombres, apellidos, sinUsuario, estado } = this.filtrosForm.value;
    this.personasService
      .listar({
        nombres,
        apellidos,
        sinUsuario,
        estado,
      })
      .subscribe({
        next: (data) => {
          this.personas = data;
          this.totalRegistros = data.length;
          this.page = 1;
          this.aplicarFiltrosLocales();
        },
        error: (err) =>
          this.mostrarError(
            err?.error?.message || 'No se pudo cargar personas'
          ),
      });
  }

  aplicarFiltros() {
    this.cargarDatos();
  }

  limpiarFiltros() {
    this.filtrosForm.reset({
      nombres: '',
      apellidos: '',
      sinUsuario: false,
      estado: 1,
      busqueda: '',
      pageSize: this.pageSize,
    });
    this.page = 1;
    this.cargarDatos();
  }

  abrirNuevo() {
    const ref = this.dialog.open(PersonaModalComponent, {
      width: '820px',
      maxWidth: '95vw',
      disableClose: true,
      data: { modo: 'nuevo' },
    });

    ref.componentInstance.submittedPayload.subscribe((payload) => {
      ref.close();
      this.spinner.show();
      this.personasService.crear(payload).subscribe({
        next: () => {
          this.mostrarOk('Persona creada exitosamente');
          this.cargarDatos();
        },
        error: (err) =>
          this.mostrarError(
            err?.error?.message || 'No se pudo crear la persona'
          ),
      });
    });
  }

  abrirEditar(persona: PersonaDto) {
    const ref = this.dialog.open(PersonaModalComponent, {
      width: '820px',
      maxWidth: '95vw',
      disableClose: true,
      data: { modo: 'editar', persona },
    });

    ref.componentInstance.submittedPayload.subscribe((payload) => {
      ref.close();
      this.spinner.show();
      this.personasService.actualizar(persona.id_persona, payload).subscribe({
        next: () => {
          this.mostrarOk('Persona actualizada exitosamente');
          this.cargarDatos();
        },
        error: (err) =>
          this.mostrarError(
            err?.error?.message || 'No se pudo actualizar la persona'
          ),
      });
    });
  }

  desactivar(persona: PersonaDto) {
    Swal.fire({
      icon: 'warning',
      title: '¿Desactivar persona y usuario asociado?',
      text: 'Si tiene usuario, también se desactivará.',
      showCancelButton: true,
      confirmButtonColor: '#00A5A5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.personasService.desactivar(persona.id_persona).subscribe({
          next: () => {
            this.mostrarOk('Persona desactivada exitosamente');
            this.cargarDatos();
          },
          error: (err) =>
            this.mostrarError(
              err?.error?.message || 'No se pudo desactivar'
            ),
        });
      }
    });
  }

  activar(persona: PersonaDto) {
    const payload = {
      dni: persona.dni,
      nombres: persona.nombres,
      apellidos: persona.apellidos,
      telefono: persona.telefono || '',
      correo: persona.correo,
      id_area: persona.id_area || null,
      estado: 1,
    };
    this.spinner.show();
    this.personasService.actualizar(persona.id_persona, payload).subscribe({
      next: () => {
        this.mostrarOk('Persona reactivada exitosamente');
        this.cargarDatos();
      },
      error: (err) =>
        this.mostrarError(err?.error?.message || 'No se pudo reactivar'),
    });
  }

  private aplicarFiltrosLocales() {
    const { busqueda, pageSize } = this.filtrosForm.value;
    this.pageSize = Number(pageSize) || this.pageSize;
    const texto = (busqueda || '').toLowerCase().trim();

    const filtrados = this.personas.filter((p) => {
      if (!texto) return true;
      return (
        p.nombres?.toLowerCase().includes(texto) ||
        p.apellidos?.toLowerCase().includes(texto) ||
        p.dni?.toLowerCase().includes(texto) ||
        p.correo?.toLowerCase().includes(texto)
      );
    });

    this.personasFiltradas = filtrados;
    this.totalFiltrados = filtrados.length;
    const start = (this.page - 1) * this.pageSize;
    this.personasPagina = filtrados.slice(start, start + this.pageSize);
  }

  aplicarBusquedaRapida() {
    this.page = 1;
    this.aplicarFiltrosLocales();
  }

  cambiarPageSize(size: number) {
    this.pageSize = Number(size) || this.pageSize;
    this.filtrosForm.patchValue(
      { pageSize: this.pageSize },
      { emitEvent: false }
    );
    this.page = 1;
    this.aplicarFiltrosLocales();
  }

  cambiarPagina(delta: number) {
    const totalPaginas = Math.max(
      1,
      Math.ceil(this.totalFiltrados / this.pageSize)
    );
    const next = Math.min(Math.max(1, this.page + delta), totalPaginas);
    if (next === this.page) return;
    this.page = next;
    this.aplicarFiltrosLocales();
  }

  toUpper(controlName: string) {
    const value = this.filtrosForm.get(controlName)?.value;
    if (typeof value === 'string') {
      this.filtrosForm.patchValue(
        { [controlName]: value.toUpperCase() },
        { emitEvent: false }
      );
    }
  }

  private mostrarOk(mensaje: string) {
    this.spinner.hide();
    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: mensaje,
        text: 'Sistema de Marcaciones',
        confirmButtonColor: '#00A5A5',
        confirmButtonText: 'Aceptar',
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
    }, 50);
  }

  private mostrarError(mensaje: string) {
    this.spinner.hide();
    setTimeout(() => {
      Swal.fire({
        icon: 'error',
        title: mensaje,
        text: 'Sistema de Marcaciones',
        confirmButtonColor: '#00A5A5',
        confirmButtonText: 'Aceptar',
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
    }, 50);
  }
}
