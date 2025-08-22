import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {DefaultPostRequest} from '../../../models/default-post-request';
import {DefaultUpdateRequest} from '../../../models/default-update-request';
import {Client} from '../models/client';

@Injectable({
    providedIn: 'root'
})
export class ClientService {

    constructor(private http: HttpClient) {
    }

    getAllClients = () => this.http.get<Client[]>(environment.apiUrl + '/clients/all');

    getClient = (clientId: string) =>
        this.http.get<Client>(environment.apiUrl + '/clients/' + clientId);

    getCoachClients = () =>
        this.http.get<Client[]>(environment.apiUrl + '/clients/coach');

    getClientsByCoachId = (coachId: string) =>
        this.http.get<Client[]>(environment.apiUrl + '/clients/coach/'+ coachId);

    getCoachesClients = (request: DefaultPostRequest) =>
        this.http.post<Client[]>(environment.apiUrl + '/clients/coaches', request);

    createClient = (request: DefaultPostRequest) =>
        this.http.post<Client>(environment.apiUrl + '/clients/', request);

    updateClient = (clientId: string, request: DefaultUpdateRequest) =>
        this.http.put<Client>(environment.apiUrl + '/clients/' + clientId, request);

    deleteClient = (clientId: string) =>
        this.http.delete<Client>(environment.apiUrl + '/clients/' + clientId);
}
