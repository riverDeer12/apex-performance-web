import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {DefaultPostRequest} from "../../../models/default-post-request";
import {DefaultUpdateRequest} from "../../../models/default-update-request";
import {TimeSlot} from '../models/time-slot';

@Injectable({
    providedIn: 'root'
})
export class TimeSlotService {

    constructor(private http: HttpClient) {
    }

    getAllTimeSlots = () => this.http.get<TimeSlot[]>(environment.apiUrl + '/time-slots');

    getTimeSlot = (TimeSlotId: string) =>
        this.http.get<TimeSlot>(environment.apiUrl + '/time-slots/' + TimeSlotId);

    createTimeSlot = (request: DefaultPostRequest) =>
        this.http.post<TimeSlot>(environment.apiUrl + '/time-slots/', request);

    updateTimeSlot = (TimeSlotId: string, request: DefaultUpdateRequest) =>
        this.http.put<TimeSlot>(environment.apiUrl + '/time-slots/' + TimeSlotId, request);

    deleteTimeSlot = (TimeSlotId: string) =>
        this.http.delete<TimeSlot>(environment.apiUrl + '/time-slots/' + TimeSlotId);
}
