import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Curso {
  id: number;
  nombre: string;
  grado: string;
}

interface CursoAPI {
  id: number;
  nombre: string;
  grado: string;
  created_at?: string;
}

interface RespuestaEliminar {
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class CursosService {

  private apiUrl = 'http://127.0.0.1:8000';

  constructor(
    private http: HttpClient
  ) {}

  obtenerCursos(): Observable<Curso[]> {

    return this.http
      .get<CursoAPI[]>(`${this.apiUrl}/cursos`)
      .pipe(
        map(cursos =>
          cursos.map(curso => ({
            id: curso.id,
            nombre: curso.nombre,
            grado: curso.grado
          }))
        )
      );

  }

  obtenerCursosPorGrado(grado: string): Observable<Curso[]> {

    return this.obtenerCursos().pipe(
      map(cursos =>
        cursos.filter(curso => curso.grado === grado)
      )
    );

  }

  agregarCurso(
    nombre: string,
    grado: string
  ): Observable<Curso> {

    return this.http
      .post<CursoAPI>(
        `${this.apiUrl}/cursos`,
        {
          nombre,
          grado
        }
      )
      .pipe(
        map(curso => ({
          id: curso.id,
          nombre: curso.nombre,
          grado: curso.grado
        }))
      );

  }

  editarCurso(
    id: number,
    nombre: string,
    grado: string
  ): Observable<Curso> {

    return this.http
      .put<CursoAPI>(
        `${this.apiUrl}/cursos/${id}`,
        {
          nombre,
          grado
        }
      )
      .pipe(
        map(curso => ({
          id: curso.id,
          nombre: curso.nombre,
          grado: curso.grado
        }))
      );

  }

  eliminarCurso(
    id: number
  ): Observable<RespuestaEliminar> {

    return this.http
      .delete<RespuestaEliminar>(
        `${this.apiUrl}/cursos/${id}`
      );

  }

}