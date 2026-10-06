import { Injectable } from '@angular/core';

export interface Curso {
  id: number;
  nombre: string;
  grado: string;
}

@Injectable({
  providedIn: 'root'
})
export class CursosService {

  cursos: Curso[] = [

    // 1.º grado
    { id: 1, nombre: 'Matemática', grado: '1' },
    { id: 2, nombre: 'Comunicación', grado: '1' },
    { id: 3, nombre: 'Ciencia y Tecnología', grado: '1' },
    { id: 4, nombre: 'Personal Social', grado: '1' },

    // 2.º grado
    { id: 5, nombre: 'Matemática', grado: '2' },
    { id: 6, nombre: 'Comunicación', grado: '2' },
    { id: 7, nombre: 'Ciencia y Tecnología', grado: '2' },
    { id: 8, nombre: 'Personal Social', grado: '2' },

    // 3.º grado
    { id: 9, nombre: 'Matemática', grado: '3' },
    { id: 10, nombre: 'Comunicación', grado: '3' },
    { id: 11, nombre: 'Ciencia y Tecnología', grado: '3' },
    { id: 12, nombre: 'Personal Social', grado: '3' },

    // 4.º grado
    { id: 13, nombre: 'Matemática', grado: '4' },
    { id: 14, nombre: 'Comunicación', grado: '4' },
    { id: 15, nombre: 'Ciencia y Tecnología', grado: '4' },
    { id: 16, nombre: 'Personal Social', grado: '4' },

    // 5.º grado
    { id: 17, nombre: 'Matemática', grado: '5' },
    { id: 18, nombre: 'Comunicación', grado: '5' },
    { id: 19, nombre: 'Ciencia y Tecnología', grado: '5' },
    { id: 20, nombre: 'Personal Social', grado: '5' },

    // 6.º grado
    { id: 21, nombre: 'Matemática', grado: '6' },
    { id: 22, nombre: 'Comunicación', grado: '6' },
    { id: 23, nombre: 'Ciencia y Tecnología', grado: '6' },
    { id: 24, nombre: 'Personal Social', grado: '6' }

  ];

  obtenerCursos(): Curso[] {
    return this.cursos;
  }

  obtenerCursosPorGrado(grado: string): Curso[] {

    return this.cursos.filter(
      curso => curso.grado === grado
    );

  }

  agregarCurso(nombre: string, grado: string): void {

    const nuevoId = this.obtenerNuevoId();

    this.cursos.push({
      id: nuevoId,
      nombre: nombre,
      grado: grado
    });

  }

  editarCurso(
    id: number,
    nombre: string
  ): void {

    const curso = this.cursos.find(
      curso => curso.id === id
    );

    if (curso) {
      curso.nombre = nombre;
    }

  }

  eliminarCurso(id: number): void {

    this.cursos = this.cursos.filter(
      curso => curso.id !== id
    );

  }

  private obtenerNuevoId(): number {

    if (this.cursos.length === 0) {
      return 1;
    }

    return Math.max(
      ...this.cursos.map(curso => curso.id)
    ) + 1;

  }

}