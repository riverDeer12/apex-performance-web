import {HttpInterceptorFn} from '@angular/common/http';
import {Router} from '@angular/router';
import {LoaderService, LoadingOverlayRef} from '../shared/services/loader.service';
import {AuthenticationService} from "../features/authentication/services/authentication.service";
import {inject} from "@angular/core";
import { catchError, finalize, throwError } from "rxjs";

const MIN_OVERLAY_MS = 500;

export const DefaultInterceptor: HttpInterceptorFn = (request, next) => {
    const authService = inject(AuthenticationService);
    const router = inject(Router);
    const loadingService = inject(LoaderService);

    // Open overlay and start timer
    const loadingRef = loadingService.open();
    const start = performance.now();

    // Add auth header if logged in
    const req = authService.isUserLogged()
        ? request.clone({
            setHeaders: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        : request;

    return next(req).pipe(
        // Navigate on errors as before
        catchError((error) => {
            if (error.status === 401) {
                localStorage.removeItem('token');
                router.navigateByUrl('authentication/login');
            } else if (error.status === 403) {
                router.navigateByUrl('forbidden');
            } else if (error.status === 500) {
                router.navigateByUrl('error');
            }
            return throwError(() => error);
        }),
        // Ensure the overlay stays up at least MIN_OVERLAY_MS
        finalize(() => {
            const elapsed = performance.now() - start;
            const remaining = Math.max(MIN_OVERLAY_MS - elapsed, 0);
            setTimeout(() => loadingRef?.close(), remaining);
        })
    );
};


