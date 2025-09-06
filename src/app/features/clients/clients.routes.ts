import { Routes } from "@angular/router";
import { Permissions } from "../../constants/permissions";
import { ClientsComponent } from "./clients.component";
import { FunctionalMovementScreensComponent } from "./functional-movement-screens/components/functional-movement-screens/functional-movement-screens.component";

export const ClientsRoutes: Routes = [
  {
    path: "",
    component: ClientsComponent,
    data: {
      permissions: [Permissions.CanGetClients],
    },
  },
  {
    path: "functional-movement-screens",
    component: FunctionalMovementScreensComponent,
    data: {
      permissions: [Permissions.CanGetFunctionalMovementScreens],
    },
  },
];
