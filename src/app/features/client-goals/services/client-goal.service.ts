import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { ClientGoal, ClientGoalRequest } from "../models/client-goal";

@Injectable({
    providedIn: "root",
})
export class ClientGoalService {
    constructor(private http: HttpClient) {}

    getClientGoal = (clientId: string) =>
        this.http.get<ClientGoal>(environment.apiUrl + "/client-goals/" + clientId);

    getMyClientGoal = () =>
        this.http.get<ClientGoal>(environment.apiUrl + "/client-goals/my");

    updateClientGoal = (clientId: string, request: ClientGoalRequest) =>
        this.http.put<ClientGoal>(environment.apiUrl + "/client-goals/" + clientId, request);
}
