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

  constructor(
    private router: Router,
    private estudiantesService: EstudiantesService
  ) {}

  ngOnInit(): void {

    this.cargarAlertas();

  }

  cargarAlertas(): void {

    this.estudiantes =
      this.estudiantesService
        .obtenerEstudiantes()
        .filter(
          estudiante =>
            estudiante.riesgo === 'Medio' ||
            estudiante.riesgo === 'Alto'
        );

  }

  verSeguimiento(
    estudiante: number,
    grado: string,
    seccion: string
  ): void {

    this.router.navigate(['/seguimiento'], {

      queryParams: {

        estudiante: estudiante,

        grado: grado,

        seccion: seccion

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