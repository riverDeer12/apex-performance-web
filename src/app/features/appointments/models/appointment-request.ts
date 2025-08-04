import {CatalogData} from "../../../shared/data-transfer-objects/catalog-data";
import { Client } from "../../clients/models/client";
import {Appointment} from "./appointment";

export class AppointmentRequest {
    id!: string;
    type!: CatalogData;
    status!: CatalogData;
    appointment!: Appointment;
    sender!: Client;
    comment!: string;
}