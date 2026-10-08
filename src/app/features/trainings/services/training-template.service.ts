import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { TrainingTemplate, TrainingTemplateRequest } from "../models/training-template";

@Injectable({
    providedIn: "root",
})
export class TrainingTemplateService {
    constructor(private http: HttpClient) {}

    getTemplates = () =>
        this.http.get<TrainingTemplate[]>(environment.apiUrl + "/training-templates");

    createTemplate = (request: TrainingTemplateRequest) =>
        this.http.post<TrainingTemplate>(environment.apiUrl + "/training-templates", request);

    updateTemplate = (templateId: string, request: TrainingTemplateRequest) =>
        this.http.put<TrainingTemplate>(environment.apiUrl + "/training-templates/" + templateId, request);

    deleteTemplate = (templateId: string) =>
        this.http.delete(environment.apiUrl + "/training-templates/" + templateId);

    assignTemplate = (templateId: string, clients: string[], date: string) =>
        this.http.post<{ trainingIds: string[] }>(
            environment.apiUrl + "/training-templates/" + templateId + "/assign", { clients, date });
}
