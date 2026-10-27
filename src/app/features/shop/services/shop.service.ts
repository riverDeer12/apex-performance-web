import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { SaveShopProductRequest, ShopOrder, ShopOrderStatus, ShopProduct } from "../models/shop";

/**
 * Administration of the webshop (shop.apex-performance.fit): products
 * with variants, stock and pictures, and the orders.
 */
@Injectable({ providedIn: "root" })
export class ShopService {
    private readonly url = environment.apiUrl + "/shop/admin";

    constructor(private http: HttpClient) {}

    getProducts = () => this.http.get<ShopProduct[]>(this.url + "/products");

    createProduct = (request: SaveShopProductRequest) =>
        this.http.post<ShopProduct>(this.url + "/products", request);

    updateProduct = (id: string, request: SaveShopProductRequest) =>
        this.http.put<ShopProduct>(this.url + "/products/" + id, request);

    deleteProduct = (id: string) => this.http.delete(this.url + "/products/" + id);

    addImages = (id: string, files: File[]) => {
        const form = new FormData();
        files.forEach((file) => form.append("files", file, file.name));

        return this.http.post<ShopProduct>(this.url + "/products/" + id + "/images", form);
    };

    reorderImages = (id: string, imageIds: string[]) =>
        this.http.put<ShopProduct>(this.url + "/products/" + id + "/images", { imageIds });

    deleteImage = (id: string, imageId: string) =>
        this.http.delete<ShopProduct>(this.url + "/products/" + id + "/images/" + imageId);

    getOrders = () => this.http.get<ShopOrder[]>(this.url + "/orders");

    setOrderStatus = (id: string, status: ShopOrderStatus) =>
        this.http.put<ShopOrder>(this.url + "/orders/" + id + "/status", { status });

    // Public address of a picture, the shop loads it the same way.
    imageUrl = (imageId: string) => environment.apiUrl + "/shop/images/" + imageId;
}
