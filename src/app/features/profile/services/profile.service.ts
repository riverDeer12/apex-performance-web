import {HttpClient} from "@angular/common/http";
import {Injectable, signal} from "@angular/core";
import {Observable, tap} from "rxjs";
import {environment} from "../../../../environments/environment";
import {Profile, UpdateProfileRequest} from "../models/profile";

/**
 * Largest picture file user can select. It is resized in
 * the browser before upload, API accepts at most 2 MB.
 */
export const MAX_SELECTED_PICTURE_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOADED_PICTURE_BYTES = 2 * 1024 * 1024;
export const PICTURE_MAX_DIMENSION = 512;
export const ALLOWED_PICTURE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Keeps logged user's profile and profile picture so
 * top bar and profile page show the same data.
 */
@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    readonly profile = signal<Profile | null>(null);

    // Object URL of profile picture, picture API needs auth
    // header so it can't be used directly in <img src>.
    readonly pictureUrl = signal<string | null>(null);

    constructor(private http: HttpClient) {
    }

    load(): void {
        this.http.get<Profile>(environment.apiUrl + "/profile").subscribe({
            next: (profile: Profile) => {
                this.profile.set(profile);
                profile.hasProfilePicture ? this.loadPicture() : this.setPictureUrl(null);
            },
            error: () => this.profile.set(null),
        });
    }

    update = (request: UpdateProfileRequest): Observable<Profile> =>
        this.http.put<Profile>(environment.apiUrl + "/profile", request)
            .pipe(tap((profile: Profile) => this.profile.set(profile)));

    uploadPicture(picture: Blob): Observable<unknown> {
        const formData = new FormData();
        formData.append("file", picture, "profile-picture.jpg");

        return this.http.put(environment.apiUrl + "/profile/picture", formData)
            .pipe(tap(() => this.load()));
    }

    deletePicture = (): Observable<unknown> =>
        this.http.delete(environment.apiUrl + "/profile/picture")
            .pipe(tap(() => this.load()));

    /**
     * Clear data on log out so next user
     * doesn't see previous user's picture.
     */
    clear(): void {
        this.profile.set(null);
        this.setPictureUrl(null);
    }

    private loadPicture(): void {
        this.http.get(environment.apiUrl + "/profile/picture", {responseType: "blob"}).subscribe({
            next: (blob: Blob) => this.setPictureUrl(URL.createObjectURL(blob)),
            error: () => this.setPictureUrl(null),
        });
    }

    private setPictureUrl(url: string | null): void {
        const previous = this.pictureUrl();

        if (previous) URL.revokeObjectURL(previous);

        this.pictureUrl.set(url);
    }
}

/**
 * Scale picture down so the longer side is at most
 * PICTURE_MAX_DIMENSION px and encode it as JPEG.
 */
export function resizePicture(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);

            const scale = Math.min(1, PICTURE_MAX_DIMENSION / Math.max(image.width, image.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(image.width * scale);
            canvas.height = Math.round(image.height * scale);

            const context = canvas.getContext("2d")!;
            // White background so transparent PNGs don't turn black in JPEG.
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("resize failed")), "image/jpeg", 0.85);
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("invalid image"));
        };

        image.src = url;
    });
}
