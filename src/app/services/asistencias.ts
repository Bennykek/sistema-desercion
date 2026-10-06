import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Asistencia {
  id: number;
  estudianteId: number;
  fecha: string;
  estado: 'Asistió' | 'Inasistió';
  observacion: string | null;
  semestre: number;
}

interface AsistenciaAPI {
  id: number;
  estudiante_id: number;
  fecha: string;
  estado: 'Asistió' | 'Inasistió';
  observacion: string | null;
  semestre: number;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AsistenciasService {

  private apiUrl = 'http://127.0.0.1:8000';

  constructor(
    private http: HttpClient
  ) {}

  obtenerAsistencias(
    estudianteId: number
  ): Observable<Asistencia[]> {

    return this.http
      .get<AsistenciaAPI[]>(
        `${this.apiUrl}/asistencias/estudiante/${estudianteId}`
      )
      .pipe(
        map(asistencias =>
          asistencias.map(
            asistencia => this.convertirAsistencia(asistencia)
          )
        )
      );
  }

  obtenerAsistenciasSemestre(
    estudianteId: number,
    semestre: number
  ): Observable<Asistencia[]> {

    return this.http
      .get<AsistenciaAPI[]>(
        `${this.apiUrl}/asistencias/estudiante/${estudianteId}/semestre/${semestre}`
      )
      .pipe(
        map(asistencias =>
          asistencias.map(
            asistencia => this.convertirAsistencia(asistencia)
          )
        )
      );
  }

  registrarAsistencia(
    estudianteId: number,
    fecha: string,
    estado: 'Asistió' | 'Inasistió',
    observacion: string | null,
    semestre: number
  ): Observable<Asistencia> {

    return this.http
      .post<AsistenciaAPI>(
        `${this.apiUrl}/asistencias`,
        {
          estudiante_id: estudianteId,
          fecha,
          estado,
          observacion,
          semestre
        }
      )
      .pipe(
        map(asistencia =>
          this.convertirAsistencia(asistencia)
        )
      );
  }

  eliminarAsistencia(
    estudianteId: number,
    fecha: string
  ): Observable<{ mensaje: string }> {

    return this.http.delete<{ mensaje: string }>(
      `${this.apiUrl}/asistencias/${estudianteId}/${fecha}`
    );
  }

  private convertirAsistencia(
    asistencia: AsistenciaAPI
  ): Asistencia {

    return {
      id: asistencia.id,
      estudianteId: asistencia.estudiante_id,
      fecha: asistencia.fecha,
      estado: asistencia.estado,
      observacion: asistencia.observacion,
      semestre: asistencia.semestre
    };
  }
}