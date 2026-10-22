import { Injectable } from "@angular/core";
import { HttpClient, HttpContext } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { SKIP_LOADER } from "../../../interceptors/default.interceptor";
import { AcceptRulesRequest, Rules, RulesAcceptance } from "../models/rules";

/**
 * Cooperation rules clients accept in the app, and which clients
 * accepted them for coaches and administrators.
 */
@Injectable({ providedIn: "root" })
export class RulesService {
    constructor(private http: HttpClient) {}

    // Checked in the background after login, the overlay would flash on every page load.
    getRules = () =>
        this.http.get<Rules>(environment.apiUrl + "/rules",
            { context: new HttpContext().set(SKIP_LOADER, true) });

    acceptRules = (request: AcceptRulesRequest) =>
        this.http.post<Rules>(environment.apiUrl + "/rules/accept", request);

    getAcceptances = () =>
        this.http.get<RulesAcceptance[]>(environment.apiUrl + "/rules/acceptances",
            { context: new HttpContext().set(SKIP_LOADER, true) });
}
