import { Client } from "../../clients/models/client";
import { Coach } from "../../coaches/models/coach";
import { TimeSlot } from "../../time-slots/models/time-slot";

export class RecurringAppointment {
  client!: Client;
  coach!: Coach;
  timeSlot!: TimeSlot;
}
