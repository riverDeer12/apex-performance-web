import { Component, DestroyRef, OnInit, computed, inject, signal } from "@angular/core";
import { ActivatedRouteSnapshot, NavigationEnd, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filter } from "rxjs";
import { TranslationService } from "../../i18n/translation.service";

/**
 * Page title shown above every admin page. Title and
 * menu section come from route data (translation keys),
 * e.g. { title: "menu.appointmentTypes", section: "menu.appointments" }.
 */
@Component({
  selector: "app-page-header",
  standalone: true,
  template: `
    @if (title()) {
      <div class="page-header">
        @if (section()) {
          <div class="page-header-section">{{ section() }}</div>
        }
        <h1 class="page-title">{{ title() }}</h1>
      </div>
    }
  `,
})
export class AppPageHeader implements OnInit {
  private router = inject(Router);
  private titleService = inject(Title);
  private translationService = inject(TranslationService);
  private destroyRef = inject(DestroyRef);

  private titleKey = signal<string | null>(null);
  private sectionKey = signal<string | null>(null);

  readonly title = computed(() => this.translate(this.titleKey()));

  // Section is hidden when it is the same as the title
  // (menu groups with a single item, e.g. Coaches).
  readonly section = computed(() => {
    const section = this.translate(this.sectionKey());
    return section && section !== this.title() ? section : null;
  });

  ngOnInit(): void {
    this.readRouteData();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.readRouteData());
  }

  private readRouteData(): void {
    let route: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
    let title: string | null = null;
    let section: string | null = null;

    // Deepest route with data wins.
    while (route) {
      title = route.data["title"] ?? title;
      section = route.data["section"] ?? section;
      route = route.firstChild!;
    }

    this.titleKey.set(title);
    this.sectionKey.set(section);

    this.titleService.setTitle(title ? `${this.translate(title)} | Apex Performance` : "Apex Performance");
  }

  private translate(key: string | null): string | null {
    // Reading language signal so titles update when language changes.
    this.translationService.language();
    return key ? this.translationService.t(key) : null;
  }
}
