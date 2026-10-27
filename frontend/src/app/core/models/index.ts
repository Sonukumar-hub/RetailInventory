export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  active: boolean;
  roles: string[];
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  username: string;
  email: string;
  roles: string[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  barcode?: string;
  unitOfMeasure: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: number;
  name: string;
  type: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  active: boolean;
  createdAt: string;
}

export interface InventoryItem {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  locationId: number;
  locationName: string;
  quantityOnHand: number;
  quantityReserved: number;
  availableQuantity: number;
}

export interface InventoryMovement {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  locationId: number;
  locationName: string;
  movementType: string;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceId?: number;
  referenceType?: string;
  reason?: string;
  createdBy?: string;
  createdAt: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  active: boolean;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplierId: number;
  supplierName: string;
  locationId: number;
  locationName: string;
  status: string;
  orderDate: string;
  expectedDate?: string;
  totalAmount: number;
  notes?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrderItem {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SalesOrder {
  id: number;
  orderNumber: string;
  locationId: number;
  locationName: string;
  customerName?: string;
  customerEmail?: string;
  status: string;
  orderDate: string;
  totalAmount: number;
  notes?: string;
  items: SalesOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardKpi {
  totalActiveProducts: number;
  totalLocations: number;
  totalInventoryUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalSuppliers: number;
  pendingPurchaseOrders: number;
  totalSalesOrders: number;
  totalRevenue: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
