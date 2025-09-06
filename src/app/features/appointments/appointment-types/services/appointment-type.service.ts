import {Injectable} from "@angular/core";
import {environment} from "../../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {DefaultPostRequest} from "../../../../shared/models/default-post-request";
import {DefaultUpdateRequest} from "../../../../shared/models/default-update-request";
import {AppointmentType} from "../models/appointment-type";

@Injectable({
    providedIn: "root",
})
export class AppointmentTypeService {
    constructor(private http: HttpClient) {
    }

    getAllAppointmentTypes = () =>
        this.http.get<AppointmentType[]>(environment.apiUrl + "/appointment-types/all");

    getAppointmentType = (appointmentTypeId: string) =>
        this.http.get<AppointmentType>(
            environment.apiUrl + "/appointment-types/" + appointmentTypeId,
        );

    getCoachesAppointmentTypes = (request: DefaultPostRequest) =>
        this.http.post<AppointmentType[]>(
            environment.apiUrl + "/appointment-types/coaches", request
        );

    createAppointmentType = (request: DefaultPostRequest) =>
        this.http.post<AppointmentType>(
            environment.apiUrl + "/appointment-types/",
            request,
        );

    updateAppointmentType = (
        appointmentTypeId: string,
        request: DefaultUpdateRequest,
    ) =>
        this.http.put<AppointmentType>(
            environment.apiUrl + "/appointment-types/" + appointmentTypeId,
            request,
        );

    deleteAppointmentType = (appointmentTypeId: string) =>
        this.http.delete<AppointmentType>(
            environment.apiUrl + "/appointment-types/" + appointmentTypeId,
        );
}
