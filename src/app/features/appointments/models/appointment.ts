import {Client} from '../../clients/models/client';
import {CatalogData} from "../../../shared/data-transfer-objects/catalog-data";
import {Coach} from "../../coaches/models/coach";

export class Appointment {
    id!: string;
    startTime!: Date;
    endTime!: Date;
    createdAt!: Date;
    updatedAt!: Date;
    type!: CatalogData;
    status!: CatalogData;
    clients!: Client[];
    coaches!: Coach[];
}
