import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/board/board-page/board-page.component').then(
        (m) => m.BoardPageComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
