import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Nota {
  id: number;
  estudianteId: number;
  cursoId: number;
  semestre: number;
  calificacion: number | null;
}

interface NotaAPI {
  id: number;
  estudiante_id: number;
  curso_id: number;
  semestre: number;
  calificacion: number | null;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotasService {

  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  obtenerNotasEstudiante(
    estudianteId: number,
    semestre: number
  ): Observable<Nota[]> {

    return this.http
      .get<NotaAPI[]>(
        `${this.apiUrl}/notas/estudiante/${estudianteId}/semestre/${semestre}`
      )
      .pipe(
        map(notas =>
          notas.map(nota => this.convertirNota(nota))
        )
      );
  }

  obtenerTodasLasNotas(
    estudianteId: number
  ): Observable<Nota[]> {

    return this.http
      .get<NotaAPI[]>(
        `${this.apiUrl}/notas/estudiante/${estudianteId}`
      )
      .pipe(
        map(notas =>
          notas.map(nota => this.convertirNota(nota))
        )
      );
  }

  guardarNota(
    estudianteId: number,
    cursoId: number,
    semestre: number,
    calificacion: number | null
  ): Observable<Nota> {

    return this.http
      .post<NotaAPI>(
        `${this.apiUrl}/notas`,
        {
          estudiante_id: estudianteId,
          curso_id: cursoId,
          semestre,
          calificacion
        }
      )
      .pipe(
        map(nota =>
          this.convertirNota(nota)
        )
      );
  }

  eliminarNota(
    estudianteId: number,
    cursoId: number,
    semestre: number
  ): Observable<{ mensaje: string }> {

    return this.http.delete<{ mensaje: string }>(
      `${this.apiUrl}/notas/${estudianteId}/${cursoId}/${semestre}`
    );
  }

  calcularPromedioSemestre(
    notas: Nota[]
  ): number {

    return this.calcularPromedio(notas);
  }

  calcularPromedioCurso(
    notas: Nota[],
    cursoId: number
  ): number {

    const notasCurso = notas.filter(
      nota =>
        nota.cursoId === cursoId &&
        nota.calificacion !== null
    );

    return this.calcularPromedio(notasCurso);
  }

  calcularPromedioGeneral(
    notas: Nota[]
  ): number {

    return this.calcularPromedio(notas);
  }

  private calcularPromedio(
    notas: Nota[]
  ): number {

    const notasRegistradas = notas.filter(
      nota => nota.calificacion !== null
    );

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

  private convertirNota(
    nota: NotaAPI
  ): Nota {

    return {
      id: nota.id,
      estudianteId: nota.estudiante_id,
      cursoId: nota.curso_id,
      semestre: nota.semestre,
      calificacion: nota.calificacion
    };
  }
}