import {User} from "../../users/models/user";

export class Coach {
    id!: string;
    firstname!: string;
    lastname!: string;
    email!: string;
    phone!: string;
    createdAt!: Date;
    updatedAt!: Date;
    user!: User;
    isDeleted!: boolean;

    get fullName(): string {
        return `${this.firstname} ${this.lastname}`;
    }

    get status(): string {
        return this.isDeleted ? 'Inactive' : 'Active';
    }
}
