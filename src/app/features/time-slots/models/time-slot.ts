import { DayOfWeek } from "../../../enums/day-of-week";
import { Coach } from '../../coaches/models/coach';

export class TimeSlot {
    id!: string;
    day!: DayOfWeek;
    name!: string;
    startTime!: Date;
    endTime!: Date;
    coach!: Coach;
    status!: boolean;

    get dayName(): string {
        return DayOfWeek[this.day];
    }
}
