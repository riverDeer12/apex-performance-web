import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "../../../../../environments/environment";
import {AppointmentLocation, AppointmentLocationRequest} from "../models/appointment-location";

@Injectable({
    providedIn: 'root'
})
export class AppointmentLocationService {

    constructor(private http: HttpClient) {
    }

    getAppointmentLocations = () =>
        this.http.get<AppointmentLocation[]>(environment.apiUrl + "/appointment-locations");

    createAppointmentLocation = (request: AppointmentLocationRequest) =>
        this.http.post<AppointmentLocation>(environment.apiUrl + "/appointment-locations", request);

    updateAppointmentLocation = (locationId: string, request: AppointmentLocationRequest) =>
        this.http.put<AppointmentLocation>(environment.apiUrl + "/appointment-locations/" + locationId, request);

    deleteAppointmentLocation = (locationId: string) =>
        this.http.delete(environment.apiUrl + "/appointment-locations/" + locationId);
}
