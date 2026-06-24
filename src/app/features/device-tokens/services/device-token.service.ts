import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { DeviceToken } from "../core/device-token";

@Injectable({
  providedIn: "root",
})
export class DeviceTokenService {

  constructor(private http: HttpClient) {}

  getDeviceTokens = () =>
    this.http.get<DeviceToken[]>(environment.apiUrl + "/fcm-tokens");
}
