import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Observacion {
  id: number;
  estudianteId: number;
  observacion: string;
  fecha: string;
}

interface ObservacionApi {
  id: number;
  estudiante_id: number;
  observacion: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class ObservacionesService {
  private readonly apiUrl = 'http://127.0.0.1:8000/observaciones';

  constructor(private http: HttpClient) {}

  obtenerObservaciones(estudianteId: number): Observable<Observacion[]> {
    return this.http
      .get<ObservacionApi[]>(
        `${this.apiUrl}/estudiante/${estudianteId}`
      )
      .pipe(
        map(items => items.map(item => this.convertir(item)))
      );
  }

  registrarObservacion(
    estudianteId: number,
    observacion: string
  ): Observable<Observacion> {
    return this.http
      .post<ObservacionApi>(this.apiUrl, {
        estudiante_id: estudianteId,
        observacion: observacion.trim()
      })
      .pipe(map(item => this.convertir(item)));
  }

  eliminarObservacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private convertir(item: ObservacionApi): Observacion {
    return {
      id: item.id,
      estudianteId: item.estudiante_id,
      observacion: item.observacion,
      fecha: item.fecha
    };
  }
}