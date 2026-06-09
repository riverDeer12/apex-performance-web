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
  isTaken!: boolean;
  appointmentId!: string;

  get dayName(): string {
    return DayOfWeek[this.day];
  }
}
