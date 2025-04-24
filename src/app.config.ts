import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {ApplicationConfig} from '@angular/core';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling} from '@angular/router';
import {providePrimeNG} from 'primeng/config';
import {appRoutes} from './app.routes';
import {DefaultInterceptor} from "./app/interceptors/default.interceptor";
import Nora from '@primeng/themes/nora';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({
            anchorScrolling: 'enabled',
            scrollPositionRestoration: 'enabled'
        }), withEnabledBlockingInitialNavigation()),
            provideHttpClient(withFetch(),withInterceptors([DefaultInterceptor]),
        ),
        provideAnimationsAsync(),
        providePrimeNG({theme: {preset: Nora, options: {darkModeSelector: '.app-dark'}}})
    ]
};
