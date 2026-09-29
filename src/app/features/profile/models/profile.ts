export class Profile {
    userId!: string;
    username!: string;
    email!: string;
    roles!: string[];
    // Client, Coach, Administrator or null
    // when user has no personal data.
    profileType?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    hasProfilePicture!: boolean;
    profilePictureUpdatedAt?: string | null;
}

export class UpdateProfileRequest {
    email!: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
}
