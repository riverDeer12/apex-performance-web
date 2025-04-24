import { Routes } from "@angular/router";
import { AdminLayout } from "./app/layout/component/admin-layout.component";
import { Dashboard } from "./app/pages/dashboard/dashboard";
import { NotFound } from "./app/components/not-found/not-found";
import { Forbidden } from "./app/components/forbidden/forbidden";
import { Error } from "./app/components/error/error";
import { AdminGuard } from "./app/guards/admin.guard";
import { LandingComponent } from './app/features/landing/landing.component';

export const appRoutes: Routes = [
  {
    path: "",
    component: LandingComponent,
  },
  {
    path: "authentication",
    loadChildren: () =>
      import("./app/features/authentication/authentication.routes").then(
        (m) => m.AuthenticationRoutes,
      ),
  },
  {
    path: "admin",
    component: AdminLayout,
    canActivate: [AdminGuard],
    children: [
      {
        path: "dashboard",
        component: Dashboard,
      },
      {
        path: "administrators",
        loadChildren: () =>
          import("./app/features/administrators/administrators.routes").then(
            (m) => m.AdministratorsRoutes,
          ),
      },
      {
        path: "clients",
        loadChildren: () =>
          import("./app/features/clients/clients.routes").then(
            (m) => m.ClientsRoutes,
          ),
      },
      {
        path: "users",
        loadChildren: () =>
          import("./app/features/users/users.routes").then(
            (m) => m.UsersRoutes,
          ),
      },
    ],
  },
  {
    path: "authentication",
    loadChildren: () =>
      import("./app/features/authentication/authentication.routes").then(
        (m) => m.AuthenticationRoutes,
      ),
  },
  { path: "not-found", component: NotFound },
  { path: "forbidden", component: Forbidden },
  { path: "error", component: Error },
  { path: "**", redirectTo: "/not-found" },
];
