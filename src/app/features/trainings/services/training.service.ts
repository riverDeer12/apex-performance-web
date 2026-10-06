import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Training, TrainingRequest } from "../models/training";

@Injectable({
    providedIn: "root",
})
export class TrainingService {
    constructor(private http: HttpClient) {}

    getTrainings = () =>
        this.http.get<Training[]>(environment.apiUrl + "/trainings");

    createTraining = (request: TrainingRequest) =>
        this.http.post<Training>(environment.apiUrl + "/trainings", request);

    updateTraining = (trainingId: string, request: TrainingRequest) =>
        this.http.put<Training>(environment.apiUrl + "/trainings/" + trainingId, request);

    changeCompletion = (trainingId: string, isCompleted: boolean) =>
        this.http.put<{ id: string; isCompleted: boolean; completedAt: string | null }>(
            environment.apiUrl + "/trainings/" + trainingId + "/completion", { isCompleted });

    deleteTraining = (trainingId: string) =>
        this.http.delete(environment.apiUrl + "/trainings/" + trainingId);
}
