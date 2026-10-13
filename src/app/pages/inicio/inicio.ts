import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { Sidebar } from '../../shared/sidebar/sidebar';
import {
  EstudiantesService,
  Estudiante
} from '../../services/estudiantes';

@Component({
  selector: 'app-inicio',
  imports: [Sidebar],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss'
})
export class Inicio implements OnInit {
  totalEstudiantes = 0;

  riesgoBajo = 0;
  riesgoMedio = 0;
  riesgoAlto = 0;
  pendientes = 0;

  cargando = true;
  errorCarga = false;

  graficoFondo = '#e5e7eb';

  constructor(
    private estudiantesService: EstudiantesService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  private cargarEstadisticas(): void {
    this.cargando = true;
    this.errorCarga = false;

    this.estudiantesService.obtenerEstudiantes().subscribe({
      next: (estudiantes: Estudiante[]) => {
        this.totalEstudiantes = estudiantes.length;

        this.calcularRiesgos(estudiantes);

        this.cargando = false;
        this.errorCarga = false;

        this.changeDetector.markForCheck();
      },

      error: (error: unknown) => {
        console.error(
          'Error al cargar las estadísticas de estudiantes:',
          error
        );

        this.errorCarga = true;
        this.cargando = false;

        this.changeDetector.markForCheck();
      }
    });
  }

  private calcularRiesgos(estudiantes: Estudiante[]): void {
    this.riesgoBajo = 0;
    this.riesgoMedio = 0;
    this.riesgoAlto = 0;
    this.pendientes = 0;

    for (const estudiante of estudiantes) {
      const riesgo = (estudiante.riesgo || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();

      if (riesgo.includes('sin riesgo') || riesgo.includes('bajo')) {
        this.riesgoBajo++;
      } else if (riesgo.includes('medio')) {
        this.riesgoMedio++;
      } else if (riesgo.includes('alto')) {
        this.riesgoAlto++;
      } else {
        this.pendientes++;
      }
    }

    this.actualizarGrafico();
  }

  private actualizarGrafico(): void {
    const evaluadas =
      this.riesgoBajo + this.riesgoMedio + this.riesgoAlto;

    if (evaluadas === 0) {
      this.graficoFondo = '#e5e7eb';
      return;
    }

    const porcentajeBajo = (this.riesgoBajo / evaluadas) * 100;
    const porcentajeMedio = (this.riesgoMedio / evaluadas) * 100;

    const limiteBajo = porcentajeBajo;
    const limiteMedio = porcentajeBajo + porcentajeMedio;

    this.graficoFondo = `conic-gradient(
      #16a34a 0% ${limiteBajo}%,
      #eab308 ${limiteBajo}% ${limiteMedio}%,
      #dc2626 ${limiteMedio}% 100%
    )`;
  }
}