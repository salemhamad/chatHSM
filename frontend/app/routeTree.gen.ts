import { Route as rootRoute } from './routes/__root';
import { Route as IndexRoute } from './routes/index';
import { Route as PortalRoute } from './routes/portal';
import { Route as AdminRoute } from './routes/admin';

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexRoute;
      parentRoute: typeof rootRoute;
    };
    '/portal': {
      preLoaderRoute: typeof PortalRoute;
      parentRoute: typeof rootRoute;
    };
    '/admin': {
      preLoaderRoute: typeof AdminRoute;
      parentRoute: typeof rootRoute;
    };
  }
}

export const routeTree = rootRoute.addChildren([IndexRoute, PortalRoute, AdminRoute]);
