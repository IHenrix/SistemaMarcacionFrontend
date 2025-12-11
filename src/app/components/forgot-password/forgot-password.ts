import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '@app/services/auth.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPasswordComponent {
  formForgotPassword!: FormGroup;
  private router = inject(Router);
  private authService = inject(AuthService);

  version: string = environment.version;
  protected loading = false;
  protected emailSent = false;

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.formForgotPassword = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  sendResetLink() {
    if (this.formForgotPassword.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Por favor ingrese un correo electrónico válido',
        text: 'Sistema de Marcaciones',
        confirmButtonColor: '#6B8E23',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    const email = this.formForgotPassword.get('email')?.value as string;

    this.loading = true;

    this.authService.forgotPassword({ email }).subscribe({
      next: (response) => {
        this.loading = false;
        this.emailSent = true;

        Swal.fire({
          icon: 'success',
          title: response.message,
          text: 'Sistema de Marcaciones',
          confirmButtonColor: '#6B8E23',
          confirmButtonText: 'Aceptar',
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        const message =
          err?.error?.message ||
          'No se pudo enviar el email. Verifique que el correo sea correcto.';
        Swal.fire({
          icon: 'error',
          title: message,
          text: 'Sistema de Marcaciones',
          confirmButtonColor: '#6B8E23',
          confirmButtonText: 'Aceptar',
        });
        this.loading = false;
      },
    });
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }
}
