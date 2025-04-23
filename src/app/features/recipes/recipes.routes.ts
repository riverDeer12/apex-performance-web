import {Routes} from "@angular/router";
import {RecipesComponent} from "./recipes.component";
import {Permissions} from "../../constants/permissions";

export const RecipesRoutes: Routes = [
    {
        path: '',
        component: RecipesComponent,
        data: {
            permissions: [Permissions.CanGetRecipes]
        }
    }
]
