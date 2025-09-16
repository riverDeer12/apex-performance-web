import { Routes } from "@angular/router";
import { AdminLayout } from "./app/layout/component/admin-layout.component";
import { NotFound } from "./app/shared/components/not-found/not-found";
import { Forbidden } from "./app/shared/components/forbidden/forbidden";
import { Error } from "./app/shared/components/error/error";
import { AdminGuard } from "./app/guards/admin.guard";
import { DashboardComponent } from "./app/features/dashboard/dashboard.component";
import { ShoppingCartComponent } from "./app/features/shopping-cart/shopping-cart.component";
import { ProductsComponent } from "./app/features/products/products.component";

export const appRoutes: Routes = [
  {
    path: "",
    loadChildren: () =>
        import("./app/features/landing/landing.routes").then(
            (m) => m.LandingRoutes
        ),
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
        component: DashboardComponent,
      },
      {
        path: "administrators",
        loadChildren: () =>
          import("./app/features/administrators/administrators.routes").then(
            (m) => m.AdministratorsRoutes,
          ),
      },
      {
        path: "appointments",
        loadChildren: () =>
          import("./app/features/appointments/appointments.routes").then(
            (m) => m.AppointmentsRoutes,
          ),
      },
      {
        path: "body-measurements",
        loadChildren: () =>
          import(
            "./app/features/body-measurements/body-measurements.routes"
          ).then((m) => m.BodyMeasurementsRoutes),
      },
      {
        path: "clients",
        loadChildren: () =>
          import("./app/features/clients/clients.routes").then(
            (m) => m.ClientsRoutes,
          ),
      },
      {
        path: "coaches",
        loadChildren: () =>
          import("./app/features/coaches/coaches.routes").then(
            (m) => m.CoachesRoutes,
          ),
      },
      {
        path: "products",
        loadChildren: () =>
          import("./app/features/products/products.routes").then(
            (m) => m.ProductsRoutes,
          ),
      },
      {
        path: "time-slots",
        loadChildren: () =>
          import("./app/features/time-slots/time-slots.routes").then(
            (m) => m.TimeSlotsRoutes,
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
  { path: "error", component: Error },
  { path: "forbidden", component: Forbidden },
  { path: "not-found", component: NotFound },
  {
    path: "products",
    component: ProductsComponent,
  },
  {
    path: "shopping-cart",
    component: ShoppingCartComponent,
  },
  { path: "**", redirectTo: "/not-found" },
];
