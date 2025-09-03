import { Injectable } from "@angular/core";
import { Appointment } from "../models/appointment";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { DefaultUpdateRequest } from "../../../models/default-update-request";
import { DefaultPostRequest } from "../../../models/default-post-request";
import { AppointmentsByDay } from "../models/appointments-by-day";
import { AppointmentsStatus } from "../../../shared/data-transfer-objects/appointments-status";

@Injectable({
  providedIn: "root",
})
export class AppointmentService {
  constructor(private http: HttpClient) {}

  getAllAppointments = () =>
    this.http.get<Appointment[]>(environment.apiUrl + "/appointments");

  getClientAppointments = () =>
    this.http.get<AppointmentsStatus>(
      environment.apiUrl + "/appointments/client",
    );

  getCoachAppointments = () =>
    this.http.get<AppointmentsStatus>(
      environment.apiUrl + "/appointments/coach",
    );

  getAllAppointmentsStatus = () =>
    this.http.get<AppointmentsStatus>(
      environment.apiUrl + "/appointments/status",
    );

  createAppointment = (request: DefaultPostRequest) =>
    this.http.post<Appointment>(environment.apiUrl + "/appointments/", request);

  updateAppointment = (appointmentId: string, request: DefaultUpdateRequest) =>
    this.http.put<Appointment>(
      environment.apiUrl + "/appointments/" + appointmentId,
      request,
    );

  deleteAppointment = (appointmentId: string) =>
    this.http.delete<Appointment>(
      environment.apiUrl + "/appointments/" + appointmentId,
    );

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

  progressAppointment = (appointmentId: string) =>
    this.http.get<Appointment>(
      environment.apiUrl + "/appointments/progress/" + appointmentId,
    );
}
