import {Routes} from "@angular/router";
import {Permissions} from "../../constants/permissions";
import {BodyMeasurementsComponent} from "./body-measurements.component";

export const BodyMeasurementsRoutes: Routes = [
    {
        path: "",
        component: BodyMeasurementsComponent,
        data: {
            title: "menu.bodyMeasurements", section: "menu.bodyMeasurements",
            permissions: [Permissions.CanGetBodyMeasurements],
        },
    },
];
