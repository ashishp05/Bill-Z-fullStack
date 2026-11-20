export interface AddProductPayload {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  unlimitedStock: boolean;
  images?: string[];
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  unlimitedStock?: boolean;
  images?: string[];
}
