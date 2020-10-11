import { Component, OnInit } from '@angular/core';
import swal from 'sweetalert2';
import { Usuario } from './usuario';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  titulo = 'Sign In';
  usuario: Usuario;
  constructor(public authService: AuthService,
    private router: Router) {
    this.usuario = new Usuario();
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate (['/clientes']);
      swal.fire('Aviso', `Ya estás autenticado! ${this.authService.usuario.username}`, 'info');
    }
  }

  login(): void {
    console.log(this.usuario);
    if (this.usuario.username == null || this.usuario.password == null) {
      swal.fire('Error Login', 'username y password no pueden ser null', 'error');
      return;
    }
    this.authService.login(this.usuario).subscribe(
      response => {
        console.log(response);
        this.authService.guardarUsuario(response.access_token);
        this.authService.guardarToken(response.access_token);
        const usuario = this.authService.usuario;
        console.log(`login con éxito de ${usuario.username}`);
        this.router.navigate(['/clientes']);
      },
      err => {
        if (err.status === 400) {
        swal.fire('Error Login', 'las credenciales son incorrectas!', 'error');
        }
      }
      );
    return;
  }


}
