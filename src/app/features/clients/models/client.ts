import { User } from '../../users/models/user';

export class Client {
    id!: string;
    firstName!: string;
    lastName!: string;
    email!: string;
    phone!: string;
    createdAt!: Date;
    updatedAt!: Date;
    user!: User;
    isDeleted!: boolean;

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    get status(): string {
        return this.isDeleted ? 'Inactive' : 'Active';
    }
}
