import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { RecurringAppointment } from "../models/recurring-appointment";
import { DefaultPostRequest } from "../../../models/default-post-request";

@Injectable({
  providedIn: "root",
})
export class RecurringAppointmentService {

  constructor(private http: HttpClient) {}

  getAllRecurringAppointments = () =>
    this.http.get<RecurringAppointment[]>(
      environment.apiUrl + "/recurring-appointments/all",
    );

  getClientRecurringAppointments = () =>
    this.http.get<RecurringAppointment[]>(
      environment.apiUrl + "/recurring-appointments/client",
    );

  getCoachRecurringAppointments = () =>
    this.http.get<RecurringAppointment[]>(
      environment.apiUrl + "/recurring-appointments/coach",
    );

  changeClientRecurringAppointmentActivity = (recurringAppointmentId: string) =>
      this.http.get<RecurringAppointment>(
          environment.apiUrl + "/recurring-appointments/" + recurringAppointmentId + "/activity",
      );

  createRecurringAppointment = (request: DefaultPostRequest) =>
    this.http.post<RecurringAppointment>(
      environment.apiUrl + "/recurring-appointments/",
      request,
    );

  updateRecurringAppointment = (
    recurringAppointmentId: string,
    request: DefaultPostRequest,
  ) =>
    this.http.put<RecurringAppointment>(
      environment.apiUrl + "/recurring-appointments/" + recurringAppointmentId,
      request,
    );
}
