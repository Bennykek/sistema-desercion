import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Sidebar } from '../../shared/sidebar/sidebar';

import {
  EstudiantesService,
  Estudiante
} from '../../services/estudiantes';

@Component({
  selector: 'app-seguimiento',
  imports: [FormsModule, Sidebar],
  templateUrl: './seguimiento.html',
  styleUrl: './seguimiento.scss'
})
export class Seguimiento implements OnInit {

  grado = '';
  seccion = '';
  estudianteId: number | null = null;

  estudiantes: Estudiante[] = [];
  estudiantesFiltradas: Estudiante[] = [];
  estudianteSeleccionada: Estudiante | null = null;

  cargando = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private estudiantesService: EstudiantesService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.grado = params['grado'] || '';
      this.seccion = params['seccion'] || '';
      this.estudianteId = params['estudiante']
        ? Number(params['estudiante'])
        : null;

      this.cargarEstudiantes();
    });
  }

  cargarEstudiantes(): void {
    this.cargando = true;
    this.error = '';

    this.estudiantesService.obtenerEstudiantes().subscribe({
      next: estudiantes => {
        this.estudiantes = estudiantes;

        if (this.estudianteId !== null) {
          this.estudianteSeleccionada =
            estudiantes.find(
              estudiante => estudiante.id === this.estudianteId
            ) || null;

          if (!this.estudianteSeleccionada) {
            this.error = 'No se encontró la estudiante.';
          }
        } else {
          this.filtrarEstudiantes();
        }

        this.cargando = false;
      },
      error: error => {
        console.error(
          'Error al obtener estudiantes:',
          error
        );

        this.error =
          'No se pudieron cargar las estudiantes.';

        this.cargando = false;
      }
    });
  }

  filtrarEstudiantes(): void {
    const gradoSeleccionado = this.grado.trim();
    const seccionSeleccionada =
      this.seccion.trim().toUpperCase();

    if (
      gradoSeleccionado === '' ||
      seccionSeleccionada === ''
    ) {
      this.estudiantesFiltradas = [];
      return;
    }

    this.estudiantesFiltradas =
      this.estudiantes
        .filter(estudiante =>
          estudiante.grado === gradoSeleccionado &&
          estudiante.seccion.toUpperCase() === seccionSeleccionada
        )
        .sort((a, b) =>
          a.numeroOrden - b.numeroOrden
        );
  }

  cambiarGrado(): void {
    this.filtrarEstudiantes();
  }

  cambiarSeccion(): void {
    this.seccion = this.seccion.toUpperCase();
    this.filtrarEstudiantes();
  }

  verSeguimiento(estudiante: Estudiante): void {
    this.router.navigate(['/seguimiento'], {
      queryParams: {
        estudiante: estudiante.id,
        grado: estudiante.grado,
        seccion: estudiante.seccion
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }
}