import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {DefaultPostRequest} from "../../../models/default-post-request";
import {DefaultUpdateRequest} from "../../../models/default-update-request";
import {Administrator} from "../models/administrator";

@Injectable({
    providedIn: 'root'
})
export class AdministratorService {

    constructor(private http: HttpClient) {
    }

    getAllAdministrators = () => this.http.get<Administrator[]>(environment.apiUrl + '/administrators');
    getAdministrator = (administratorId: string) =>
        this.http.get<Administrator>(environment.apiUrl + '/administrators/' + administratorId);
    createAdministrator = (request: DefaultPostRequest) =>
        this.http.post<Administrator>(environment.apiUrl + '/administrators/', request);
    updateAdministrator = (administratorId: string, request: DefaultUpdateRequest) =>
        this.http.put<Administrator>(environment.apiUrl + '/administrators/' + administratorId, request);
    deleteAdministrator = (administratorId: string) =>
        this.http.delete<Administrator>(environment.apiUrl + '/administrators/' + administratorId);
}
