// Cart — stored entirely in localStorage; no server sync
const CART_KEY = 'rm_cart';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

function load(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function save(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function getCart(): CartItem[] {
  return load();
}

export function addToCart(item: Omit<CartItem, 'id'>): CartItem[] {
  const items = load();
  const key = item.productId + (item.variant ?? '');
  const existing = items.find(i => i.productId + (i.variant ?? '') === key);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push({ ...item, id: crypto.randomUUID() });
  }
  save(items);
  return items;
}

export function updateCartQty(id: string, quantity: number): CartItem[] {
  const items = load();
  const item = items.find(i => i.id === id);
  if (!item) return items;
  if (quantity <= 0) return removeFromCart(id);
  item.quantity = quantity;
  save(items);
  return items;
}

export function removeFromCart(id: string): CartItem[] {
  const items = load().filter(i => i.id !== id);
  save(items);
  return items;
}

export function clearCart(): CartItem[] {
  save([]);
  return [];
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
