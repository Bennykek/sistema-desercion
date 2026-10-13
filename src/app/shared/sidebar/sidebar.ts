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
    this.router.navigate(['/inicio']);
  }


  irEstudiantes(): void {
    this.router.navigate(['/estudiantes']);
  }

  irSeguimiento(): void {
    this.router.navigate(['/seguimiento']);
  }

  irCursos(): void {
    this.router.navigate(['/cursos']);
  }

  irAlertas(): void {
    this.router.navigate(['/alertas']);
  }

  cerrarSesion(): void {
    this.router.navigate(['/login']);
  }
}