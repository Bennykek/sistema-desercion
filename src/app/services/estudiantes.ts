import { Injectable } from '@angular/core';

export interface Estudiante {
  id: number;
  numeroOrden: number;
  nombres: string;
  apellidos: string;
  grado: string;
  seccion: string;
  riesgo: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstudiantesService {

  estudiantes: Estudiante[] = [
    {
      id: 1,
      numeroOrden: 1,
      nombres: 'María',
      apellidos: 'Quispe Huamán',
      grado: '4',
      seccion: 'B',
      riesgo: 'Bajo'
    },
    {
      id: 2,
      numeroOrden: 2,
      nombres: 'Ana',
      apellidos: 'Pérez López',
      grado: '4',
      seccion: 'B',
      riesgo: 'Medio'
    },
    {
      id: 3,
      numeroOrden: 3,
      nombres: 'Lucía',
      apellidos: 'García Ramos',
      grado: '4',
      seccion: 'B',
      riesgo: 'Alto'
    },
    {
      id: 4,
      numeroOrden: 4,
      nombres: 'Sofía',
      apellidos: 'Torres Quispe',
      grado: '4',
      seccion: 'B',
      riesgo: 'Bajo'
    }
  ];

  obtenerEstudiantes(): Estudiante[] {
    return this.estudiantes;
  }

  agregarEstudiante(
    numeroOrden: number,
    nombres: string,
    apellidos: string,
    grado: string,
    seccion: string
  ): void {

    const nuevoId = this.obtenerNuevoId();

    this.estudiantes.push({
      id: nuevoId,
      numeroOrden: numeroOrden,
      nombres: nombres,
      apellidos: apellidos,
      grado: grado,
      seccion: seccion,
      riesgo: 'Bajo'
    });

  }

  actualizarRiesgo(id: number, riesgo: string): void {

    const estudiante = this.estudiantes.find(
      estudiante => estudiante.id === id
    );

    if (estudiante) {
      estudiante.riesgo = riesgo;
    }

  }

  editarEstudiante(
    id: number,
    numeroOrden: number,
    nombres: string,
    apellidos: string
  ): void {

    const estudiante = this.estudiantes.find(
      estudiante => estudiante.id === id
    );

    if (estudiante) {
      estudiante.numeroOrden = numeroOrden;
      estudiante.nombres = nombres;
      estudiante.apellidos = apellidos;
    }

  }

  eliminarEstudiante(id: number): void {

    this.estudiantes = this.estudiantes.filter(
      estudiante => estudiante.id !== id
    );

  }

  private obtenerNuevoId(): number {

    if (this.estudiantes.length === 0) {
      return 1;
    }

    return Math.max(
      ...this.estudiantes.map(estudiante => estudiante.id)
    ) + 1;

  }

}