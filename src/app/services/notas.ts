import { Injectable } from '@angular/core';

export interface Nota {
  id: number;
  estudianteId: number;
  cursoId: number;
  semestre: number;
  calificacion: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class NotasService {

  notas: Nota[] = [];

  obtenerNotas(): Nota[] {
    return this.notas;
  }

  obtenerNotasEstudiante(
    estudianteId: number,
    semestre: number
  ): Nota[] {

    return this.notas.filter(
      nota =>
        nota.estudianteId === estudianteId &&
        nota.semestre === semestre
    );

  }

  obtenerNota(
    estudianteId: number,
    cursoId: number,
    semestre: number
  ): Nota | undefined {

    return this.notas.find(
      nota =>
        nota.estudianteId === estudianteId &&
        nota.cursoId === cursoId &&
        nota.semestre === semestre
    );

  }

  guardarNota(
    estudianteId: number,
    cursoId: number,
    semestre: number,
    calificacion: number | null
  ): void {

    const notaExistente = this.obtenerNota(
      estudianteId,
      cursoId,
      semestre
    );

    if (notaExistente) {

      notaExistente.calificacion = calificacion;

      return;
    }

    this.notas.push({

      id: this.obtenerNuevoId(),

      estudianteId: estudianteId,

      cursoId: cursoId,

      semestre: semestre,

      calificacion: calificacion

    });

  }

  eliminarNota(
    estudianteId: number,
    cursoId: number,
    semestre: number
  ): void {

    this.notas = this.notas.filter(
      nota =>
        !(
          nota.estudianteId === estudianteId &&
          nota.cursoId === cursoId &&
          nota.semestre === semestre
        )
    );

  }

  calcularPromedioSemestre(
    estudianteId: number,
    semestre: number
  ): number {

    const notasEstudiante = this.obtenerNotasEstudiante(
      estudianteId,
      semestre
    );

    const notasRegistradas = notasEstudiante
      .filter(nota => nota.calificacion !== null);

    if (notasRegistradas.length === 0) {
      return 0;
    }

    const suma = notasRegistradas.reduce(
      (total, nota) =>
        total + (nota.calificacion ?? 0),
      0
    );

    return Number(
      (suma / notasRegistradas.length).toFixed(2)
    );

  }

  calcularPromedioCurso(
    estudianteId: number,
    cursoId: number
  ): number {

    const notasCurso = this.notas.filter(
      nota =>
        nota.estudianteId === estudianteId &&
        nota.cursoId === cursoId &&
        nota.calificacion !== null
    );

    if (notasCurso.length === 0) {
      return 0;
    }

    const suma = notasCurso.reduce(
      (total, nota) =>
        total + (nota.calificacion ?? 0),
      0
    );

    return Number(
      (suma / notasCurso.length).toFixed(2)
    );

  }

  calcularPromedioGeneral(
    estudianteId: number
  ): number {

    const notasEstudiante = this.notas.filter(
      nota =>
        nota.estudianteId === estudianteId &&
        nota.calificacion !== null
    );

    if (notasEstudiante.length === 0) {
      return 0;
    }

    const suma = notasEstudiante.reduce(
      (total, nota) =>
        total + (nota.calificacion ?? 0),
      0
    );

    return Number(
      (suma / notasEstudiante.length).toFixed(2)
    );

  }

  private obtenerNuevoId(): number {

    if (this.notas.length === 0) {
      return 1;
    }

    return Math.max(
      ...this.notas.map(nota => nota.id)
    ) + 1;

  }

}