/**
 * Appointment of another client shown
 * to clients only as an occupied time.
 */
export interface OccupiedAppointment {
  id: string;
  startTime: Date;
  endTime: Date;
}
