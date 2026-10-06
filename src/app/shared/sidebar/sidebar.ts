import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {

  constructor(private router: Router) {}

  irInicio(): void {
    this.router.navigate(['/dashboard']);
  }

  irEstudiantes(): void {
    this.router.navigate(['/estudiantes']);
  }

  irSeguimiento(): void {
    this.router.navigate(['/seguimiento']);
  }

  irAlertas(): void {
    this.router.navigate(['/alertas']);
  }

  cerrarSesion(): void {
    this.router.navigate(['/login']);
  }
irCursos(): void {
  this.router.navigate(['/cursos']);
}
}