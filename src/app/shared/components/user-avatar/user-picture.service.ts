import { HttpClient } from "@angular/common/http";
import { Injectable, Signal, signal } from "@angular/core";
import { environment } from "../../../../environments/environment";

/**
 * Profile pictures of other users (clients, coaches, administrators).
 * The API's link ("users/{id}/picture?v=...") needs the auth header, so
 * the picture is loaded once with HttpClient and kept as an object URL;
 * a new picture gets a new link.
 */
@Injectable({ providedIn: "root" })
export class UserPictureService {
    private readonly pictures = new Map<string, ReturnType<typeof signal<string | null>>>();

    constructor(private http: HttpClient) {}

    /** Object URL of the picture, null until it is loaded or when it can't be. */
    picture(pictureUrl: string): Signal<string | null> {
        let picture = this.pictures.get(pictureUrl);

        if (!picture) {
            picture = signal<string | null>(null);
            this.pictures.set(pictureUrl, picture);
            const loaded = picture;

            this.http.get(UserPictureService.url(pictureUrl), { responseType: "blob" }).subscribe({
                next: (blob: Blob) => loaded.set(URL.createObjectURL(blob)),
                // Initials stay; the next page load tries again.
                error: () => this.pictures.delete(pictureUrl),
            });
        }

        return picture.asReadonly();
    }

    /** Forget the pictures, e.g. on log out. */
    clear(): void {
        this.pictures.forEach(picture => {
            const url = picture();
            if (url) URL.revokeObjectURL(url);
        });
        this.pictures.clear();
    }

    static url(pictureUrl: string): string {
        if (/^https?:\/\//.test(pictureUrl)) return pictureUrl;
        return environment.apiUrl.replace(/\/$/, "") + "/" + pictureUrl.replace(/^\//, "");
    }
}

/** Up to two initials of a name, "?" without one. */
export function initialsOf(name: string | null | undefined): string {
    const initials = (name ?? "")
        .split(" ")
        .filter(part => part.length > 0)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("");
    return initials || "?";
}
