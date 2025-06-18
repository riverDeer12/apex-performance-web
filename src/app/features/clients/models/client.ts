import { User } from '../../users/models/user';
import {Coach} from "../../coaches/models/coach";

export class Client {
    id!: string;
    firstName!: string;
    lastName!: string;
    email!: string;
    phone!: string;
    credits!: number;
    createdAt!: Date;
    updatedAt!: Date;
    user!: User;
    coaches!: Coach[];
    isDeleted!: boolean;

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    get status(): string {
        return this.isDeleted ? 'Inactive' : 'Active';
    }
}
