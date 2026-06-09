import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../environments/environment";
import { AppointmentRequest } from "../models/appointment-request";
import { DefaultPostRequest } from "../../../../shared/models/default-post-request";
import { StatusResponse } from "../../../../shared/status-response";

@Injectable({
  providedIn: "root",
})
export class AppointmentRequestService {
  constructor(private http: HttpClient) {}

  getAppointmentRequests = () =>
    this.http.get<AppointmentRequest[]>(
      environment.apiUrl + "/appointment-requests",
    );

  getPendingAppointmentRequests = () =>
    this.http.get<AppointmentRequest[]>(
      environment.apiUrl + "/appointment-requests/pending",
    );

  createCancelationRequest = (
    request: DefaultPostRequest,
    appointmentId: string,
  ) =>
    this.http.post<StatusResponse>(
      environment.apiUrl + "/appointment-requests/cancelation/" + appointmentId,
      request,
    );

  approveAppointmentRequest = (appointmentRequestId: string) =>
    this.http.get<AppointmentRequest[]>(
      environment.apiUrl +
        "/appointment-requests/approve/" +
        appointmentRequestId,
    );

  declineAppointmentRequest = (appointmentRequestId: string) =>
    this.http.get<AppointmentRequest[]>(
      environment.apiUrl +
        "/appointment-requests/decline/" +
        appointmentRequestId,
    );

  sendJoinRequest = (appointmentId: string) =>
    this.http.get<string>(
      environment.apiUrl + "/appointment-requests/join/" + appointmentId,
    );
}
