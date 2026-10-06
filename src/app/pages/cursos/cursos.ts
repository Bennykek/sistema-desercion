import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../shared/sidebar/sidebar';

import {
  CursosService,
  Curso
} from '../../services/cursos';

@Component({
  selector: 'app-cursos',
  imports: [
    FormsModule,
    Sidebar
  ],
  templateUrl: './cursos.html',
  styleUrl: './cursos.scss'
})
export class Cursos implements OnInit {

  grado = '';
  cursos: Curso[] = [];
  todosLosCursos: Curso[] = [];

  mostrarFormulario = false;
  mostrarEditar = false;

  nuevoCurso = '';
  cursoEditando: number | null = null;
  nombreCursoEditado = '';

  error = '';
  procesando = false;

  constructor(
    private cursosService: CursosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCursos();
  }

  cargarCursos(): void {
    this.cursosService.obtenerCursos().subscribe({
      next: cursos => {
        this.todosLosCursos = cursos;
        this.filtrarCursos();
        this.actualizarVista();
      },
      error: error => {
        console.error('Error al cargar cursos:', error);
        this.error = 'No se pudieron cargar los cursos.';
        this.actualizarVista();
      }
    });
  }

  filtrarCursos(): void {
    this.cursos = this.grado
      ? this.todosLosCursos.filter(curso => curso.grado === this.grado)
      : [];
  }

  cambiarGrado(): void {
    this.cancelarAgregar();
    this.cancelarEditar();
    this.error = '';
    this.filtrarCursos();
    this.actualizarVista();
  }

  mostrarAgregarCurso(): void {
    if (this.procesando) return;

    this.nuevoCurso = '';
    this.mostrarFormulario = true;
    this.mostrarEditar = false;
    this.actualizarVista();
  }

  cancelarAgregar(): void {
    this.nuevoCurso = '';
    this.mostrarFormulario = false;
  }

  agregarCurso(): void {
    if (this.procesando) return;

    const nombre = this.nuevoCurso.trim();

    if (!nombre || !this.grado) return;

    this.procesando = true;
    this.error = '';

    this.cursosService.agregarCurso(nombre, this.grado).subscribe({
      next: curso => {
        this.todosLosCursos.push(curso);
        this.filtrarCursos();
        this.cancelarAgregar();
        this.finalizarOperacion();
      },
      error: error => {
        console.error('Error al agregar curso:', error);
        this.error = 'No se pudo agregar el curso.';
        this.finalizarOperacion();
      }
    });
  }

  mostrarEditarCurso(id: number): void {
    if (this.procesando) return;

    const curso = this.todosLosCursos.find(curso => curso.id === id);

    if (!curso) return;

    this.cursoEditando = id;
    this.nombreCursoEditado = curso.nombre;
    this.mostrarEditar = true;
    this.mostrarFormulario = false;

    this.actualizarVista();
  }

  cancelarEditar(): void {
    this.cursoEditando = null;
    this.nombreCursoEditado = '';
    this.mostrarEditar = false;
  }

  guardarEdicion(): void {
    if (this.procesando || this.cursoEditando === null) return;

    const nombre = this.nombreCursoEditado.trim();

    if (!nombre || !this.grado) return;

    const id = this.cursoEditando;

    this.procesando = true;
    this.error = '';

    this.cursosService.editarCurso(id, nombre, this.grado).subscribe({
      next: cursoActualizado => {

        const indice = this.todosLosCursos.findIndex(
          curso => curso.id === id
        );

        if (indice !== -1) {
          this.todosLosCursos[indice] = cursoActualizado;
        }

        this.filtrarCursos();
        this.cancelarEditar();
        this.finalizarOperacion();
      },
      error: error => {
        console.error('Error al editar curso:', error);
        this.error = 'No se pudo editar el curso.';
        this.finalizarOperacion();
      }
    });
  }

  eliminarCurso(id: number): void {
    if (this.procesando) return;

    this.procesando = true;
    this.error = '';

    this.cursosService.eliminarCurso(id).subscribe({
      next: () => {
        this.todosLosCursos = this.todosLosCursos.filter(
          curso => curso.id !== id
        );

        this.filtrarCursos();
        this.finalizarOperacion();
      },
      error: error => {
        console.error('Error al eliminar curso:', error);
        this.error = 'No se pudo eliminar el curso.';
        this.finalizarOperacion();
      }
    });
  }

  private finalizarOperacion(): void {
    this.procesando = false;
    this.actualizarVista();
  }

  private actualizarVista(): void {
    this.cdr.detectChanges();
  }

}