import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { CursosService } from '../../services/cursos';

@Component({
  selector: 'app-cursos',
  imports: [FormsModule, Sidebar],
  templateUrl: './cursos.html',
  styleUrl: './cursos.scss'
})
export class Cursos {

  grado = '';

  mostrarFormulario = false;
  mostrarEditar = false;

  nuevoCurso = '';
  cursoEditando = 0;
  nombreCursoEditado = '';

  constructor(
    private cursosService: CursosService
  ) {}

  get cursos() {
    return this.cursosService.obtenerCursosPorGrado(this.grado);
  }

  mostrarAgregarCurso(): void {

    this.nuevoCurso = '';
    this.mostrarFormulario = true;

  }

  cancelarAgregar(): void {

    this.nuevoCurso = '';
    this.mostrarFormulario = false;

  }

  agregarCurso(): void {

    const nombre = this.nuevoCurso.trim();

    if (
      nombre === '' ||
      this.grado === ''
    ) {
      return;
    }

    this.cursosService.agregarCurso(
      nombre,
      this.grado
    );

    this.cancelarAgregar();

  }

  mostrarEditarCurso(id: number): void {

    const curso = this.cursosService.obtenerCursos().find(
      curso => curso.id === id
    );

    if (!curso) {
      return;
    }

    this.cursoEditando = id;
    this.nombreCursoEditado = curso.nombre;
    this.mostrarEditar = true;

  }

  cancelarEditar(): void {

    this.cursoEditando = 0;
    this.nombreCursoEditado = '';
    this.mostrarEditar = false;

  }

  guardarEdicion(): void {

    const nombre = this.nombreCursoEditado.trim();

    if (
      this.cursoEditando === 0 ||
      nombre === ''
    ) {
      return;
    }

    this.cursosService.editarCurso(
      this.cursoEditando,
      nombre
    );

    this.cancelarEditar();

  }

  eliminarCurso(id: number): void {

    const curso = this.cursosService.obtenerCursos().find(
      curso => curso.id === id
    );

    if (!curso) {
      return;
    }

    const confirmar = window.confirm(
      `¿Está seguro de eliminar el curso "${curso.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    this.cursosService.eliminarCurso(id);

  }

}