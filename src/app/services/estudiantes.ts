import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Estudiante {
  id: number;
  numeroOrden: number;
  nombres: string;
  apellidos: string;
  grado: string;
  seccion: string;
  riesgo: string;
}

interface EstudianteAPI {
  id: number;
  numero_orden: number;
  nombres: string;
  apellidos: string;
  grado: string;
  seccion: string;
  riesgo: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstudiantesService {

  private apiUrl = 'http://127.0.0.1:8000';

  constructor(
    private http: HttpClient
  ) {}

  obtenerEstudiantes(): Observable<Estudiante[]> {

    return this.http
      .get<EstudianteAPI[]>(
        `${this.apiUrl}/estudiantes`
      )
      .pipe(
        map(estudiantes =>
          estudiantes.map(estudiante => ({
            id: estudiante.id,
            numeroOrden: estudiante.numero_orden,
            nombres: estudiante.nombres,
            apellidos: estudiante.apellidos,
            grado: estudiante.grado,
            seccion: estudiante.seccion,
            riesgo: estudiante.riesgo
          }))
        )
      );

  }


  agregarEstudiante(
    numeroOrden: number,
    nombres: string,
    apellidos: string,
    grado: string,
    seccion: string
  ): Observable<Estudiante> {

    return this.http
      .post<EstudianteAPI>(
        `${this.apiUrl}/estudiantes`,
        {
          numero_orden: numeroOrden,
          nombres,
          apellidos,
          grado,
          seccion
        }
      )
      .pipe(
        map(estudiante => ({
          id: estudiante.id,
          numeroOrden: estudiante.numero_orden,
          nombres: estudiante.nombres,
          apellidos: estudiante.apellidos,
          grado: estudiante.grado,
          seccion: estudiante.seccion,
          riesgo: estudiante.riesgo
        }))
      );

  }


  editarEstudiante(
    id: number,
    numeroOrden: number,
    nombres: string,
    apellidos: string,
    grado: string,
    seccion: string
  ): Observable<Estudiante> {

    return this.http
      .put<EstudianteAPI>(
        `${this.apiUrl}/estudiantes/${id}`,
        {
          numero_orden: numeroOrden,
          nombres,
          apellidos,
          grado,
          seccion
        }
      )
      .pipe(
        map(estudiante => ({
          id: estudiante.id,
          numeroOrden: estudiante.numero_orden,
          nombres: estudiante.nombres,
          apellidos: estudiante.apellidos,
          grado: estudiante.grado,
          seccion: estudiante.seccion,
          riesgo: estudiante.riesgo
        }))
      );

  }


  eliminarEstudiante(
    id: number
  ): Observable<{ mensaje: string }> {

    return this.http.delete<{ mensaje: string }>(
      `${this.apiUrl}/estudiantes/${id}`
    );

  }

}