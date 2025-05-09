import { Client } from '../../clients/models/client';
import { AppointmentType } from './appointment-type';

export class Appointment {
    id!: string;
    startTime!: Date;
    endTime!: Date;
    createdAt!: Date;
    updatedAt!: Date;
    appointmentType!: AppointmentType;
    clients!: Client[];
}
