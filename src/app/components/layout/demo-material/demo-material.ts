import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModules } from '@app/shared/material-shared.';
import { MaterialShowcaseComponent } from './material-showcase/material-showcase';
interface Usuario {
  nombre: string;
  ciudad: string;
  rol: string;
}
@Component({
  selector: 'app-demo-material',
  imports: [CommonModule, FormsModule, ...MaterialModules],
  templateUrl: './demo-material.html',
  styleUrl: './demo-material.scss',
})
export class DemoMaterialComponent {
  nombre = '';
  ciudad = '';
  fecha?: Date;
  suscrito = false;
  genero = '';
  habilitarAcciones = true;
  cargando = false;

  displayedColumns = ['nombre', 'ciudad', 'rol', 'acciones'];
  dataSource = new MatTableDataSource<Usuario>([
    { nombre: 'Enrique', ciudad: 'Lima', rol: 'Admin' },
    { nombre: 'Valerie', ciudad: 'Trujillo', rol: 'Editor' },
    { nombre: 'Santiago', ciudad: 'Arequipa', rol: 'Viewer' },
    { nombre: 'Pedro', ciudad: 'Chiclayo', rol: 'Editor' },
    { nombre: 'Nikol', ciudad: 'Piura', rol: 'Viewer' },
  ]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dialog: MatDialog, private snack: MatSnackBar) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  filtrarTabla(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  abrirDialogo() {
    const ref = this.dialog.open(MaterialShowcaseComponent, {
      width: '420px',
      data: { titulo: 'Confirmación', mensaje: '¿Deseas guardar los cambios?' }
    });
    ref.afterClosed().subscribe(ok => {
      this.snack.open(ok ? 'Cambios guardados' : 'Operación cancelada', 'Cerrar', {
        duration: ok ? 2200 : 1500
      });
    });
  }

  notificar() {
    this.snack.open('Hola desde MatSnackBar', 'Cerrar', { duration: 2000 });
  }

  toggleCarga() {
    this.cargando = !this.cargando;
  }

  limpiarFormulario() {
    this.nombre = '';
    this.ciudad = '';
    this.fecha = undefined;
    this.suscrito = false;
    this.genero = '';
  }
}
