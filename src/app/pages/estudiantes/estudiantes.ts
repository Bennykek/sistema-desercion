import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../shared/sidebar/sidebar';

import {
  EstudiantesService,
  Estudiante
} from '../../services/estudiantes';


@Component({
  selector: 'app-estudiantes',
  imports: [FormsModule, Sidebar],
  templateUrl: './estudiantes.html',
  styleUrl: './estudiantes.scss'
})
export class Estudiantes implements OnInit {

  estudiantes: Estudiante[] = [];

  busqueda = '';

  mostrarFormulario = false;
  mostrarEditar = false;

  nuevoNumeroOrden = 0;
  nuevosNombres = '';
  nuevosApellidos = '';
  nuevoGrado = '';
  nuevaSeccion = '';

  estudianteEditando = 0;

  numeroOrdenEditado = 0;
  nombresEditados = '';
  apellidosEditados = '';
  gradoEditado = '';
  seccionEditada = '';

  cargando = false;
  error = '';


  constructor(
    private estudiantesService: EstudiantesService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.cargarEstudiantes();

  }


  cargarEstudiantes(): void {

    this.cargando = true;
    this.error = '';

    this.estudiantesService
      .obtenerEstudiantes()
      .subscribe({

        next: estudiantes => {

          this.estudiantes = estudiantes;

          this.cargando = false;

          this.cdr.detectChanges();

        },

        error: error => {

          console.error(
            'Error al obtener estudiantes:',
            error
          );

          this.error =
            'No se pudieron cargar los estudiantes.';

          this.cargando = false;

          this.cdr.detectChanges();

        }

      });

  }


  get estudiantesFiltradas(): Estudiante[] {

    const texto =
      this.busqueda
        .trim()
        .toLowerCase();

    if (!texto) {

      return this.estudiantes;

    }

    return this.estudiantes.filter(
      estudiante =>
        `${estudiante.nombres} ${estudiante.apellidos}`
          .toLowerCase()
          .includes(texto)
    );

  }


  mostrarAgregarEstudiante(): void {

    this.mostrarFormulario = true;
    this.mostrarEditar = false;

    this.nuevoNumeroOrden = 0;
    this.nuevosNombres = '';
    this.nuevosApellidos = '';
    this.nuevoGrado = '';
    this.nuevaSeccion = '';

    this.error = '';

    this.cdr.detectChanges();

  }


  cancelarAgregarEstudiante(): void {

    this.mostrarFormulario = false;

    this.nuevoNumeroOrden = 0;
    this.nuevosNombres = '';
    this.nuevosApellidos = '';
    this.nuevoGrado = '';
    this.nuevaSeccion = '';

    this.cdr.detectChanges();

  }


  agregarEstudiante(): void {

    const nombres =
      this.nuevosNombres.trim();

    const apellidos =
      this.nuevosApellidos.trim();

    const grado =
      this.nuevoGrado.trim();

    const seccion =
      this.nuevaSeccion
        .trim()
        .toUpperCase();


    if (
      this.nuevoNumeroOrden <= 0 ||
      !nombres ||
      !apellidos ||
      !grado ||
      !seccion
    ) {

      this.error =
        'Complete todos los campos para registrar la estudiante.';

      this.cdr.detectChanges();

      return;

    }


    this.cargando = true;
    this.error = '';

    this.cdr.detectChanges();


    this.estudiantesService
      .agregarEstudiante(
        this.nuevoNumeroOrden,
        nombres,
        apellidos,
        grado,
        seccion
      )
      .subscribe({

        next: () => {

          this.mostrarFormulario = false;

          this.nuevoNumeroOrden = 0;
          this.nuevosNombres = '';
          this.nuevosApellidos = '';
          this.nuevoGrado = '';
          this.nuevaSeccion = '';

          this.estudiantesService
            .obtenerEstudiantes()
            .subscribe({

              next: estudiantes => {

                this.estudiantes = estudiantes;

                this.cargando = false;

                this.cdr.detectChanges();

              },

              error: error => {

                console.error(
                  'Error al actualizar la lista:',
                  error
                );

                this.cargando = false;

                this.error =
                  'La estudiante se guardó, pero no se pudo actualizar la lista.';

                this.cdr.detectChanges();

              }

            });

        },

        error: error => {

          console.error(
            'Error al agregar estudiante:',
            error
          );

          this.error =
            'No se pudo registrar la estudiante.';

          this.cargando = false;

          this.cdr.detectChanges();

        }

      });

  }


  mostrarEditarEstudiante(id: number): void {

    const estudiante =
      this.estudiantes.find(
        estudiante => estudiante.id === id
      );


    if (!estudiante) {

      return;

    }


    this.estudianteEditando = id;

    this.numeroOrdenEditado =
      estudiante.numeroOrden;

    this.nombresEditados =
      estudiante.nombres;

    this.apellidosEditados =
      estudiante.apellidos;

    this.gradoEditado =
      estudiante.grado;

    this.seccionEditada =
      estudiante.seccion;


    this.mostrarEditar = true;
    this.mostrarFormulario = false;

    this.error = '';

    this.cdr.detectChanges();

  }


  cancelarEditar(): void {

    this.mostrarEditar = false;

    this.estudianteEditando = 0;

    this.numeroOrdenEditado = 0;
    this.nombresEditados = '';
    this.apellidosEditados = '';
    this.gradoEditado = '';
    this.seccionEditada = '';

    this.cargando = false;

    this.cdr.detectChanges();

  }


  guardarEdicion(): void {

    const nombres =
      this.nombresEditados.trim();

    const apellidos =
      this.apellidosEditados.trim();

    const grado =
      this.gradoEditado.trim();

    const seccion =
      this.seccionEditada
        .trim()
        .toUpperCase();


    if (
      this.numeroOrdenEditado <= 0 ||
      !nombres ||
      !apellidos ||
      !grado ||
      !seccion
    ) {

      this.error =
        'Complete todos los campos para editar la estudiante.';

      this.cdr.detectChanges();

      return;

    }


    this.cargando = true;
    this.error = '';

    this.cdr.detectChanges();


    this.estudiantesService
      .editarEstudiante(
        this.estudianteEditando,
        this.numeroOrdenEditado,
        nombres,
        apellidos,
        grado,
        seccion
      )
      .subscribe({

        next: () => {

          this.mostrarEditar = false;

          this.estudianteEditando = 0;

          this.numeroOrdenEditado = 0;
          this.nombresEditados = '';
          this.apellidosEditados = '';
          this.gradoEditado = '';
          this.seccionEditada = '';

          this.cdr.detectChanges();


          this.estudiantesService
            .obtenerEstudiantes()
            .subscribe({

              next: estudiantes => {

                this.estudiantes = estudiantes;

                this.cargando = false;

                this.cdr.detectChanges();

              },

              error: error => {

                console.error(
                  'Error al actualizar la lista:',
                  error
                );

                this.cargando = false;

                this.error =
                  'La estudiante se editó, pero no se pudo actualizar la lista.';

                this.cdr.detectChanges();

              }

            });

        },

        error: error => {

          console.error(
            'Error al editar estudiante:',
            error
          );

          this.error =
            'No se pudo editar la estudiante.';

          this.cargando = false;

          this.cdr.detectChanges();

        }

      });

  }


  eliminarEstudiante(id: number): void {

    this.cargando = true;
    this.error = '';

    this.cdr.detectChanges();


    this.estudiantesService
      .eliminarEstudiante(id)
      .subscribe({

        next: () => {

          this.estudiantesService
            .obtenerEstudiantes()
            .subscribe({

              next: estudiantes => {

                this.estudiantes = estudiantes;

                this.cargando = false;

                this.cdr.detectChanges();

              },

              error: error => {

                console.error(
                  'Error al actualizar la lista:',
                  error
                );

                this.cargando = false;

                this.error =
                  'La estudiante se eliminó, pero no se pudo actualizar la lista.';

                this.cdr.detectChanges();

              }

            });

        },

        error: error => {

          console.error(
            'Error al eliminar estudiante:',
            error
          );

          this.error =
            'No se pudo eliminar la estudiante.';

          this.cargando = false;

          this.cdr.detectChanges();

        }

      });

  }

}