import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {BodyMeasurement} from "../models/body-measurement";
import {environment} from "../../../../environments/environment";
import {DefaultUpdateRequest} from "../../../models/default-update-request";
import {DefaultPostRequest} from "../../../models/default-post-request";

@Injectable({
    providedIn: 'root'
})
export class BodyMeasurementService {

    constructor(private http: HttpClient) {
    }

    getAllBodyMeasurements = () => 
        this.http.get<BodyMeasurement[]>(environment.apiUrl + "/body-measurements");

    getCoachClientsBodyMeasurements = () =>
        this.http.get<BodyMeasurement[]>(environment.apiUrl + "/body-measurements/coach");

    getClientBodyMeasurements = () =>
        this.http.get<BodyMeasurement[]>(environment.apiUrl + "/body-measurements/client");

    createBodyMeasurement = (request: DefaultPostRequest) =>
        this.http.post<BodyMeasurement>(environment.apiUrl + "/body-measurements/", request);

    updateBodyMeasurement = (bodyMeasurementId: string, request: DefaultUpdateRequest) =>
        this.http.put<BodyMeasurement>(environment.apiUrl + "/body-measurements/" + bodyMeasurementId, request);

    deleteBodyMeasurement = (bodyMeasurementId: string) =>
        this.http.delete<BodyMeasurement>(environment.apiUrl + "/body-measurements/" + bodyMeasurementId);
}
