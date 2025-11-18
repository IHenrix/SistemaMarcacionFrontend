import { Component, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { SharedImports } from '@app/shared/shared.imports';
import { environment } from '@env/environment';

@Component({
  selector: 'app-login',
  imports: [SharedImports],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  formLogin!: FormGroup;
  private router = inject(Router)

  version: string = environment.version

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
      this.router.navigate(['/sistema/menu-principal']);
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
