import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { MonthlyReview, MonthlyReviewRequest } from "../models/monthly-review";

@Injectable({
    providedIn: "root",
})
export class MonthlyReviewService {
    constructor(private http: HttpClient) {}

    /**
     * Clients get their own reviews, staff
     * must pass id of the client.
     */
    getMonthlyReviews = (clientId?: string) =>
        this.http.get<MonthlyReview[]>(environment.apiUrl + "/monthly-reviews",
            clientId ? { params: { clientId } } : {});

    saveMonthlyReview = (request: MonthlyReviewRequest) =>
        this.http.put<MonthlyReview>(environment.apiUrl + "/monthly-reviews", request);

    deleteMonthlyReview = (monthlyReviewId: string) =>
        this.http.delete(environment.apiUrl + "/monthly-reviews/" + monthlyReviewId);
}
