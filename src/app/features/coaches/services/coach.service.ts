import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Coach} from "../models/coach";
import {environment} from "../../../../environments/environment";
import {DefaultPostRequest} from "../../../models/default-post-request";
import {DefaultUpdateRequest} from "../../../models/default-update-request";

@Injectable({
    providedIn: 'root'
})
export class CoachService {

    constructor(private http: HttpClient) {
    }

    getAllCoaches = () => this.http.get<Coach[]>(environment.apiUrl + '/coaches/all');
    getCoach = (coachId: string) =>
        this.http.get<Coach>(environment.apiUrl + '/coaches/' + coachId);
    createCoach = (request: DefaultPostRequest) =>
        this.http.post<Coach>(environment.apiUrl + '/coaches/', request);
    updateCoach = (coachId: string, request: DefaultUpdateRequest) =>
        this.http.put<Coach>(environment.apiUrl + '/coaches/' + coachId, request);
    deleteCoach = (coachId: string) =>
        this.http.delete<Coach>(environment.apiUrl + '/coaches/' + coachId);
}
