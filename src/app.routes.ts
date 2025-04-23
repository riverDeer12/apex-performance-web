import {Routes} from '@angular/router';
import {AdminLayout} from './app/layout/component/admin-layout.component';
import {Dashboard} from './app/pages/dashboard/dashboard';
import {Landing} from './app/pages/landing/landing';
import {NotFound} from './app/components/not-found/not-found';
import {Forbidden} from './app/components/forbidden/forbidden';
import {Error} from "./app/components/error/error";
import {AdminGuard} from "./app/guards/admin.guard";

export const appRoutes: Routes = [
    {path: '', component: Landing},
    {
        path: '',
        component: Landing
    },
    {
        path: 'authentication',
        loadChildren: () =>
            import('./app/features/authentication/authentication.routes')
                .then((m) => m.AuthenticationRoutes),
    },
    {
        path: 'admin',
        component: AdminLayout,
        canActivate: [AdminGuard],
        children: [
            {
                path: 'dashboard',
                component: Dashboard
            },
            {
                path: 'categories',
                loadChildren: () =>
                    import('./app/features/categories/categories.routes')
                        .then((m) => m.CategoriesRoutes)
            },
            {
                path: 'recipes',
                loadChildren: () =>
                    import('./app/features/recipes/recipes.routes')
                        .then((m) => m.RecipesRoutes)
            },
            {
                path: 'administrators',
                loadChildren: () =>
                    import('./app/features/administrators/administrators.routes')
                        .then((m) => m.AdministratorsRoutes)
            },
            {
                path: 'users',
                loadChildren: () =>
                    import('./app/features/users/users.routes')
                        .then((m) => m.UsersRoutes)
            }
        ]
    },
    {
        path: 'authentication',
        loadChildren: () =>
            import('./app/features/authentication/authentication.routes')
                .then((m) => m.AuthenticationRoutes),
    },
    {path: 'not-found', component: NotFound},
    {path: 'forbidden', component: Forbidden},
    {path: 'error', component: Error},
    {path: '**', redirectTo: '/not-found'}
];
