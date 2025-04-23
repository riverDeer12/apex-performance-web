import {Category} from "../../categories/models/category";

export class Recipe {
    id!: string;
    title!: string;
    content!: string;
    isDeleted!: boolean;
    createdAt!: Date;
    updatedAt!: Date;
    categories!: Category[];

    get status(): string {
        return this.isDeleted ? 'Inactive' : 'Active';
    }
}
