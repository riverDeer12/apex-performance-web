import {User} from "../../users/models/user";

export class Administrator {
    id!: string;
    firstName!: string;
    lastName!: string;
    createdAt!: Date;
    updatedAt!: Date;
    user!: User;
    isDeleted!: boolean;
    // Profile picture link, null without a picture.
    pictureUrl?: string | null;

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    get status(): string {
        return this.isDeleted ? 'Inactive' : 'Active';
    }
}
