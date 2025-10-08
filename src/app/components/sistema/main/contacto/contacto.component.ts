import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedImports } from '../../../../shared/shared/shared.imports';

@Component({
  selector: 'app-contacto',
    standalone: true,
  imports: [SharedImports],
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.scss'],
})
export class ContactoComponent {
  form: FormGroup;
  submitted = false;
  adjunto?: File;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      tipo: ['', [Validators.required]],
      asunto: ['', [Validators.required, Validators.minLength(5)]],
      mensaje: ['', [Validators.required, Validators.minLength(10)]],
      consent: [false, [Validators.requiredTrue]],
    });
  }

  onFileChange(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    // Validación simple de tamaño y tipo
    const maxMB = 5;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type) || file.size > maxMB * 1024 * 1024) {
      alert('Archivo no permitido. Usa PDF/JPG/PNG y máximo 5MB.');
      (evt.target as HTMLInputElement).value = '';
      this.adjunto = undefined;
      return;
    }
    this.adjunto = file;
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      // Marca todos para mostrar errores
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.form.value,
      adjuntoNombre: this.adjunto?.name || null,
    };

    // Aquí integrarías tu servicio HTTP real
    console.log('Contacto enviado:', payload);

    alert('¡Tu solicitud fue enviada correctamente!');
    this.onReset();
  }

  onReset() {
    this.submitted = false;
    this.adjunto = undefined;
    this.form.reset({
      nombre: '',
      email: '',
      telefono: '',
      tipo: '',
      asunto: '',
      mensaje: '',
      consent: false,
    });
  }

  onExportPDF() {
    // Placeholder: integra tu exportador real (ej. jsPDF)
    alert('Exportar a PDF (pendiente de integrar).');
  }
}
