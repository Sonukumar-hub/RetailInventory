import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Category, Product, Location, InventoryItem, InventoryMovement,
  Supplier, PurchaseOrder, SalesOrder, DashboardKpi, User, Page
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboardKpis(): Observable<DashboardKpi> {
    return this.http.get<DashboardKpi>(`${this.base}/dashboard/kpis`);
  }

  // Categories
  getCategories(page = 0, size = 100): Observable<Page<Category>> {
    return this.http.get<Page<Category>>(`${this.base}/categories?page=${page}&size=${size}`);
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.base}/categories`, category);
  }

  // Products
  getProducts(search = '', categoryId?: number, page = 0, size = 20): Observable<Page<Product>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    if (categoryId) params = params.set('categoryId', categoryId);
    return this.http.get<Page<Product>>(`${this.base}/products`, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/products/${id}`);
  }

  getProductBySkuOrBarcode(value: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/products/search/barcode?value=${encodeURIComponent(value)}`);
  }

  getLowStockProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/products/low-stock`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.base}/products`, product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.base}/products/${id}`, product);
  }

  deactivateProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/products/${id}`);
  }

  // Locations
  getLocations(page = 0, size = 50): Observable<Page<Location>> {
    return this.http.get<Page<Location>>(`${this.base}/locations?page=${page}&size=${size}`);
  }

  getAllLocationsList(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.base}/locations/all`);
  }

  createLocation(location: Partial<Location>): Observable<Location> {
    return this.http.post<Location>(`${this.base}/locations`, location);
  }

  // Inventory
  getInventoryByLocation(locationId: number, page = 0, size = 20): Observable<Page<InventoryItem>> {
    return this.http.get<Page<InventoryItem>>(`${this.base}/inventory/location/${locationId}?page=${page}&size=${size}`);
  }

  getInventoryForProduct(productId: number): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.base}/inventory/product/${productId}`);
  }

  receiveStock(req: { productId: number; locationId: number; quantity: number; reason: string }): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.base}/inventory/receive`, req);
  }

  adjustStock(req: { productId: number; locationId: number; quantity: number; reason: string }): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.base}/inventory/adjust`, req);
  }

  transferStock(req: { productId: number; sourceLocationId: number; destinationLocationId: number; quantity: number; reason?: string }): Observable<void> {
    return this.http.post<void>(`${this.base}/inventory/transfer`, req);
  }

  getMovements(productId?: number, locationId?: number, page = 0, size = 20): Observable<Page<InventoryMovement>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (productId) params = params.set('productId', productId);
    if (locationId) params = params.set('locationId', locationId);
    return this.http.get<Page<InventoryMovement>>(`${this.base}/inventory/movements`, { params });
  }

  // Suppliers
  getSuppliers(search = '', page = 0, size = 20): Observable<Page<Supplier>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<Page<Supplier>>(`${this.base}/suppliers`, { params });
  }

  createSupplier(supplier: Partial<Supplier>): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.base}/suppliers`, supplier);
  }

  updateSupplier(id: number, supplier: Partial<Supplier>): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.base}/suppliers/${id}`, supplier);
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/suppliers/${id}`);
  }

  // Purchase Orders
  getPurchaseOrders(status = '', page = 0, size = 20): Observable<Page<PurchaseOrder>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<Page<PurchaseOrder>>(`${this.base}/purchase-orders`, { params });
  }

  getPurchaseOrderById(id: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.base}/purchase-orders/${id}`);
  }

  createPurchaseOrder(po: any): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.base}/purchase-orders`, po);
  }

  updatePurchaseOrderStatus(id: number, status: string): Observable<PurchaseOrder> {
    return this.http.patch<PurchaseOrder>(`${this.base}/purchase-orders/${id}/status?status=${status}`, {});
  }

  receivePurchaseOrderItems(id: number, payload: { items: { itemId: number; quantityReceived: number }[] }): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.base}/purchase-orders/${id}/receive`, payload);
  }

  // Sales Orders
  getSalesOrders(status = '', page = 0, size = 20): Observable<Page<SalesOrder>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<Page<SalesOrder>>(`${this.base}/sales-orders`, { params });
  }

  getSalesOrderById(id: number): Observable<SalesOrder> {
    return this.http.get<SalesOrder>(`${this.base}/sales-orders/${id}`);
  }

  createSalesOrder(so: any): Observable<SalesOrder> {
    return this.http.post<SalesOrder>(`${this.base}/sales-orders`, so);
  }

  updateSalesOrderStatus(id: number, status: string): Observable<SalesOrder> {
    return this.http.patch<SalesOrder>(`${this.base}/sales-orders/${id}/status?status=${status}`, {});
  }

  // Users
  getUsers(page = 0, size = 20): Observable<Page<User>> {
    return this.http.get<Page<User>>(`${this.base}/users?page=${page}&size=${size}`);
  }

  createUser(user: any): Observable<User> {
    return this.http.post<User>(`${this.base}/users`, user);
  }

  toggleUserActive(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/users/${id}/toggle-active`, {});
  }
}
