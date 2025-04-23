import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {DefaultPostRequest} from "../../../models/default-post-request";
import {DefaultUpdateRequest} from "../../../models/default-update-request";
import {Recipe} from "../models/recipe";

@Injectable({
    providedIn: 'root'
})
export class RecipeService {

    constructor(private http: HttpClient) {
    }

    getAllRecipes = () => this.http.get<Recipe[]>(environment.apiUrl + '/recipes');
    getRecipe = (recipeId: string) =>
        this.http.get<Recipe>(environment.apiUrl + '/recipes/' + recipeId);
    createRecipe = (request: DefaultPostRequest) =>
        this.http.post<Recipe>(environment.apiUrl + '/recipes/', request);
    updateRecipe = (recipeId: string, request: DefaultUpdateRequest) =>
        this.http.put<Recipe>(environment.apiUrl + '/recipes/' + recipeId, request);
    deleteRecipe = (recipeId: string) =>
        this.http.delete<Recipe>(environment.apiUrl + '/recipes/' + recipeId);
}
