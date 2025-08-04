import { Appointment } from "../../features/appointments/models/appointment";

export class AppointmentsStatus {
    approvedAppointments!: Appointment[];
    pendingAppointments!: Appointment[];
    inProgressAppointments!: Appointment[];
}
