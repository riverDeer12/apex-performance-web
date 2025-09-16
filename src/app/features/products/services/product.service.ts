import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DefaultPostRequest } from '../../../shared/models/default-post-request';
import { DefaultUpdateRequest } from '../../../shared/models/default-update-request';
import { Product } from "../models/product";

@Injectable({
  providedIn: "root",
})
export class ProductService {

  constructor(private http: HttpClient) {}

  getProducts = () =>
    this.http.get<Product[]>(environment.apiUrl + "/products");

  getProduct = (productId: string) =>
    this.http.get<Product>(environment.apiUrl + "/products/" + productId);

  createProduct = (request: DefaultPostRequest) =>
    this.http.post<Product>(environment.apiUrl + "/products/", request);

  updateProduct = (productId: string, request: DefaultUpdateRequest) =>
    this.http.put<Product>(
      environment.apiUrl + "/products/" + productId,
      request,
    );

  changeProductActivity= (productId: string) =>
      this.http.get<Product>(environment.apiUrl + "/products/" + productId + '/activity');
}
