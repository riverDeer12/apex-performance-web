import { Component, Signal, computed, inject, input } from "@angular/core";
import { UserPictureService, initialsOf } from "./user-picture.service";

/**
 * Round profile picture of a client, coach or administrator, with their
 * initials while it loads or when they have none.
 */
@Component({
    selector: "app-user-avatar",
    standalone: true,
    template: `
        <span class="user-avatar" [style.width]="size()" [style.height]="size()" [style.font-size]="fontSize()"
              [attr.title]="name()" aria-hidden="true">
            @if (picture(); as src) {
                <img [src]="src" alt=""/>
            } @else {
                {{ initials() }}
            }
        </span>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex: none;
        }

        .user-avatar {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            overflow: hidden;
            font-weight: 600;
            line-height: 1;
            background: color-mix(in srgb, var(--p-primary-color) 16%, transparent);
            color: var(--p-primary-color);
            box-shadow: var(--user-avatar-ring, none);
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    `,
})
export class UserAvatarComponent {
    private readonly pictures = inject(UserPictureService);

    readonly name = input<string | null | undefined>("");
    /** The API's picture link, null/undefined without a picture. */
    readonly pictureUrl = input<string | null | undefined>(null);
    /** CSS size, e.g. "2rem". */
    readonly size = input<string>("2rem");

    readonly initials = computed(() => initialsOf(this.name()));
    readonly fontSize = computed(() => `calc(${this.size()} * 0.38)`);

    private readonly loaded = computed<Signal<string | null> | null>(() => {
        const url = this.pictureUrl();
        return url ? this.pictures.picture(url) : null;
    });

    readonly picture = computed(() => this.loaded()?.() ?? null);
}
