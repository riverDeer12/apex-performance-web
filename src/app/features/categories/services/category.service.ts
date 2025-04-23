import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Category} from "../models/category";
import {environment} from "../../../../environments/environment";
import {DefaultUpdateRequest} from "../../../models/default-update-request";
import {DefaultPostRequest} from "../../../models/default-post-request";

@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    constructor(private http: HttpClient) {
    }

    getAllCategories = () => this.http.get<Category[]>(environment.apiUrl + '/categories');
    getCategory = (categoryId: string) =>
        this.http.get<Category>(environment.apiUrl + '/categories/' + categoryId);
    createCategory = (request: DefaultPostRequest) =>
        this.http.post<Category>(environment.apiUrl + '/categories/', request);
    updateCategory = (categoryId: string, request: DefaultUpdateRequest) =>
        this.http.put<Category>(environment.apiUrl + '/categories/' + categoryId, request);
    deleteCategory = (categoryId: string) =>
        this.http.delete<Category>(environment.apiUrl + '/categories/' + categoryId);
}
