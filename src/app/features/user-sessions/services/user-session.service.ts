import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "../../../../environments/environment";
import {UserLastSession, UserSession} from "../models/user-session";

@Injectable({
    providedIn: 'root'
})
export class UserSessionService {

    constructor(private http: HttpClient) {
    }

    getUserSessions = () =>
        this.http.get<UserLastSession[]>(environment.apiUrl + "/user-sessions");

    getUserSessionHistory = (userId: string) =>
        this.http.get<UserSession[]>(environment.apiUrl + "/user-sessions/" + userId);

    revokeUserSession = (sessionId: string) =>
        this.http.post(environment.apiUrl + "/user-sessions/" + sessionId + "/revoke", {});
}
