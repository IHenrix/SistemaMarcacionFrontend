import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, ViewEncapsulation, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { PersonaDto } from '../../../services/admin-personas.service';
import { AdminUsuariosService, AreaDto } from '../../../services/admin-usuarios.service';

@Component({
  selector: 'app-persona-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatSelectModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './persona-modal.html',
  styleUrls: ['./persona-modal.scss'],
})
export class PersonaModalComponent {
  form: FormGroup;
  submitted = false;
  submittedPayload = new EventEmitter<any>();
  areas: AreaDto[] = [];
  private adminUsuariosService = inject(AdminUsuariosService);

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<PersonaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { modo: 'nuevo' | 'editar'; persona?: PersonaDto },
  ) {
    this.form = this.fb.group({
      dni: [data.persona?.dni || '', Validators.required],
      nombres: [data.persona?.nombres || '', Validators.required],
      apellidos: [data.persona?.apellidos || '', Validators.required],
      telefono: [data.persona?.telefono || ''],
      correo: [data.persona?.correo || '', [Validators.required, Validators.email]],
      id_area: [data.persona?.id_area || null],
      estado: [{ value: data.persona?.estado ?? 1, disabled: data.modo === 'nuevo' }],
    });

    this.cargarAreas();
  }

  private cargarAreas() {
    this.adminUsuariosService.listarAreas().subscribe({
      next: (data) => {
        this.areas = data.filter(a => a.estado === 1);
      },
      error: (err) => {
        console.error('Error al cargar áreas:', err);
      },
    });
  }

  guardar() {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submittedPayload.emit(this.form.getRawValue());
  }

  cerrar(ok: boolean) {
    this.ref.close({ ok });
  }

  toUpper(controlName: string) {
    const value = this.form.get(controlName)?.value;
    if (typeof value === 'string') {
      this.form.patchValue({ [controlName]: value.toUpperCase() }, { emitEvent: false });
    }
  }
}
