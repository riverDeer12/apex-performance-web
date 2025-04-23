import {Routes} from "@angular/router";
import {CategoriesComponent} from "./categories.component";
import {Permissions} from "../../constants/permissions";

export const CategoriesRoutes: Routes = [
    {
        path: '',
        component: CategoriesComponent,
        data: {
            permissions: [Permissions.CanGetCategories]
        }
    }
]
