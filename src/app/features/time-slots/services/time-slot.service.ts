import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { DefaultPostRequest } from "../../../shared/models/default-post-request";
import { DefaultUpdateRequest } from "../../../shared/models/default-update-request";
import { TimeSlot } from "../models/time-slot";

@Injectable({
  providedIn: "root",
})
export class TimeSlotService {
  constructor(private http: HttpClient) {}

  getAllTimeSlots = () =>
    this.http.get<TimeSlot[]>(environment.apiUrl + "/time-slots/all");

  getAvailableCoachesTimeSlots = (request: DefaultPostRequest) =>
    this.http.post<TimeSlot[]>(
      environment.apiUrl + "/time-slots/available",
      request,
    );

  getCoachTimeSlots = () =>
      this.http.get<TimeSlot[]>(environment.apiUrl + "/time-slots");

  getRecurringAvailableTimeSlots = (coachId: string) =>
    this.http.get<TimeSlot[]>(
      environment.apiUrl + "/time-slots/recurring/available/" + coachId,
    );

  updateCoachTimeSlots = (request: DefaultPostRequest) =>
    this.http.post<TimeSlot[]>(
      environment.apiUrl + "/time-slots/coach",
      request,
    );

  createTimeSlot = (request: DefaultPostRequest) =>
    this.http.post<TimeSlot>(environment.apiUrl + "/time-slots/", request);

  updateTimeSlot = (timeSlotId: string, request: DefaultUpdateRequest) =>
    this.http.put<TimeSlot>(
      environment.apiUrl + "/time-slots/" + timeSlotId,
      request,
    );

  changeCoachTimeSlotActivity = (timeSlotId: string, coachId: string) =>
    this.http.get<TimeSlot>(
      environment.apiUrl + "/time-slots/" + timeSlotId + "/coach/" + coachId + "/activity",
    );
}
