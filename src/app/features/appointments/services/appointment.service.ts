import { Injectable } from "@angular/core";
import { Appointment } from "../models/appointment";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { DefaultUpdateRequest } from "../../../models/default-update-request";
import { DefaultPostRequest } from "../../../models/default-post-request";
import { AppointmentType } from '../models/appointment-type';

@Injectable({
  providedIn: "root",
})
export class AppointmentService {
  constructor(private http: HttpClient) {}

  getAllAppointments = () =>
    this.http.get<Appointment[]>(environment.apiUrl + "/appointments");
  getAppointment = (appointmentId: string) =>
    this.http.get<Appointment>(
      environment.apiUrl + "/appointments/" + appointmentId,
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
}
