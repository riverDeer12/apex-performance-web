import {ComponentRef, Injectable, Injector} from '@angular/core';
import {Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {LoaderComponent} from "../components/loader/loader.component";

/**
 * Class that uses as an Overlay
 * reference, so it can close
 * (dispose) the loading overlay.
 */
export class LoadingOverlayRef {
    constructor(private overlayRef: OverlayRef) {
    }

    close(): void {
        this.overlayRef.dispose();
    }
}

/**
 * A service which is used
 * to show a loading overlay.
 * Should be used when making
 * some API requests.
 */
@Injectable({
    providedIn: 'root'
})
export class LoaderService {
    constructor(private injector: Injector, private overlay: Overlay) {
    }

    /**
     * Will show the loading
     * overlay component.
     */
    open(): LoadingOverlayRef {
        const overlayRef = this.createOverlay();

        const dialogRef = new LoadingOverlayRef(overlayRef);

        this.attachDialogContainer(overlayRef, dialogRef);

        return dialogRef;
    }

    /**
     * Creates the overlay with
     * default configuration.
     */
    private createOverlay(): OverlayRef {
        const positionStrategy = this.overlay
            .position()
            .global()
            .centerHorizontally()
            .centerVertically();
        const overlayConfig = new OverlayConfig({
            hasBackdrop: true,
            scrollStrategy: this.overlay.scrollStrategies.block(),
            positionStrategy
        });

        return this.overlay.create(overlayConfig);
    }

    /**
     * Will attach the component
     * to the Portal, so it
     * can be shown.
     * @param overlayRef overlay reference
     * @param dialogRef dialog reference
     */
    private attachDialogContainer(
        overlayRef: OverlayRef,
        dialogRef: LoadingOverlayRef
    ): LoaderComponent {
        const injector = this.createInjector();
        const containerPortal = new ComponentPortal(LoaderComponent, null, injector);
        const containerRef: ComponentRef<LoaderComponent> =
            overlayRef.attach(containerPortal);

        return containerRef.instance;
    }

    /**
     * Will create the Injector
     * needed for ComponentPortal.
     */
    private createInjector(): Injector {
        return Injector.create({
            parent: this.injector,
            providers: []
        });
    }
}
