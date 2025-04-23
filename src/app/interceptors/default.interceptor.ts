import {HttpInterceptorFn} from '@angular/common/http';
import {Router} from '@angular/router';
import {tap} from 'rxjs';
import {LoaderService, LoadingOverlayRef} from '../services/loader.service';
import {AuthenticationService} from "../features/authentication/services/authentication.service";
import {inject} from "@angular/core";


export const DefaultInterceptor: HttpInterceptorFn = (request, next) => {
    const authService = inject(AuthenticationService);
    const router = inject(Router);
    const loadingService = inject(LoaderService);

    let loadingRef: LoadingOverlayRef;
    Promise.resolve(null).then(() => (loadingRef = loadingService.open()));

    if (authService.isUserLogged()) {
        const clonedRequest = request.clone({
            headers: request.headers.set(
                'Authorization',
                'Bearer ' + localStorage.getItem('token')
            ),
        });

        return next(clonedRequest).pipe(
            tap({
                next: () => loadingRef?.close(),
                error: (error) => {
                    loadingRef?.close();
                    if (error.status === 401) {
                        localStorage.removeItem('token');
                        router.navigateByUrl('authentication/login');
                    } else if (error.status === 403) {
                        router.navigateByUrl('forbidden');
                    } else if (error.status === 500) {
                        router.navigateByUrl('error');
                    }
                },
                complete: () => loadingRef?.close(),
            })
        );
    } else {
        return next(request).pipe(
            tap({
                next: () => loadingRef?.close(),
                error: (error) => {
                    loadingRef?.close();
                    if (error.status === 401) {
                        localStorage.removeItem('token');
                        router.navigateByUrl('authentication/login');
                    } else if (error.status === 403) {
                        router.navigateByUrl('forbidden');
                    } else if (error.status === 500) {
                        router.navigateByUrl('error');
                    }
                },
                complete: () => loadingRef?.close(),
            })
        );
    }
};

