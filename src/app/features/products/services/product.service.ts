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

  getPublicProducts = () =>
    this.http.get<Product[]>(environment.apiUrl + "/products/public");

  getProduct = (productId: string) =>
    this.http.get<Product>(environment.apiUrl + "/products/" + productId);

  createProduct = (request: DefaultPostRequest) =>
    this.http.post<Product>(environment.apiUrl + "/products/", request);

  updateProduct = (productId: string, request: DefaultUpdateRequest) =>
    this.http.put<Product>(
      environment.apiUrl + "/products/" + productId,
      request,
    );

  changeProductActivity = (productId: string) =>
    this.http.get<Product>(
      environment.apiUrl + "/products/" + productId + "/activity",
    );


  getProductsSmall() {
    return Promise.resolve(this.getProductsData());
  }

  getProductsData() {
    return [
      {
        id: '1000',
        name: 'Bamboo Watch',
        description: 'Product Description',
        price: 65,
        status: true,
        image: 't_shirt_example_white.png',
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now())
      },
      {
        id: '1001',
        name: 'Black Watch',
        description: 'Product Description',
        price: 72,
        status: true,
        image: 't_shirt_example_black.png',
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now())
      }
    ]
  }
}
