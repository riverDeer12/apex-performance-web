import {Permission} from "./permission";
import {User} from "../../../users/models/user";

export class Role {
    id!: string;
    name!: string;
    description!: string;
    createdAt!: Date;
    updatedAt!: Date;
    isDeleted!: boolean;
    permissions!: Permission[];
    users!: User[];

    get status(): string {
        return this.isDeleted ? 'Inactive' : 'Active';
    }
}
