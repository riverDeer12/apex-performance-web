import { DayOfWeek } from "../../../enums/day-of-week";

export class TimeSlot {
    id!: string;
    day!: DayOfWeek;
    startTime!: Date;
    endTime!: Date;
}
