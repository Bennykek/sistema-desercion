import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, Sidebar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  grado = '';
  seccion = '';

  constructor(private router: Router) {}

  verEstudiantes(): void {

    if (this.grado.trim() === '' || this.seccion.trim() === '') {
      return;
    }

    this.router.navigate(['/estudiantes'], {
      queryParams: {
        grado: this.grado,
        seccion: this.seccion
      }
    });

  }

}