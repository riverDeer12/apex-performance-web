import { Injectable } from "@angular/core";
import { Appointment } from "../models/appointment";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { DefaultPostRequest } from "../../../shared/models/default-post-request";
import { AppointmentsStatus } from "../../../shared/data-transfer-objects/appointments-status";

@Injectable({
  providedIn: "root",
})
export class AppointmentService {
  constructor(private http: HttpClient) {}

  getAppointments = () =>
    this.http.get<AppointmentsStatus>(environment.apiUrl + "/appointments");

  createAppointment = (request: DefaultPostRequest) =>
    this.http.post<Appointment>(environment.apiUrl + "/appointments/", request);

  approveAppointment = (appointmentId: string) =>
    this.http.get<Appointment>(
      environment.apiUrl + "/appointments/approve/" + appointmentId,
    );

  declineAppointment = (appointmentId: string) =>
    this.http.get<Appointment>(
      environment.apiUrl + "/appointments/decline/" + appointmentId,
    );

  cancelAppointment = (appointmentId: string) =>
    this.http.get<Appointment>(
      environment.apiUrl + "/appointments/cancel/" + appointmentId,
    );
}
