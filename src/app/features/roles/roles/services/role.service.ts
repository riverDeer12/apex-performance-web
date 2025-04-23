import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Role} from "../models/role";
import {DefaultPostRequest} from "../../../../models/default-post-request";
import {environment} from "../../../../../environments/environment";
import {DefaultUpdateRequest} from "../../../../models/default-update-request";
import {Permission} from "../models/permission";

@Injectable({
    providedIn: 'root'
})
export class RoleService {

    constructor(private http: HttpClient) {
    }

    getAllRoles = () => this.http.get<Role[]>(environment.apiUrl + '/roles');
    getAllPermissions = () => this.http.get<Permission[]>(environment.apiUrl + '/permissions');
    getRole = (roleId: string) =>
        this.http.get<Role>(environment.apiUrl + '/roles/' + roleId);
    createRole = (request: DefaultPostRequest) =>
        this.http.post<Role>(environment.apiUrl + '/roles/', request);
    updateRole = (roleId: string, request: DefaultUpdateRequest) =>
        this.http.put<Role>(environment.apiUrl + '/roles/' + roleId, request);
    deleteRole = (roleId: string) =>
        this.http.delete<Role>(environment.apiUrl + '/roles/' + roleId);
}
