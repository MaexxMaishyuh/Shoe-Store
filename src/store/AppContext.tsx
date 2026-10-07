import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COUPON_RATE } from '../theme';
import type { CartItem, Order, OrderItem, Product, Settings } from '../types';
import { orderId } from '../utils/format';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { initDatabase, loadProducts, loadValue } from '../services/db';
import { useCatalogState, useSavedValueState } from '../services/useDatabaseState';
import { DatabaseStatus } from '../components/DatabaseStatus';

const K = {
  products: 'shoestore:products:v1',
  cart: 'shoestore:cart:v1',
  favorites: 'shoestore:favorites:v1',
  orders: 'shoestore:orders:v1',
  settings: 'shoestore:settings:v1',
};

export const DEFAULT_SETTINGS: Settings = {
  userName: 'Alex',
  deliveryFee: 150,
  currency: '\u20B1',
  notifications: true,
};

async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function totalStock(p: Product): number {
  return p.sizes.reduce((s, z) => s + (p.stockBySize[z] ?? 0), 0);
}

export function isPurchasable(p: Product): boolean {
  return p.available && totalStock(p) > 0;
}

export function sizeAvailable(p: Product, size: string): boolean {
  return p.available && (p.stockBySize[size] ?? 0) > 0;
}

interface CheckoutInput {
  coupon?: string;
}

interface AppState {
  ready: boolean;
  products: Product[];
  cart: CartItem[];
  favorites: string[];
  orders: Order[];
  settings: Settings;
  cartCount: number;
  productById: (id: string) => Product | undefined;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  adjustSizeStock: (productId: string, size: string, delta: number) => void;
  setSizeStock: (productId: string, size: string, value: number) => void;
  setAvailable: (productId: string, available: boolean) => void;
  addToCart: (item: CartItem) => { ok: boolean; message: string };
  updateQty: (productId: string, size: string, colorName: string, delta: number) => void;
  removeFromCart: (productId: string, size: string, colorName: string) => void;
  clearCart: () => void;
  checkout: (input?: CheckoutInput) => { ok: boolean; message: string; order?: Order };
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetDemoData: () => void;
}

const Ctx = createContext<AppState | null>(null);

function withAutoAvailability(p: Product): Product {
  if (totalStock(p) <= 0 && p.available) return { ...p, available: false };
  return p;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [products, setProducts, hydrateProducts] = useCatalogState<Product>();
  const [cart, setCart, hydrateCart] = useSavedValueState<CartItem[]>('cart', []);
  const [favorites, setFavorites, hydrateFavorites] = useSavedValueState<string[]>('favorites', []);
  const [orders, setOrders, hydrateOrders] = useSavedValueState<Order[]>('orders', []);
  const [settings, setSettings, hydrateSettings] = useSavedValueState<Settings>('settings', DEFAULT_SETTINGS);
  const [startupError, setStartupError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setStartupError('');
    (async () => {
      try {
      const [p, c, f, o, s] = await Promise.all([
        load<Product[]>(K.products, INITIAL_PRODUCTS.slice(0, 6)),
        load<CartItem[]>(K.cart, []),
        load<string[]>(K.favorites, []),
        load<Order[]>(K.orders, []),
        load<Settings>(K.settings, DEFAULT_SETTINGS),
      ]);
      await initDatabase(Array.isArray(p) ? p.map(withAutoAvailability) : INITIAL_PRODUCTS.slice(0, 6), {
        cart: c, favorites: f, orders: o, settings: { ...DEFAULT_SETTINGS, ...s },
      });
      if (!active) return;
      hydrateProducts(loadProducts<Product>());
      hydrateCart(loadValue('cart', []));
      hydrateFavorites(loadValue('favorites', []));
      hydrateOrders(loadValue('orders', []));
      hydrateSettings(loadValue('settings', DEFAULT_SETTINGS));
      setReady(true);
      } catch (error) {
        if (active) setStartupError(error instanceof Error ? error.message : 'Please restart the app and try again.');
      }
    })();
    return () => { active = false; };
  }, [hydrateProducts, hydrateCart, hydrateFavorites, hydrateOrders, hydrateSettings, attempt]);

  const productById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  );

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  }, [setFavorites]);

  const addProduct = useCallback((p: Product) => {
    setProducts((list) => [withAutoAvailability(p), ...list]);
  }, [setProducts]);

  const updateProduct = useCallback((p: Product) => {
    setProducts((list) => list.map((x) => (x.id === p.id ? withAutoAvailability(p) : x)));
  }, [setProducts]);

  const deleteProduct = useCallback((id: string) => {
    setProducts((list) => list.filter((p) => p.id !== id));
    setFavorites((f) => f.filter((x) => x !== id));
    setCart((c) => c.filter((i) => i.productId !== id));
  }, [setCart, setFavorites, setProducts]);

  const adjustSizeStock = useCallback((productId: string, size: string, delta: number) => {
    setProducts((list) =>
      list.map((p) => {
        if (p.id !== productId) return p;
        const next = Math.max(0, Math.floor((p.stockBySize[size] ?? 0) + delta));
        return withAutoAvailability({
          ...p,
          stockBySize: { ...p.stockBySize, [size]: next },
        });
      }),
    );
  }, [setProducts]);

  const setSizeStock = useCallback((productId: string, size: string, value: number) => {
    setProducts((list) =>
      list.map((p) => {
        if (p.id !== productId) return p;
        const next = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
        return withAutoAvailability({
          ...p,
          stockBySize: { ...p.stockBySize, [size]: next },
        });
      }),
    );
  }, [setProducts]);

  const setAvailable = useCallback((productId: string, available: boolean) => {
    setProducts((list) =>
      list.map((p) => {
        if (p.id !== productId) return p;
        if (!available) return { ...p, available: false };
        // Re-enabling requires at least 1 unit of stock.
        if (totalStock(p) <= 0) return p;
        return { ...p, available: true };
      }),
    );
  }, [setProducts]);

  const addToCart = useCallback(
    (item: CartItem) => {
      const p = products.find((x) => x.id === item.productId);
      if (!p) return { ok: false, message: 'Product no longer exists.' };
      if (!isPurchasable(p)) return { ok: false, message: 'This product is out of stock.' };
      if (!sizeAvailable(p, item.size))
        return { ok: false, message: `Size ${item.size} is out of stock.` };
      const inCart =
        cart.find(
          (c) =>
            c.productId === item.productId &&
            c.size === item.size &&
            c.colorName === item.colorName,
        )?.qty ?? 0;
      if (inCart + item.qty > (p.stockBySize[item.size] ?? 0))
        return { ok: false, message: 'Not enough stock for this size.' };
      setCart((c) => {
        const idx = c.findIndex(
          (x) =>
            x.productId === item.productId &&
            x.size === item.size &&
            x.colorName === item.colorName,
        );
        if (idx >= 0) {
          const next = [...c];
          next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
          return next;
        }
        return [...c, item];
      });
      return { ok: true, message: 'Added to cart.' };
    },
    [products, cart, setCart],
  );

  const updateQty = useCallback(
    (productId: string, size: string, colorName: string, delta: number) => {
      const p = products.find((x) => x.id === productId);
      const cap = p ? p.stockBySize[size] ?? 0 : Number.MAX_SAFE_INTEGER;
      setCart((c) =>
        c
          .map((i) => {
            if (i.productId !== productId || i.size !== size || i.colorName !== colorName)
              return i;
            const qty = Math.min(Math.max(1, i.qty + delta), Math.max(1, cap));
            return { ...i, qty };
          })
          .filter((i) => i.qty >= 1),
      );
    },
    [products, setCart],
  );

  const removeFromCart = useCallback((productId: string, size: string, colorName: string) => {
    setCart((c) =>
      c.filter((i) => !(i.productId === productId && i.size === size && i.colorName === colorName)),
    );
  }, [setCart]);

  const clearCart = useCallback(() => setCart([]), [setCart]);

  const checkout = useCallback(
    (input?: CheckoutInput) => {
      if (cart.length === 0) return { ok: false, message: 'Your bag is empty.' };
      // Validate stock for every line.
      for (const line of cart) {
        const p = products.find((x) => x.id === line.productId);
        if (!p) return { ok: false, message: 'A product in your bag no longer exists.' };
        if (!isPurchasable(p))
          return { ok: false, message: `${p.name} is out of stock.` };
        if ((p.stockBySize[line.size] ?? 0) < line.qty)
          return {
            ok: false,
            message: `Not enough stock for ${p.name} (size ${line.size}).`,
          };
      }
      const items: OrderItem[] = cart.map((line) => {
        const p = products.find((x) => x.id === line.productId)!;
        return {
          productId: p.id,
          brand: p.brand,
          name: p.name,
          image: p.image,
          size: line.size,
          colorName: line.colorName,
          price: p.price,
          qty: line.qty,
        };
      });
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const deliveryFee = settings.deliveryFee;
      const discount =
        input?.coupon === 'DISCOUNT20' ? Math.round(subtotal * COUPON_RATE) : 0;
      const total = subtotal + deliveryFee - discount;
      const order: Order = {
        id: orderId(),
        date: new Date().toISOString(),
        items,
        subtotal,
        deliveryFee,
        discount,
        total,
        coupon: input?.coupon,
        status: 'Pending',
      };
      // Decrease stock for the exact selected sizes.
      setProducts((list) =>
        list.map((p) => {
          const lines = cart.filter((c) => c.productId === p.id);
          if (lines.length === 0) return p;
          const stockBySize = { ...p.stockBySize };
          for (const l of lines) {
            stockBySize[l.size] = Math.max(0, (stockBySize[l.size] ?? 0) - l.qty);
          }
          return withAutoAvailability({ ...p, stockBySize });
        }),
      );
      setOrders((o) => [order, ...o]);
      setCart([]);
      return { ok: true, message: 'Order placed.', order };
    },
    [cart, products, setCart, setOrders, setProducts, settings.deliveryFee],
  );

  const updateOrderStatus = useCallback((id: string, status: Order['status']) => {
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
  }, [setOrders]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, [setSettings]);

  const resetDemoData = useCallback(() => {
    setProducts(INITIAL_PRODUCTS.slice(0, 6));
    setCart([]);
    setFavorites([]);
    setOrders([]);
    setSettings(DEFAULT_SETTINGS);
  }, [setCart, setFavorites, setOrders, setProducts, setSettings]);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  const value: AppState = {
    ready,
    products,
    cart,
    favorites,
    orders,
    settings,
    cartCount,
    productById,
    isFavorite,
    toggleFavorite,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustSizeStock,
    setSizeStock,
    setAvailable,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    checkout,
    updateOrderStatus,
    updateSettings,
    resetDemoData,
  };

  if (!ready) return <DatabaseStatus error={startupError} onRetry={() => setAttempt((a) => a + 1)} />;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
