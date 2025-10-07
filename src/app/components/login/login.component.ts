import { Component } from '@angular/core';
import { SharedImports } from '../../shared/shared/shared.imports';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedImports],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
 formLogin!: FormGroup;

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(){
    this.formLogin = new FormGroup({
      usuario: new FormControl(""),
      password: new FormControl(""),
    });
  }


  login () {

    const data = this.formLogin.value;
    let username = data.usuario;
    let pass = data.password;

    if ( username != null && username != "" && pass != null && pass != "") {



    } else {
      Swal.fire({
        icon: "warning",
        title: "Por favor ingrese con su usuario y contraseña de red",
        text: "",
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        confirmButtonColor: '#00A5A5',
        confirmButtonText: '<span style="padding: 0 15px;">OK</span>'
      });
    }

  }

}
