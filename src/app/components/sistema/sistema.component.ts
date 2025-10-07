import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent,FooterComponent],
  templateUrl: './sistema.component.html',
  styleUrl: './sistema.component.scss',
})
export class SistemaComponent {}
