import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Asistencia, AsistenciasService } from '../../services/asistencias';
import { Curso, CursosService } from '../../services/cursos';
import { Estudiante, EstudiantesService } from '../../services/estudiantes';
import { Nota, NotasService } from '../../services/notas';
import {
  Observacion,
  ObservacionesService
} from '../../services/observaciones';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-seguimiento',
  imports: [FormsModule, Sidebar, DecimalPipe],
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

  // Asistencias
  asistencias: Asistencia[] = [];
  cargandoAsistencias = false;
  guardandoAsistencia = false;
  errorAsistencia = '';
  mensajeAsistencia = '';

  fechaAsistencia = this.fechaActual();
  estadoAsistencia: 'Asistió' | 'Inasistió' = 'Asistió';
  observacionAsistencia = '';
  semestreAsistencia = 1;

  // Cursos y calificaciones
  cursos: Curso[] = [];
  notas: Nota[] = [];
  semestreNotas = 1;
  calificacionesEdicion: { [cursoId: number]: number | null } = {};
  cargandoNotas = false;
  guardandoNotaCurso: number | null = null;
  errorNotas = '';
  mensajeNotas = '';

  // Observaciones de seguimiento
  observaciones: Observacion[] = [];
  textoObservacion = '';
  cargandoObservaciones = false;
  guardandoObservacion = false;
  errorObservaciones = '';
  mensajeObservaciones = '';

  // Modal de confirmación de eliminación
  confirmacionAbierta = false;
  eliminandoRegistro = false;

  tipoEliminacion: 'asistencia' | 'nota' | 'observacion' | null = null;

  asistenciaPendiente: Asistencia | null = null;
  cursoPendiente: Curso | null = null;
  observacionPendiente: Observacion | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private estudiantesService: EstudiantesService,
    private asistenciasService: AsistenciasService,
    private notasService: NotasService,
    private cursosService: CursosService,
    private observacionesService: ObservacionesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.grado = params['grado'] || '';
      this.seccion = params['seccion'] || '';

      this.estudianteId = params['estudiante']
        ? Number(params['estudiante'])
        : null;

      this.estudianteSeleccionada = null;

      this.error = '';
      this.errorAsistencia = '';
      this.mensajeAsistencia = '';
      this.errorNotas = '';
      this.mensajeNotas = '';
      this.errorObservaciones = '';
      this.mensajeObservaciones = '';

      this.textoObservacion = '';
      this.cancelarEliminacion();

      this.cargarEstudiantes();
    });
  }

  private fechaActual(): string {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  private normalizarGrado(grado: string): string {
    return grado.trim().match(/\d+/)?.[0] ?? grado.trim().toLowerCase();
  }

  cargarEstudiantes(): void {
    this.cargando = true;
    this.error = '';

    this.estudiantesService.obtenerEstudiantes().subscribe({
      next: estudiantes => {
        this.estudiantes = estudiantes;

        if (this.estudianteId !== null) {
          this.estudianteSeleccionada =
            estudiantes.find(e => e.id === this.estudianteId) ?? null;

          if (this.estudianteSeleccionada) {
            this.cargarAsistencias();
            this.cargarCursos();
            this.cargarNotas();
            this.cargarObservaciones();
          } else {
            this.error = 'No se encontró la estudiante.';

            this.asistencias = [];
            this.cursos = [];
            this.notas = [];
            this.observaciones = [];
            this.calificacionesEdicion = {};
          }
        } else {
          this.estudianteSeleccionada = null;

          this.asistencias = [];
          this.cursos = [];
          this.notas = [];
          this.observaciones = [];
          this.calificacionesEdicion = {};

          this.filtrarEstudiantes();
        }

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al obtener estudiantes:', error);
        this.error = 'No se pudieron cargar las estudiantes.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarEstudiantes(): void {
    const gradoSeleccionado = this.grado.trim();
    const seccionSeleccionada = this.seccion.trim().toUpperCase();

    if (!gradoSeleccionado || !seccionSeleccionada) {
      this.estudiantesFiltradas = [];
      return;
    }

    this.estudiantesFiltradas = this.estudiantes
      .filter(estudiante =>
        estudiante.grado === gradoSeleccionado &&
        estudiante.seccion.trim().toUpperCase() === seccionSeleccionada
      )
      .sort((a, b) => a.numeroOrden - b.numeroOrden);
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

  // =========================
  // ASISTENCIAS
  // =========================

  cargarAsistencias(): void {
    if (this.estudianteId === null) {
      this.asistencias = [];
      return;
    }

    this.cargandoAsistencias = true;
    this.errorAsistencia = '';

    this.asistenciasService.obtenerAsistencias(this.estudianteId).subscribe({
      next: asistencias => {
        this.asistencias = [...asistencias].sort((a, b) =>
          b.fecha.localeCompare(a.fecha)
        );

        this.cargandoAsistencias = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al cargar asistencias:', error);
        this.errorAsistencia = 'No se pudo cargar el historial de asistencia.';
        this.cargandoAsistencias = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarAsistencia(): void {
    if (this.estudianteId === null) {
      this.errorAsistencia =
        'Selecciona una estudiante antes de registrar asistencia.';
      return;
    }

    if (!this.fechaAsistencia) {
      this.errorAsistencia = 'Selecciona una fecha para la asistencia.';
      return;
    }

    this.guardandoAsistencia = true;
    this.errorAsistencia = '';
    this.mensajeAsistencia = '';

    this.asistenciasService.registrarAsistencia(
      this.estudianteId,
      this.fechaAsistencia,
      this.estadoAsistencia,
      this.observacionAsistencia.trim() || null,
      this.semestreAsistencia
    ).subscribe({
      next: asistencia => {
        this.asistencias = [
          asistencia,
          ...this.asistencias.filter(a => a.fecha !== asistencia.fecha)
        ].sort((a, b) => b.fecha.localeCompare(a.fecha));

        this.observacionAsistencia = '';
        this.mensajeAsistencia = 'La asistencia se guardó correctamente.';
        this.guardandoAsistencia = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al guardar asistencia:', error);
        this.errorAsistencia =
          'No se pudo guardar la asistencia. Verifica la conexión con el servidor.';
        this.guardandoAsistencia = false;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarAsistencia(asistencia: Asistencia): void {
    if (this.estudianteId === null) {
      return;
    }

    this.tipoEliminacion = 'asistencia';
    this.asistenciaPendiente = asistencia;
    this.cursoPendiente = null;
    this.observacionPendiente = null;
    this.confirmacionAbierta = true;
  }

  private confirmarEliminarAsistencia(asistencia: Asistencia): void {
    if (this.estudianteId === null) {
      return;
    }

    this.eliminandoRegistro = true;
    this.errorAsistencia = '';
    this.mensajeAsistencia = '';

    this.asistenciasService.eliminarAsistencia(
      this.estudianteId,
      asistencia.fecha
    ).subscribe({
      next: () => {
        this.asistencias = this.asistencias.filter(
          a => a.fecha !== asistencia.fecha
        );

        this.mensajeAsistencia =
          'El registro de asistencia se eliminó correctamente.';

        this.finalizarEliminacion();
      },
      error: error => {
        console.error('Error al eliminar asistencia:', error);
        this.errorAsistencia =
          'No se pudo eliminar el registro de asistencia.';

        this.finalizarEliminacion();
      }
    });
  }

  // =========================
  // CURSOS Y CALIFICACIONES
  // =========================

  cargarCursos(): void {
    if (!this.estudianteSeleccionada) {
      this.cursos = [];
      return;
    }

    const gradoEstudiante = this.normalizarGrado(
      this.estudianteSeleccionada.grado
    );

    this.cursosService.obtenerCursos().subscribe({
      next: cursos => {
        this.cursos = cursos
          .filter(curso =>
            this.normalizarGrado(curso.grado) === gradoEstudiante
          )
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al cargar cursos:', error);
        this.errorNotas = 'No se pudieron cargar los cursos.';
        this.cdr.detectChanges();
      }
    });
  }

  cambiarSemestreNotas(): void {
    this.mensajeNotas = '';
    this.errorNotas = '';
    this.cargarNotas();
  }

  cargarNotas(): void {
    if (this.estudianteId === null) {
      this.notas = [];
      this.calificacionesEdicion = {};
      return;
    }

    this.cargandoNotas = true;
    this.errorNotas = '';

    this.notasService.obtenerNotasEstudiante(
      this.estudianteId,
      this.semestreNotas
    ).subscribe({
      next: notas => {
        this.notas = notas;
        this.calificacionesEdicion = {};

        for (const nota of notas) {
          this.calificacionesEdicion[nota.cursoId] = nota.calificacion;
        }

        this.cargandoNotas = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al cargar calificaciones:', error);
        this.errorNotas = 'No se pudieron cargar las calificaciones.';
        this.cargandoNotas = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerNotaCurso(cursoId: number): number | null {
    return this.notas.find(nota =>
      nota.cursoId === cursoId &&
      nota.semestre === this.semestreNotas
    )?.calificacion ?? null;
  }

  guardarNota(curso: Curso): void {
    if (this.estudianteId === null) {
      this.errorNotas = 'No se ha seleccionado una estudiante.';
      return;
    }

    const calificacion = this.calificacionesEdicion[curso.id];

    if (
      calificacion === null ||
      calificacion === undefined ||
      !Number.isFinite(calificacion) ||
      calificacion < 0 ||
      calificacion > 20
    ) {
      this.errorNotas = 'Ingresa una calificación válida entre 0 y 20.';
      return;
    }

    this.guardandoNotaCurso = curso.id;
    this.errorNotas = '';
    this.mensajeNotas = '';

    this.notasService.guardarNota(
      this.estudianteId,
      curso.id,
      this.semestreNotas,
      calificacion
    ).subscribe({
      next: notaGuardada => {
        this.notas = [
          ...this.notas.filter(nota =>
            nota.cursoId !== curso.id ||
            nota.semestre !== this.semestreNotas
          ),
          notaGuardada
        ];

        this.calificacionesEdicion[curso.id] = notaGuardada.calificacion;
        this.mensajeNotas =
          `La nota de ${curso.nombre} se guardó correctamente.`;

        this.guardandoNotaCurso = null;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al guardar calificación:', error);
        this.errorNotas =
          'No se pudo guardar la calificación. Verifica la conexión con el servidor.';

        this.guardandoNotaCurso = null;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerPromedioSemestre(): number {
    return this.notasService.calcularPromedioSemestre(this.notas);
  }

  eliminarNota(curso: Curso): void {
    if (
      this.estudianteId === null ||
      this.obtenerNotaCurso(curso.id) === null
    ) {
      return;
    }

    this.tipoEliminacion = 'nota';
    this.cursoPendiente = curso;
    this.asistenciaPendiente = null;
    this.observacionPendiente = null;
    this.confirmacionAbierta = true;
  }

  private confirmarEliminarNota(curso: Curso): void {
    if (this.estudianteId === null) {
      return;
    }

    this.eliminandoRegistro = true;
    this.errorNotas = '';
    this.mensajeNotas = '';

    this.notasService.eliminarNota(
      this.estudianteId,
      curso.id,
      this.semestreNotas
    ).subscribe({
      next: () => {
        this.notas = this.notas.filter(nota =>
          nota.cursoId !== curso.id ||
          nota.semestre !== this.semestreNotas
        );

        this.calificacionesEdicion[curso.id] = null;
        this.mensajeNotas =
  `La nota de ${curso.nombre} se guardó correctamente.`;;

        this.finalizarEliminacion();
      },
      error: error => {
        console.error('Error al eliminar calificación:', error);
        this.errorNotas = 'No se pudo eliminar la calificación.';

        this.finalizarEliminacion();
      }
    });
  }

  // =========================
  // OBSERVACIONES
  // =========================

  cargarObservaciones(): void {
    if (this.estudianteId === null) {
      this.observaciones = [];
      return;
    }

    this.cargandoObservaciones = true;
    this.errorObservaciones = '';

    this.observacionesService
      .obtenerObservaciones(this.estudianteId)
      .subscribe({
        next: observaciones => {
          this.observaciones = [...observaciones].sort((a, b) =>
            b.fecha.localeCompare(a.fecha)
          );

          this.cargandoObservaciones = false;
          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Error al cargar observaciones:', error);

          this.errorObservaciones =
            'No se pudo cargar el historial de observaciones.';

          this.cargandoObservaciones = false;
          this.cdr.detectChanges();
        }
      });
  }

  guardarObservacion(): void {
    if (this.estudianteId === null) {
      this.errorObservaciones =
        'Selecciona una estudiante antes de continuar.';
      return;
    }

    const texto = this.textoObservacion.trim();

    if (!texto) {
      this.errorObservaciones =
        'Escribe una observación antes de guardarla.';
      return;
    }

    this.guardandoObservacion = true;
    this.errorObservaciones = '';
    this.mensajeObservaciones = '';

    this.observacionesService
      .registrarObservacion(this.estudianteId, texto)
      .subscribe({
        next: observacion => {
          this.observaciones = [
            observacion,
            ...this.observaciones.filter(item => item.id !== observacion.id)
          ].sort((a, b) => b.fecha.localeCompare(a.fecha));

          this.textoObservacion = '';
          this.mensajeObservaciones =
            'La observación se guardó correctamente.';

          this.guardandoObservacion = false;
          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Error al guardar observación:', error);

          this.errorObservaciones =
            'No se pudo guardar la observación. Verifica la conexión con el servidor.';

          this.guardandoObservacion = false;
          this.cdr.detectChanges();
        }
      });
  }

  eliminarObservacion(observacion: Observacion): void {
    if (this.estudianteId === null) {
      return;
    }

    this.tipoEliminacion = 'observacion';
    this.observacionPendiente = observacion;
    this.asistenciaPendiente = null;
    this.cursoPendiente = null;
    this.confirmacionAbierta = true;
  }

  private confirmarEliminarObservacion(
    observacion: Observacion
  ): void {
    this.eliminandoRegistro = true;
    this.errorObservaciones = '';
    this.mensajeObservaciones = '';

    this.observacionesService.eliminarObservacion(observacion.id).subscribe({
      next: () => {
        this.observaciones = this.observaciones.filter(
          item => item.id !== observacion.id
        );

        this.mensajeObservaciones =
          'La observación se eliminó correctamente.';

        this.finalizarEliminacion();
      },
      error: error => {
        console.error('Error al eliminar observación:', error);

        this.errorObservaciones =
          'No se pudo eliminar la observación.';

        this.finalizarEliminacion();
      }
    });
  }

  // =========================
  // CONFIRMACIÓN DE ELIMINACIÓN
  // =========================

  cancelarEliminacion(): void {
    if (this.eliminandoRegistro) {
      return;
    }

    this.confirmacionAbierta = false;
    this.tipoEliminacion = null;
    this.asistenciaPendiente = null;
    this.cursoPendiente = null;
    this.observacionPendiente = null;
  }

  confirmarEliminacion(): void {
    if (this.estudianteId === null || this.eliminandoRegistro) {
      return;
    }

    if (
      this.tipoEliminacion === 'asistencia' &&
      this.asistenciaPendiente
    ) {
      this.confirmarEliminarAsistencia(this.asistenciaPendiente);
      return;
    }

    if (this.tipoEliminacion === 'nota' && this.cursoPendiente) {
      this.confirmarEliminarNota(this.cursoPendiente);
      return;
    }

    if (
      this.tipoEliminacion === 'observacion' &&
      this.observacionPendiente
    ) {
      this.confirmarEliminarObservacion(this.observacionPendiente);
    }
  }

  private finalizarEliminacion(): void {
    this.eliminandoRegistro = false;
    this.confirmacionAbierta = false;
    this.tipoEliminacion = null;
    this.asistenciaPendiente = null;
    this.cursoPendiente = null;
    this.observacionPendiente = null;

    this.cdr.detectChanges();
  }

  // =========================
  // NAVEGACIÓN
  // =========================

  volver(): void {
    this.cancelarEliminacion();

    this.router.navigate(['/seguimiento'], {
      queryParams: {
        grado: this.grado,
        seccion: this.seccion
      }
    });
  }
}
