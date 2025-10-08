import { Component, inject } from '@angular/core';
import { SharedImports } from '../../shared/shared/shared.imports';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedImports],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  formLogin!: FormGroup;
  private router = inject(Router);

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.formLogin = new FormGroup({
      usuario: new FormControl('enrique.pdg@gmail.com'),
      password: new FormControl('Pedrito1415'),
    });
  }

  login() {
    const data = this.formLogin.value;
    let username = data.usuario;
    let pass = data.password;

    if (username != null && username != '' && pass != null && pass != '') {
      this.router.navigate(['/menu-principal']);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Por favor ingrese con su correo electrónico y contraseña',
        text: environment.systemName,
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        confirmButtonColor: '#00A5A5',
        confirmButtonText: '<span style="padding: 0 15px;">Aceptar</span>',
      });
    }
  }
}
