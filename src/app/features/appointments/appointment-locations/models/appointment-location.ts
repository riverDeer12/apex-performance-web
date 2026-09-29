export class AppointmentLocation {
    id!: string;
    name!: string;
    address?: string | null;
    latitude!: number;
    longitude!: number;
    googleMapsUrl?: string | null;
    createdAt!: string;
    updatedAt!: string;
}

export class AppointmentLocationRequest {
    name!: string;
    address?: string | null;
    latitude!: number;
    longitude!: number;
    googleMapsUrl?: string | null;
}

/**
 * Google Maps link that starts navigation
 * to given coordinates.
 */
export function getNavigationUrl(location: AppointmentLocation): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
}
