import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '@app/services/auth.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPasswordComponent implements OnInit {
  formResetPassword!: FormGroup;
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  version: string = environment.version;
  protected loading = false;
  protected token: string | null = null;
  protected tokenValid = false;
  protected hidePassword = true;
  protected hideConfirmPassword = true;

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      Swal.fire({
        icon: 'error',
        title: 'No se encontró un token de recuperación válido',
        text: 'Sistema de Marcaciones',
        confirmButtonColor: '#6B8E23',
        confirmButtonText: 'Ir al Login',
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    this.validateToken();
    this.buildForm();
  }

  buildForm() {
    this.formResetPassword = new FormGroup(
      {
        newPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  validateToken() {
    if (!this.token) return;

    this.loading = true;

    this.authService.validateResetToken(this.token).subscribe({
      next: () => {
        this.tokenValid = true;
        this.loading = false;
      },
      error: (err) => {
        const message =
          err?.error?.message ||
          'El token ha expirado o es inválido. Solicite un nuevo enlace de recuperación.';
        Swal.fire({
          icon: 'error',
          title: message,
          text: 'Sistema de Marcaciones',
          confirmButtonColor: '#6B8E23',
          confirmButtonText: 'Ir al Login',
        }).then(() => {
          this.router.navigate(['/login']);
        });
        this.loading = false;
      },
    });
  }

  resetPassword() {
    if (this.formResetPassword.invalid || !this.token) {
      Swal.fire({
        icon: 'error',
        title: 'Por favor complete todos los campos correctamente',
        text: 'Sistema de Marcaciones',
        confirmButtonColor: '#6B8E23',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    const newPassword = this.formResetPassword.get('newPassword')?.value as string;

    this.loading = true;

    this.authService
      .resetPassword({ token: this.token, newPassword })
      .subscribe({
        next: (response) => {
          this.loading = false;

          Swal.fire({
            icon: 'success',
            title: response.message,
            text: 'Sistema de Marcaciones',
            confirmButtonColor: '#6B8E23',
            confirmButtonText: 'Ir al Login',
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (err) => {
          const message =
            err?.error?.message ||
            'No se pudo actualizar la contraseña. Intente nuevamente.';
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
