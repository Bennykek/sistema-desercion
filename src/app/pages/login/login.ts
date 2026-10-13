
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  password = '';
  mostrarError = false;

  constructor(private router: Router) {}

  iniciarSesion(): void {
    this.mostrarError = false;

    if (this.password.trim() === '') {
      this.mostrarError = true;
      return;
    }

    this.router.navigate(['/inicio']);
  }
}
