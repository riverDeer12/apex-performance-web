import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { PersonalRecord } from "../models/personal-record";

@Injectable({
    providedIn: "root",
})
export class PersonalRecordService {
    constructor(private http: HttpClient) {}

    // Coaches and administrators pass the client, clients get their own records.
    getPersonalRecords = (clientId?: string) =>
        this.http.get<PersonalRecord[]>(environment.apiUrl + "/personal-records", {
            params: clientId ? new HttpParams().set("clientId", clientId) : undefined,
        });
}
