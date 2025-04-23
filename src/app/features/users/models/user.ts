import {Role} from "../../roles/roles/models/role";

export class User {
    id!: string;
    username!: string;
    password!: string;
    email!: string;
    createdAt!: Date;
    updatedAt!: Date;
    isDeleted!: boolean;
    roles!: Role[];

    get status(): string {
        return this.isDeleted ? 'Inactive' : 'Active';
    }
}
