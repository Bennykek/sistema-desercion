import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../shared/sidebar/sidebar';
import {
  EstudiantesService,
  Estudiante
} from '../../services/estudiantes';
import {
  CursosService,
  Curso
} from '../../services/cursos';
import { NotasService } from '../../services/notas';
import {
  FaltasService,
  Falta
} from '../../services/faltas';

@Component({
  selector: 'app-seguimiento',
  imports: [FormsModule, Sidebar],
  templateUrl: './seguimiento.html',
  styleUrl: './seguimiento.scss'
})
export class Seguimiento {

  estudiante = '';

  grado = '';
  seccion = '';

  estudiantes: Estudiante[] = [];
  cursos: Curso[] = [];

  estudianteSeleccionada: Estudiante | undefined;

  semestreSeleccionado = 1;

  notas: {
    cursoId: number;
    nombreCurso: string;
    calificacion: number | null;
  }[] = [];

  promedioSemestre = 0;
  promedioGeneral = 0;

  faltas: Falta[] = [];

  mostrarFormularioFalta = false;
  mostrarEditarFalta = false;

  faltaEditando = 0;

  nuevaFecha = '';
  nuevaObservacion = '';

  fechaEditada = '';
  observacionEditada = '';

  observaciones = '';

  nivelRiesgo = '';
  mostrarAlerta = false;
  guardado = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private estudiantesService: EstudiantesService,
    private cursosService: CursosService,
    private notasService: NotasService,
    private faltasService: FaltasService
  ) {}

  ngOnInit(): void {

    this.estudiantes =
      this.estudiantesService.obtenerEstudiantes();

    this.route.queryParams.subscribe(params => {

      this.estudiante =
        params['estudiante'] || '';

      this.grado =
        params['grado'] || '';

      this.seccion =
        params['seccion'] || '';

      this.buscarEstudiante();

    });

  }

  seleccionarEstudiante(id: number): void {

    this.estudiante = id.toString();

    this.buscarEstudiante();

  }

  buscarEstudiante(): void {

    const id = Number(this.estudiante);

    this.estudianteSeleccionada =
      this.estudiantes.find(
        estudiante => estudiante.id === id
      );

    if (this.estudianteSeleccionada) {

      this.grado =
        this.estudianteSeleccionada.grado;

      this.seccion =
        this.estudianteSeleccionada.seccion;

      this.cargarCursos();

      this.cargarFaltas();

    }

  }

  cargarCursos(): void {

    this.cursos =
      this.cursosService.obtenerCursosPorGrado(
        this.grado
      );

    this.cargarNotas();

  }

  cargarNotas(): void {

    if (!this.estudianteSeleccionada) {
      return;
    }

    const notasRegistradas =
      this.notasService.obtenerNotasEstudiante(
        this.estudianteSeleccionada.id,
        this.semestreSeleccionado
      );

    this.notas = this.cursos.map(curso => {

      const notaExistente =
        notasRegistradas.find(
          nota => nota.cursoId === curso.id
        );

      return {

        cursoId: curso.id,

        nombreCurso: curso.nombre,

        calificacion:
          notaExistente?.calificacion ?? null

      };

    });

    this.calcularPromedios();

  }

  cargarFaltas(): void {

    if (!this.estudianteSeleccionada) {
      return;
    }

    this.faltas =
      this.faltasService.obtenerFaltasEstudiante(
        this.estudianteSeleccionada.id
      );

  }

  cambiarSemestre(): void {

    this.guardado = false;

    this.cargarNotas();

  }

  mostrarAgregarFalta(): void {

    this.nuevaFecha = '';

    this.nuevaObservacion = '';

    this.mostrarFormularioFalta = true;

    this.mostrarEditarFalta = false;

  }

  cancelarAgregarFalta(): void {

    this.nuevaFecha = '';

    this.nuevaObservacion = '';

    this.mostrarFormularioFalta = false;

  }

  agregarFalta(): void {

    if (!this.estudianteSeleccionada) {
      return;
    }

    if (this.nuevaFecha.trim() === '') {
      return;
    }

    this.faltasService.agregarFalta(

      this.estudianteSeleccionada.id,

      this.nuevaFecha,

      this.nuevaObservacion.trim(),

      this.semestreSeleccionado

    );

    this.cargarFaltas();

    this.cancelarAgregarFalta();

  }

  mostrarEditarFaltaRegistro(id: number): void {

    const falta =
      this.faltas.find(
        falta => falta.id === id
      );

    if (!falta) {
      return;
    }

    this.faltaEditando = id;

    this.fechaEditada =
      falta.fecha;

    this.observacionEditada =
      falta.observacion;

    this.mostrarEditarFalta = true;

    this.mostrarFormularioFalta = false;

  }

  cancelarEditarFalta(): void {

    this.faltaEditando = 0;

    this.fechaEditada = '';

    this.observacionEditada = '';

    this.mostrarEditarFalta = false;

  }

  guardarEdicionFalta(): void {

    if (
      this.faltaEditando === 0 ||
      this.fechaEditada.trim() === ''
    ) {

      return;

    }

    this.faltasService.editarFalta(

      this.faltaEditando,

      this.fechaEditada,

      this.observacionEditada.trim(),

      this.semestreSeleccionado

    );

    this.cargarFaltas();

    this.cancelarEditarFalta();

  }

  eliminarFalta(id: number): void {

    const falta =
      this.faltas.find(
        falta => falta.id === id
      );

    if (!falta) {
      return;
    }

    const confirmar = window.confirm(
      '¿Está seguro de eliminar esta falta?'
    );

    if (!confirmar) {
      return;
    }

    this.faltasService.eliminarFalta(id);

    this.cargarFaltas();

  }

  contarFaltas(): number {

    if (!this.estudianteSeleccionada) {
      return 0;
    }

    return this.faltasService.contarFaltas(
      this.estudianteSeleccionada.id
    );

  }

  contarFaltasSemestre(): number {

    if (!this.estudianteSeleccionada) {
      return 0;
    }

    return this.faltasService.contarFaltasPorSemestre(

      this.estudianteSeleccionada.id,

      this.semestreSeleccionado

    );

  }

  guardarNotas(): void {

    if (!this.estudianteSeleccionada) {
      return;
    }

    for (const nota of this.notas) {

      this.notasService.guardarNota(

        this.estudianteSeleccionada.id,

        nota.cursoId,

        this.semestreSeleccionado,

        nota.calificacion

      );

    }

    this.calcularPromedios();

    this.nivelRiesgo =
      this.calcularRiesgo();

    this.estudiantesService.actualizarRiesgo(

      this.estudianteSeleccionada.id,

      this.nivelRiesgo

    );

    this.mostrarAlerta =
      this.nivelRiesgo === 'Medio' ||
      this.nivelRiesgo === 'Alto';

    this.guardado = true;

  }

  calcularPromedios(): void {

    if (!this.estudianteSeleccionada) {
      return;
    }

    this.promedioSemestre =
      this.notasService.calcularPromedioSemestre(

        this.estudianteSeleccionada.id,

        this.semestreSeleccionado

      );

    this.promedioGeneral =
      this.notasService.calcularPromedioGeneral(

        this.estudianteSeleccionada.id

      );

  }

  calcularPromedioCurso(
    cursoId: number
  ): number {

    if (!this.estudianteSeleccionada) {
      return 0;
    }

    return this.notasService.calcularPromedioCurso(

      this.estudianteSeleccionada.id,

      cursoId

    );

  }

  calcularRiesgo(): string {

    let puntaje = 0;

    if (this.promedioGeneral > 0) {

      if (this.promedioGeneral < 11) {

        puntaje += 2;

      } else if (this.promedioGeneral < 14) {

        puntaje += 1;

      }

    }

    const totalFaltas =
      this.contarFaltas();

    if (totalFaltas >= 10) {

      puntaje += 2;

    } else if (totalFaltas >= 5) {

      puntaje += 1;

    }

    if (puntaje >= 4) {
      return 'Alto';
    }

    if (puntaje >= 2) {
      return 'Medio';
    }

    return 'Bajo';

  }

  cancelar(): void {

    if (this.estudianteSeleccionada) {

      this.cargarNotas();

    }

    this.guardado = false;

    this.nivelRiesgo = '';

    this.mostrarAlerta = false;

  }

  volver(): void {

    this.router.navigate(
      ['/estudiantes'],
      {
        queryParams: {
          grado: this.grado,
          seccion: this.seccion
        }
      }
    );

  }

}