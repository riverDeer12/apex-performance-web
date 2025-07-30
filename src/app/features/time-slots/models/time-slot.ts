import { DayOfWeek } from "../../../enums/day-of-week";

export class TimeSlot {
    id!: string;
    day!: DayOfWeek;
    name!: string;
    startTime!: Date;
    endTime!: Date;
}
