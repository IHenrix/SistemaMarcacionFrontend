import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { PersonasTabComponent } from './personas/personas-tab';
import { UsuariosTabComponent } from './usuarios/usuarios-tab';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    PersonasTabComponent,
    UsuariosTabComponent,
  ],
  templateUrl: './administrador.html',
  styleUrl: './administrador.scss',
})
export class AdministradorComponent {
  @ViewChild(UsuariosTabComponent) usuariosTab?: UsuariosTabComponent;

  tabs = [
    { key: 'personas', label: 'Personas' },
    { key: 'usuarios', label: 'Usuarios' },
  ];
  loadedTabs: boolean[] = [true, false];
  selectedIndex = 0;

  onTabChange(index: number) {
    this.selectedIndex = index;
    this.loadedTabs[index] = true;

    const currentKey = this.tabs[index]?.key;
    // Recargar personas disponibles cuando se cambia a la pestaña de Usuarios
    if (currentKey === 'usuarios' && this.usuariosTab) {
      this.usuariosTab.cargarPersonasDisponibles();
    }
  }
}
