import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {AppointmentRequest} from '../models/appointment-request';

@Injectable({
    providedIn: 'root'
})
export class AppointmentRequestService {
    constructor(private http: HttpClient) {
    }

    getAppointmentRequests = () =>
        this.http.get<AppointmentRequest[]>(environment.apiUrl + "/appointment-requests");

    approveAppointmentRequest = (appointmentRequestId: string) =>
        this.http.get<AppointmentRequest[]>(environment.apiUrl + "/appointment-requests/approve/" + appointmentRequestId);

    declineAppointmentRequest = (appointmentRequestId: string) =>
        this.http.get<AppointmentRequest[]>(environment.apiUrl + "/appointment-requests/decline/" + appointmentRequestId);
}
