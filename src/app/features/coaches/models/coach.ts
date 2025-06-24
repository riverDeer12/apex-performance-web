import {User} from "../../users/models/user";
import {Client} from "../../clients/models/client";

export class Coach {
    id!: string;
    firstName!: string;
    lastName!: string;
    email!: string;
    phone!: string;
    createdAt!: Date;
    updatedAt!: Date;
    clients!: Client[];
    user!: User;
    isDeleted!: boolean;

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    get status(): string {
        return this.isDeleted ? 'Inactive' : 'Active';
    }
}
