import {Client} from "../../clients/models/client";

export class BodyMeasurement {
    id!: string;
    height!: number;
    weight!: number;
    shoulders!: number;
    chest!: number;
    upperArm!: number;
    waist!: number;
    thigh!: number;
    calves!: number;
    client!: Client;
}
