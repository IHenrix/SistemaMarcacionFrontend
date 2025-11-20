import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { SharedImports } from '@app/shared/shared.imports';
import { ContactoService, ContactoRequest } from '@app/services/contacto.service';
import { UsuarioService } from '@app/services/usuario.service';
import { Usuario } from '@app/models/auth.model';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [SharedImports],
  templateUrl: './contacto.html',
  styleUrls: ['./contacto.scss'],
})
export class ContactoComponent implements OnInit {
  private readonly contactoService = inject(ContactoService);
  private readonly usuarioService = inject(UsuarioService);
  private perfilUsuario: Usuario | null = null;

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  protected modelo: ContactoRequest = {
    nombre: '',
    email: '',
    telefono: '',
    tipo: '',
    asunto: '',
    mensaje: '',
  };

  protected consentimiento = false;
  protected archivoSeleccionado: File | null = null;
  protected readonly extensionesPermitidas = ['application/pdf', 'image/png', 'image/jpeg'];
  protected readonly pesoMaximoBytes = 2 * 1024 * 1024; // 5MB

  protected cargando = false;
  protected soloLecturaNombre = false;
  protected soloLecturaEmail = false;

  ngOnInit(): void {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (res) => {
        const user: Usuario | undefined = res.data;
        if (user) {
          this.perfilUsuario = user;
          this.modelo.nombre = `${user.nombres || ''} ${user.apellidos || ''}`.trim();
          this.modelo.email = user.correo || '';
          this.modelo.telefono = user.telefono || '';
          this.soloLecturaNombre = !!this.modelo.nombre.trim();
          this.soloLecturaEmail = !!this.modelo.email;
        }
      },
      error: () => {
        this.soloLecturaNombre = false;
        this.soloLecturaEmail = false;
      },
    });
  }

  protected onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;
    if (!file) {
      this.archivoSeleccionado = null;
      return;
    }

    if (!this.extensionesPermitidas.includes(file.type)) {
      Swal.fire({
        icon: 'warning',
        title: 'Formato no permitido',
        text: 'Solo se permiten archivos PDF, JPG o PNG.',
        confirmButtonColor: '#00A5A5',
      });
      input.value = '';
      this.archivoSeleccionado = null;
      return;
    }

    if (file.size > this.pesoMaximoBytes) {
      Swal.fire({
        icon: 'warning',
        title: 'Archivo muy pesado',
        text: 'El archivo debe pesar maximo 2MB.',
        confirmButtonColor: '#00A5A5',
      });
      input.value = '';
      this.archivoSeleccionado = null;
      return;
    }

    this.archivoSeleccionado = file;
  }

  protected enviar(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    this.cargando = true;

    const payload = new FormData();
    payload.append('nombre', this.modelo.nombre);
    payload.append('email', this.modelo.email);
    payload.append('telefono', this.modelo.telefono || '');
    payload.append('tipo', this.modelo.tipo);
    payload.append('asunto', this.modelo.asunto);
    payload.append('mensaje', this.modelo.mensaje);
    if (this.archivoSeleccionado) {
      payload.append('archivo', this.archivoSeleccionado);
    }

    this.contactoService.enviar(payload).subscribe({
      next: () => {
        this.cargando = false;
        this.archivoSeleccionado = null;
        if (this.fileInput?.nativeElement) {
          this.fileInput.nativeElement.value = '';
        }
        this.consentimiento = false;
        // Limpia solo los campos variables, manteniendo datos del perfil
        this.modelo.tipo = '';
        this.modelo.asunto = '';
        this.modelo.mensaje = '';
        Swal.fire({
          icon: 'success',
          title: 'Mensaje enviado',
          text: 'Hemos recibido tu solicitud y te contactaremos pronto.',
          confirmButtonColor: '#00A5A5',
        });
        form.form.markAsPristine();
        form.form.markAsUntouched();
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'No se pudo enviar',
          text: err.error?.message || 'Intenta nuevamente.',
          confirmButtonColor: '#00A5A5',
        });
      },
    });
  }
}
