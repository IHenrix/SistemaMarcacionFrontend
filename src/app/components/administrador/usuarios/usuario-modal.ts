import { Component, EventEmitter, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PersonaDto } from '../../../services/admin-personas.service';
import { RolDto, UsuarioDto } from '../../../services/admin-usuarios.service';

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatSelectModule, MatCheckboxModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './usuario-modal.html',
  styleUrls: ['./usuario-modal.scss'],
})
export class UsuarioModalComponent {
  form: FormGroup;
  rolesSeleccionados: number[] = [];
  submitted = false;
  showPassword = false;
  showConfirm = false;
  submittedPayload = new EventEmitter<any>();
  personasFiltradas: PersonaDto[] = [];
  filtroPersona = '';

  get confirmCtrl() {
    return this.form.get('confirmPassword');
  }

  get passwordMismatch(): boolean {
    return this.form.hasError('passwordMismatch');
  }

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<UsuarioModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      modo: 'nuevo' | 'editar';
      usuario?: UsuarioDto;
      roles: RolDto[];
      personas?: PersonaDto[];
    },
  ) {
    this.personasFiltradas = [...(data.personas || [])];

    this.form = this.fb.group(
      {
        id_persona: [data.usuario?.persona?.id_persona ?? '', Validators.required],
        username: [data.usuario?.username || '', Validators.required],
        password: [''],
        confirmPassword: [''],
        roles: [[], Validators.required],
      },
      { validators: this.passwordsMatchValidator() }
    );

    if (data.modo === 'nuevo') {
      this.form.get('password')?.setValidators([Validators.required]);
      this.form.get('confirmPassword')?.setValidators([Validators.required]);
    }
    this.form.get('password')?.updateValueAndValidity();
    this.form.get('confirmPassword')?.updateValueAndValidity();

    if (data.usuario) {
      this.form.patchValue({
        id_persona: data.usuario.persona.id_persona,
        username: data.usuario.username,
        roles: this.mapRolesToIds(data.usuario.roles),
      });
      this.rolesSeleccionados = this.mapRolesToIds(data.usuario.roles);
      this.form.get('password')?.setValue('');
      this.form.get('confirmPassword')?.setValue('');
      this.form.get('id_persona')?.disable({ emitEvent: false });
    }
  }

  private mapRolesToIds(roles: RolDto[]): number[] {
    if (!roles || !this.data.roles.length) return [];
    return this.data.roles
      .filter((r) => roles.some((ur) => ur.nombre === r.nombre))
      .map((r) => r.id_rol);
  }

  toggleRol(rolId: number, checked: boolean) {
    if (checked) {
      if (!this.rolesSeleccionados.includes(rolId)) {
        this.rolesSeleccionados = [...this.rolesSeleccionados, rolId];
      }
    } else {
      this.rolesSeleccionados = this.rolesSeleccionados.filter(
        (id) => id !== rolId
      );
    }
    this.form.patchValue({ roles: this.rolesSeleccionados }, { emitEvent: false });
  }

  toUpper(controlName: string) {
    const val = this.form.get(controlName)?.value;
    if (typeof val === 'string') {
      this.form.patchValue(
        { [controlName]: val.toUpperCase() },
        { emitEvent: false }
      );
    }
  }

  toLower(controlName: string) {
    const val = this.form.get(controlName)?.value;
    if (typeof val === 'string') {
      this.form.patchValue(
        { [controlName]: val.toLowerCase() },
        { emitEvent: false }
      );
    }
  }

  filtrarPersonas(term: string) {
    this.filtroPersona = term;
    const texto = term.toLowerCase().trim();
    const base = this.data.personas || [];
    if (!texto) {
      this.personasFiltradas = [...base];
      return;
    }
    this.personasFiltradas = base.filter((p) => {
      const cad = `${p.nombres} ${p.apellidos} ${p.dni}`.toLowerCase();
      return cad.includes(texto);
    });
  }

  onPersonaOpened() {
    this.filtroPersona = '';
    this.personasFiltradas = [...(this.data.personas || [])];
  }

  private passwordsMatchValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const fg = group as FormGroup;
      const passCtrl = fg.get('password');
      const confirmCtrl = fg.get('confirmPassword');
      if (!passCtrl || !confirmCtrl) return null;

      const pass = passCtrl.value || '';
      const confirm = confirmCtrl.value || '';

      if (!pass && !confirm) {
        if (confirmCtrl.errors) {
          const { passwordMismatch, ...rest } = confirmCtrl.errors;
          confirmCtrl.setErrors(Object.keys(rest).length ? rest : null);
        }
        fg.setErrors(null);
        return null;
      }

      if (pass !== confirm) {
        confirmCtrl.setErrors({
          ...(confirmCtrl.errors || {}),
          passwordMismatch: true,
        });
        fg.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        if (confirmCtrl.errors) {
          const { passwordMismatch, ...rest } = confirmCtrl.errors;
          confirmCtrl.setErrors(Object.keys(rest).length ? rest : null);
        }
        fg.setErrors(null);
        return null;
      }
    };
  }

  guardar() {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.rolesSeleccionados.length === 0) {
      this.form.patchValue({ roles: [] });
    }
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();
    this.submittedPayload.emit(payload);
  }

  cerrar(ok: boolean) {
    this.ref.close({ ok });
  }

  get personaSeleccionada(): PersonaDto | undefined {
    const id = this.form.get('id_persona')?.value;
    return this.data.personas?.find((p) => p.id_persona === id);
  }
}
