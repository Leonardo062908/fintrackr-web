import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    // Rotas com parâmetros (ex.: `/transactions/:id/edit`) não podem ser pré-renderizadas
    // sem `getPrerenderParams`. SSR por requisição cobre todas as URLs.
    renderMode: RenderMode.Server,
  },
];
