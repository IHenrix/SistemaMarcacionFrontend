import { Component, inject } from '@angular/core';
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
export class ContactoComponent {
  private readonly contactoService = inject(ContactoService);
  private readonly usuarioService = inject(UsuarioService);

  protected modelo: ContactoRequest = {
    nombre: '',
    email: '',
    telefono: '',
    tipo: '',
    asunto: '',
    mensaje: '',
  };

  protected cargando = false;
  protected soloLecturaNombre = false;
  protected soloLecturaEmail = false;

  ngOnInit(): void {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (res) => {
        const user: Usuario | undefined = res.data;
        if (user) {
          this.modelo.nombre = `${user.nombres || ''} ${user.apellidos || ''}`.trim();
          this.modelo.email = user.email || '';
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

  protected enviar(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    this.cargando = true;
    this.contactoService.enviar(this.modelo).subscribe({
      next: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'success',
          title: 'Mensaje enviado',
          text: 'Hemos recibido tu solicitud y te contactaremos pronto.',
          confirmButtonColor: '#00A5A5',
        });
        form.resetForm();
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
