import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-material-showcase',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="primary" style="vertical-align: middle; margin-right: 6px;">help</mat-icon>
      {{ data.titulo || 'Diálogo' }}
    </h2>
    <div mat-dialog-content>
      <p>{{ data.mensaje || '¿Confirmas la acción?' }}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-stroked-button (click)="cerrar(false)">Cancelar</button>
      <button mat-raised-button color="primary" (click)="cerrar(true)">
        <mat-icon>check</mat-icon> Aceptar
      </button>
    </div>
  `
})
export class MaterialShowcaseComponent {
 constructor(
    private ref: MatDialogRef<MaterialShowcaseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { titulo: string; mensaje: string }
  ) {}
  cerrar(ok: boolean) { this.ref.close(ok); }
}
