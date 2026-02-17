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

    fullName!: string;

    get status(): string {
        return this.isDeleted ? 'Inactive' : 'Active';
    }
}
