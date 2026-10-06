import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { EstudiantesService } from '../../services/estudiantes';

@Component({
  selector: 'app-estudiantes',
  imports: [FormsModule, Sidebar],
  templateUrl: './estudiantes.html',
  styleUrl: './estudiantes.scss'
})
export class Estudiantes {

  grado = '';
  seccion = '';

  busqueda = '';

  mostrarFormulario = false;

  nuevoNumeroOrden = 0;
  nuevosNombres = '';
  nuevosApellidos = '';

  mostrarEditar = false;
  estudianteEditando = 0;

  numeroOrdenEditado = 0;
  nombresEditados = '';
  apellidosEditados = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private estudiantesService: EstudiantesService
  ) {}

  get estudiantes() {
    return this.estudiantesService.obtenerEstudiantes();
  }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.grado = params['grado'] || '';
      this.seccion = params['seccion'] || '';

    });

  }

  seleccionarAula(): void {

    if (this.grado.trim() === '' || this.seccion.trim() === '') {
      return;
    }

    this.busqueda = '';

  }

  get estudiantesFiltradas() {

    const texto = this.busqueda.trim().toLowerCase();

    if (texto === '') {

      return this.estudiantes.filter(estudiante =>
        estudiante.grado === this.grado &&
        estudiante.seccion === this.seccion
      );

    }

    return this.estudiantes.filter(estudiante =>
      estudiante.grado === this.grado &&
      estudiante.seccion === this.seccion &&
      (
        estudiante.nombres.toLowerCase().includes(texto) ||
        estudiante.apellidos.toLowerCase().includes(texto)
      )
    );

  }

  mostrarAgregarEstudiante(): void {

    this.mostrarFormulario = true;

    this.nuevoNumeroOrden = 0;
    this.nuevosNombres = '';
    this.nuevosApellidos = '';

  }

  cancelarAgregarEstudiante(): void {

    this.mostrarFormulario = false;

    this.nuevoNumeroOrden = 0;
    this.nuevosNombres = '';
    this.nuevosApellidos = '';

  }

  agregarEstudiante(): void {

    const nombres = this.nuevosNombres.trim();
    const apellidos = this.nuevosApellidos.trim();

    if (
      this.nuevoNumeroOrden <= 0 ||
      nombres === '' ||
      apellidos === '' ||
      this.grado.trim() === '' ||
      this.seccion.trim() === ''
    ) {
      return;
    }

    this.estudiantesService.agregarEstudiante(
      this.nuevoNumeroOrden,
      nombres,
      apellidos,
      this.grado,
      this.seccion
    );

    this.cancelarAgregarEstudiante();

  }

  mostrarEditarEstudiante(id: number): void {

    const estudiante = this.estudiantes.find(
      estudiante => estudiante.id === id
    );

    if (!estudiante) {
      return;
    }

    this.estudianteEditando = id;

    this.numeroOrdenEditado = estudiante.numeroOrden;
    this.nombresEditados = estudiante.nombres;
    this.apellidosEditados = estudiante.apellidos;

    this.mostrarEditar = true;

  }

  cancelarEditar(): void {

    this.mostrarEditar = false;

    this.estudianteEditando = 0;

    this.numeroOrdenEditado = 0;
    this.nombresEditados = '';
    this.apellidosEditados = '';

  }

  guardarEdicion(): void {

    const nombres = this.nombresEditados.trim();
    const apellidos = this.apellidosEditados.trim();

    if (
      this.estudianteEditando === 0 ||
      this.numeroOrdenEditado <= 0 ||
      nombres === '' ||
      apellidos === ''
    ) {
      return;
    }

    this.estudiantesService.editarEstudiante(
      this.estudianteEditando,
      this.numeroOrdenEditado,
      nombres,
      apellidos
    );

    this.cancelarEditar();

  }

  eliminarEstudiante(id: number): void {

    const estudiante = this.estudiantes.find(
      estudiante => estudiante.id === id
    );

    if (!estudiante) {
      return;
    }

    const confirmar = window.confirm(
      `¿Está seguro de eliminar a ${estudiante.nombres} ${estudiante.apellidos}?`
    );

    if (!confirmar) {
      return;
    }

    this.estudiantesService.eliminarEstudiante(id);

  }

  verEstudiante(id: number): void {

    this.router.navigate(['/seguimiento'], {
      queryParams: {
        estudiante: id,
        grado: this.grado,
        seccion: this.seccion
      }
    });

  }

}