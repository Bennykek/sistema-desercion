
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./pages/inicio/inicio').then(m => m.Inicio)
  },
  {
    path: 'estudiantes',
    loadComponent: () =>
      import('./pages/estudiantes/estudiantes').then(m => m.Estudiantes)
  },
  {
    path: 'seguimiento',
    loadComponent: () =>
      import('./pages/seguimiento/seguimiento').then(m => m.Seguimiento)
  },
  {
    path: 'cursos',
    loadComponent: () =>
      import('./pages/cursos/cursos').then(m => m.Cursos)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
