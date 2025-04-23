import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {DefaultPostRequest} from "../../../models/default-post-request";
import {DefaultUpdateRequest} from "../../../models/default-update-request";
import {User} from "../models/user";

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private http: HttpClient) {
    }

    getAllUsers = () => this.http.get<User[]>(environment.apiUrl + '/users');
    getUser = (userId: string) =>
        this.http.get<User>(environment.apiUrl + '/users/' + userId);
    createUser = (request: DefaultPostRequest) =>
        this.http.post<User>(environment.apiUrl + '/users/', request);
    updateUser = (userId: string, request: DefaultUpdateRequest) =>
        this.http.put<User>(environment.apiUrl + '/users/' + userId, request);
    deleteUser = (userId: string) =>
        this.http.delete<User>(environment.apiUrl + '/users/' + userId);
}
