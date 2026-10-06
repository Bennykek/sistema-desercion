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
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(m => m.Dashboard)
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
    path: 'alertas',
    loadComponent: () =>
      import('./pages/alertas/alertas').then(m => m.Alertas)
  },

  {
    path: 'cursos',
    loadComponent: () =>
      import('./pages/cursos/cursos').then(m => m.Cursos)
  }

];