import {LocalizedProperty} from "./localized-property";

export class WorkoutType {
    id!: string;
    name!: LocalizedProperty | string;
    description!: LocalizedProperty | string;
}
