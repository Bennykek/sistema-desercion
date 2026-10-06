import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Sidebar } from '../../shared/sidebar/sidebar';
import {
  EstudiantesService,
  Estudiante
} from '../../services/estudiantes';

@Component({
  selector: 'app-alertas',
  imports: [Sidebar],
  templateUrl: './alertas.html',
  styleUrl: './alertas.scss'
})
export class Alertas {

  alertasAtendidas: number[] = [];

  estudiantes: Estudiante[] = [];

  cargando = false;
  error = '';

  constructor(
    private router: Router,
    private estudiantesService: EstudiantesService
  ) {}

  ngOnInit(): void {
    this.cargarAlertas();
  }

  cargarAlertas(): void {

    this.cargando = true;
    this.error = '';

    this.estudiantesService.obtenerEstudiantes().subscribe({

      next: (estudiantes: Estudiante[]) => {

        this.estudiantes = estudiantes.filter(
          (estudiante: Estudiante) =>
            estudiante.riesgo === 'Medio' ||
            estudiante.riesgo === 'Alto'
        );

        this.cargando = false;

      },

      error: (error) => {

        console.error('Error al obtener las alertas:', error);

        this.error = 'No se pudieron cargar las alertas.';
        this.cargando = false;

      }

    });

  }

  verSeguimiento(
    estudiante: number,
    grado: string,
    seccion: string
  ): void {

    this.router.navigate(['/seguimiento'], {
      queryParams: {
        estudiante,
        grado,
        seccion
      }
    });

  }

  atenderAlerta(estudiante: number): void {

    if (!this.alertasAtendidas.includes(estudiante)) {
      this.alertasAtendidas.push(estudiante);
    }

  }

  estaAtendida(estudiante: number): boolean {

    return this.alertasAtendidas.includes(estudiante);

  }

  obtenerClaseRiesgo(riesgo: string): string {

    if (riesgo === 'Alto') {
      return 'risk-high';
    }

    if (riesgo === 'Medio') {
      return 'risk-medium';
    }

    return 'risk-low';

  }

}