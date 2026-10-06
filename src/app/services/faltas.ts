import { Injectable } from '@angular/core';

export interface Falta {
  id: number;
  estudianteId: number;
  fecha: string;
  observacion: string;
  semestre: number;
}

@Injectable({
  providedIn: 'root'
})
export class FaltasService {

  faltas: Falta[] = [];

  obtenerFaltas(): Falta[] {
    return this.faltas;
  }

  obtenerFaltasEstudiante(
    estudianteId: number
  ): Falta[] {

    return this.faltas
      .filter(
        falta => falta.estudianteId === estudianteId
      )
      .sort(
        (a, b) =>
          new Date(b.fecha).getTime() -
          new Date(a.fecha).getTime()
      );

  }

  obtenerFaltasPorSemestre(
    estudianteId: number,
    semestre: number
  ): Falta[] {

    return this.faltas.filter(
      falta =>
        falta.estudianteId === estudianteId &&
        falta.semestre === semestre
    );

  }

  agregarFalta(
    estudianteId: number,
    fecha: string,
    observacion: string,
    semestre: number
  ): void {

    this.faltas.push({

      id: this.obtenerNuevoId(),

      estudianteId: estudianteId,

      fecha: fecha,

      observacion: observacion,

      semestre: semestre

    });

  }

  editarFalta(
    id: number,
    fecha: string,
    observacion: string,
    semestre: number
  ): void {

    const falta = this.faltas.find(
      falta => falta.id === id
    );

    if (falta) {

      falta.fecha = fecha;

      falta.observacion = observacion;

      falta.semestre = semestre;

    }

  }

  eliminarFalta(id: number): void {

    this.faltas = this.faltas.filter(
      falta => falta.id !== id
    );

  }

  contarFaltas(
    estudianteId: number
  ): number {

    return this.faltas.filter(
      falta => falta.estudianteId === estudianteId
    ).length;

  }

  contarFaltasPorSemestre(
    estudianteId: number,
    semestre: number
  ): number {

    return this.faltas.filter(
      falta =>
        falta.estudianteId === estudianteId &&
        falta.semestre === semestre
    ).length;

  }

  private obtenerNuevoId(): number {

    if (this.faltas.length === 0) {
      return 1;
    }

    return Math.max(
      ...this.faltas.map(falta => falta.id)
    ) + 1;

  }

}