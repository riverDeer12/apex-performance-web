import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { DefaultPostRequest } from "../../../../shared/models/default-post-request";
import { DefaultUpdateRequest } from "../../../../shared/models/default-update-request";
import { FunctionalMovementScreen } from "../models/functional-movement-screen";

@Injectable({
  providedIn: "root",
})
export class FunctionalMovementScreenService {
  constructor(private http: HttpClient) {}

  getFunctionalMovementScreens = () =>
    this.http.get<FunctionalMovementScreen[]>(
      environment.apiUrl + "/functional-movement-screens",
    );

  createFunctionalMovementScreen = (request: DefaultPostRequest) =>
    this.http.post<FunctionalMovementScreen>(
      environment.apiUrl + "/functional-movement-screens/",
      request,
    );

  updateFunctionalMovementScreen = (
    functionalMovementScreenId: string,
    request: DefaultUpdateRequest,
  ) =>
    this.http.put<FunctionalMovementScreen>(
      environment.apiUrl +
        "/functional-movement-screens/" +
        functionalMovementScreenId,
      request,
    );

  deleteFunctionalMovementScreen = (functionalMovementScreenId: string) =>
    this.http.delete<FunctionalMovementScreen>(
      environment.apiUrl +
        "/functional-movement-screens/" +
        functionalMovementScreenId,
    );
}
