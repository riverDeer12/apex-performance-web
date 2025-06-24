import { CatalogData } from '../../../shared/data-transfer-objects/catalog-data';
import { Client } from '../../clients/models/client';

export class Appointment {
    id!: string;
    startTime!: Date;
    endTime!: Date;
    createdAt!: Date;
    updatedAt!: Date;
    type!: CatalogData;
    status!: CatalogData;
    clients!: Client[];
}
