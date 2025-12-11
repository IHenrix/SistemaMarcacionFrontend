import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  AdminUsuariosService,
  RolDto,
  UsuarioDto,
} from '../../../services/admin-usuarios.service';
import { AdminPersonasService, PersonaDto } from '../../../services/admin-personas.service';
import { UsuarioModalComponent } from './usuario-modal';

@Component({
  selector: 'app-usuarios-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSelectModule],
  templateUrl: './usuarios-tab.html',
  styleUrls: ['./usuarios-tab.scss'],
})
export class UsuariosTabComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminUsuariosService = inject(AdminUsuariosService);
  private adminPersonasService = inject(AdminPersonasService);
  private dialog = inject(MatDialog);
  private spinner = inject(NgxSpinnerService);

  usuarios: UsuarioDto[] = [];
  usuariosFiltrados: UsuarioDto[] = [];
  usuariosPagina: UsuarioDto[] = [];
  roles: RolDto[] = [];
  personasDisponibles: PersonaDto[] = [];
  filtrosForm!: FormGroup;
  buscando = false;
  totalRegistros = 0;
  totalFiltrados = 0;
  page = 1;
  pageSize = 10;

  get totalPaginas() {
    return Math.max(1, Math.ceil(this.totalFiltrados / this.pageSize));
  }

  ngOnInit(): void {
    this.buildFiltros();
    this.cargarRoles();
    this.cargarPersonasDisponibles();
    this.cargarUsuarios();
  }

  private buildFiltros() {
    this.filtrosForm = this.fb.group({
      nombres: [''],
      apellidos: [''],
      username: [''],
      estado: [''],
      busqueda: [''],
      pageSize: [10],
    });
  }

  private cargarUsuarios(filtros?: {
    nombres?: string;
    apellidos?: string;
    username?: string;
    estado?: string;
  }) {
    this.buscando = true;
    this.adminUsuariosService.listarUsuarios(filtros).subscribe({
      next: (data) => {
        this.usuarios = data;
        this.totalRegistros = data.length;
        this.page = 1;
        this.aplicarFiltrosLocales();
        this.buscando = false;
      },
      error: (err) => {
        this.buscando = false;
        this.mostrarError(err?.error?.message || 'No se pudo obtener usuarios');
      },
    });
  }

  private cargarRoles() {
    this.adminUsuariosService.listarRoles().subscribe({
      next: (data) => (this.roles = data),
      error: (err) => console.error('Error al cargar roles:', err),
    });
  }

  cargarPersonasDisponibles() {
    this.adminPersonasService.listar({ sinUsuario: true, estado: 1 }).subscribe({
      next: (data) => (this.personasDisponibles = data),
      error: (err) => console.error('Error al cargar personas:', err),
    });
  }

  aplicarFiltros() {
    const { nombres, apellidos, username, estado } = this.filtrosForm.value;
    const filtros: any = {};
    if (nombres?.trim()) filtros.nombres = nombres.trim();
    if (apellidos?.trim()) filtros.apellidos = apellidos.trim();
    if (username?.trim()) filtros.username = username.trim();
    if (estado) filtros.estado = estado;
    this.cargarUsuarios(filtros);
  }

  limpiarFiltros() {
    this.filtrosForm.reset({
      nombres: '',
      apellidos: '',
      username: '',
      estado: '',
      busqueda: '',
      pageSize: this.pageSize,
    });
    this.page = 1;
    this.cargarUsuarios();
  }

  abrirNuevo() {
    const ref = this.dialog.open(UsuarioModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        modo: 'nuevo',
        roles: this.roles,
        personas: this.personasDisponibles,
      },
    });

    ref.componentInstance.submittedPayload.subscribe((value: any) => {
      const payload = {
        id_persona: Number(value.id_persona),
        username: value.username,
        password: value.password || '',
        roles: value.roles as number[],
      };
      ref.close();
      this.spinner.show();
      this.adminUsuariosService.crearUsuario(payload).subscribe({
        next: () => {
          this.mostrarOk('Usuario creado exitosamente');
          this.cargarUsuarios();
          this.cargarPersonasDisponibles();
        },
        error: (err) =>
          this.mostrarError(err?.error?.message || 'No se pudo crear el usuario'),
      });
    });
  }

  abrirEditar(usuario: UsuarioDto) {
    const ref = this.dialog.open(UsuarioModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        modo: 'editar',
        usuario,
        roles: this.roles,
      },
    });

    ref.componentInstance.submittedPayload.subscribe((value: any) => {
      const payload: any = {
        username: value.username,
        roles: value.roles as number[],
        estado: usuario.estado,
      };
      if (value.password) {
        payload.password = value.password;
      }
      ref.close();
      this.spinner.show();
      this.adminUsuariosService
        .actualizarUsuario(usuario.id_usuario, payload)
        .subscribe({
          next: () => {
            this.mostrarOk('Usuario actualizado exitosamente');
            this.cargarUsuarios();
            this.cargarPersonasDisponibles();
          },
          error: (err) =>
            this.mostrarError(
              err?.error?.message || 'No se pudo actualizar el usuario'
            ),
        });
    });
  }

  desactivar(id: number) {
    Swal.fire({
      icon: 'warning',
      title: '¿Desactivar usuario?',
      text: 'El usuario no podrá acceder al sistema',
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
        this.adminUsuariosService.desactivarUsuario(id).subscribe({
          next: () => {
            this.mostrarOk('Usuario desactivado exitosamente');
            this.cargarUsuarios();
          },
          error: (err) =>
            this.mostrarError(
              err?.error?.message || 'No se pudo desactivar el usuario'
            ),
        });
      }
    });
  }

  activar(id: number) {
    this.spinner.show();
    this.adminUsuariosService.activarUsuario(id).subscribe({
      next: () => {
        this.mostrarOk('Usuario activado exitosamente');
        this.cargarUsuarios();
      },
      error: (err) =>
        this.mostrarError(
          err?.error?.message || 'No se pudo activar el usuario'
        ),
    });
  }

  desbloquear(id: number) {
    this.spinner.show();
    this.adminUsuariosService.desbloquearUsuario(id).subscribe({
      next: () => {
        this.mostrarOk('Usuario desbloqueado exitosamente');
        this.cargarUsuarios();
      },
      error: (err) =>
        this.mostrarError(
          err?.error?.message || 'No se pudo desbloquear el usuario'
        ),
    });
  }

  private aplicarFiltrosLocales() {
    const { busqueda, pageSize, estado } = this.filtrosForm.value;
    this.pageSize = Number(pageSize) || this.pageSize;
    const texto = (busqueda || '').toLowerCase().trim();

    const filtrados = this.usuarios.filter((u) => {
      // Filtro por estado local
      if (estado) {
        if (estado === 'A' && u.estado !== 'A') return false;
        if (estado === 'I' && u.estado !== 'I') return false;
        if (estado === 'B' && u.estado !== 'B') return false;
      }
      // Búsqueda rápida
      if (!texto) return true;
      const persona = u.persona;
      return (
        u.username?.toLowerCase().includes(texto) ||
        persona?.nombres?.toLowerCase().includes(texto) ||
        persona?.apellidos?.toLowerCase().includes(texto)
      );
    });

    this.usuariosFiltrados = filtrados;
    this.totalFiltrados = filtrados.length;
    const start = (this.page - 1) * this.pageSize;
    this.usuariosPagina = filtrados.slice(start, start + this.pageSize);
  }

  aplicarBusquedaRapida() {
    this.page = 1;
    this.aplicarFiltrosLocales();
  }

  cambiarPageSize(size: number) {
    this.pageSize = Number(size) || this.pageSize;
    this.filtrosForm.patchValue({ pageSize: this.pageSize }, { emitEvent: false });
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

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'A':
        return 'Activo';
      case 'I':
        return 'Inactivo';
      case 'B':
        return 'Bloqueado';
      default:
        return estado;
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'A':
        return 'badge-utp-green';
      case 'I':
      case 'B':
        return 'badge-utp-red';
      default:
        return 'badge-utp-gray-dark';
    }
  }
}
