import { Client } from "../../../clients/models/client";
import { Coach } from "../../../coaches/models/coach";
import { TimeSlot } from "../../../time-slots/models/time-slot";
import { AppointmentType } from "../../appointment-types/models/appointment-type";

export class RecurringAppointment {
  id!: string;
  clients!: Client[];
  coach!: Coach;
  timeSlot!: TimeSlot;
  type!: AppointmentType;
  status!: boolean;
}
