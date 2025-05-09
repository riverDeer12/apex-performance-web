import { Routes } from "@angular/router";
import { Permissions } from "../../constants/permissions";
import { AppointmentsComponent } from "./appointments.component";

export const AppointmentsRoutes: Routes = [
  {
    path: "",
    component: AppointmentsComponent,
    data: {
      permissions: [Permissions.CanGetAppointments],
    },
  },
];
