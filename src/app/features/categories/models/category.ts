import {Recipe} from "../../recipes/models/recipe";

export class Category {
    id!: string;
    name!: string;
    description!: string;
    createdAt!: Date;
    updatedAt!: Date;
    isDeleted!: boolean;
    recipes!: Recipe[];

    get status(): string {
        return this.isDeleted ? 'Inactive' : 'Active';
    }
}
