import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {DefaultPostRequest} from "../../../shared/models/default-post-request";
import {DefaultUpdateRequest} from "../../../shared/models/default-update-request";
import {User} from "../models/user";
import {AuthResponse} from "../../authentication/models/auth-response";
import {Log} from "../models/log";

@Injectable({
    providedIn: "root",
})
export class LogService {
    constructor(private http: HttpClient) {
    }

    getLogs = () => this.http.get<Log[]>(environment.apiUrl + "/logs");
}
