import {Client} from '../../clients/models/client';
import {CatalogData} from "../../../shared/data-transfer-objects/catalog-data";
import {Coach} from "../../coaches/models/coach";
import {TimeSlot} from '../../time-slots/models/time-slot';
import { DayOfWeek } from '../../../enums/day-of-week';

export class Appointment {
    id!: string;
    startTime!: Date;
    endTime!: Date;
    createdAt!: Date;
    updatedAt!: Date;
    type!: CatalogData;
    status!: CatalogData;
    timeSlot!: TimeSlot;
    clients!: Client[];
    coaches!: Coach[];

    getWeekDay():string {
        const startTime = new Date(this.startTime);

        return DayOfWeek[startTime.getDay()];
    }
}
