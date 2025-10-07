import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-modulos',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './modulos.component.html',
  styleUrl: './modulos.component.scss',
})
export class ModulosComponent {}
