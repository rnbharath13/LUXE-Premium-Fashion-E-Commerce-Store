import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAccessToken, clearAccessToken } from '../lib/api';

const useStore = create(
  persist(
    (set, get) => ({
      cart: [],
      cartOpen: false,

      addToCart: (product, selectedSize, selectedColor) => {
        const key = `${product.id}-${selectedSize}-${selectedColor}`;
        set((state) => {
          const existing = state.cart.find(
            (item) => `${item.id}-${item.selectedSize}-${item.selectedColor}` === key
          );
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                `${item.id}-${item.selectedSize}-${item.selectedColor}` === key
                  ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, selectedSize, selectedColor, quantity: product.quantity || 1 }] };
        });
      },

      removeFromCart: (id, selectedSize, selectedColor) => {
        set((state) => ({
          cart: state.cart.filter(
            (item) => !(item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor)
          ),
        }));
      },

      updateQuantity: (id, selectedSize, selectedColor, qty) => {
        if (qty < 1) {
          get().removeFromCart(id, selectedSize, selectedColor);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
              ? { ...item, quantity: qty }
              : item
          ),
        }));
      },

      clearCart: () => set({ cart: [] }),
      setCartOpen: (open) => set({ cartOpen: open }),

      get cartCount() { return get().cart.reduce((sum, item) => sum + item.quantity, 0); },
      get cartTotal() { return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0); },

      wishlist: [],

      toggleWishlist: async (product) => {
        const { wishlist, user, showToast } = get();
        const exists = wishlist.find((p) => p.id === product.id);

        set({ wishlist: exists ? wishlist.filter((p) => p.id !== product.id) : [...wishlist, product] });

        if (user) {
          try {
            exists ? await api.delete(`/wishlist/${product.id}`) : await api.post('/wishlist', { productId: product.id });
          } catch {
            set({ wishlist });
            showToast('Wishlist update failed', 'error');
          }
        }
      },

      isWishlisted: (id) => get().wishlist.some((p) => p.id === id),

      user: null,

      setUser: (user) => set({ user }),

      login: async (email, password) => {
        const data = await api.post('/auth/login', { email, password });
        setAccessToken(data.token);
        set({ user: data.user });
        return data;
      },

      register: async (email, password, firstName, lastName) => {
        const data = await api.post('/auth/register', { email, password, firstName, lastName });
        setAccessToken(data.token);
        set({ user: data.user });
        return data;
      },

      updateProfile: async (fields) => {
        const data = await api.put('/auth/profile', fields);
        set((state) => ({ user: { ...state.user, ...data } }));
        return data;
      },

      logout: async () => {
        clearAccessToken();
        set({ user: null, cart: [], wishlist: [], orders: [] });
        try { await api.post('/auth/logout'); } catch {}
      },

      clearSession: () => {
        clearAccessToken();
        set({ user: null, orders: [] });
      },

      orders: [],

      fetchOrders: async () => {
        const data = await api.get('/orders');
        set({ orders: data || [] });
        return data;
      },

      fetchOrder: (id) => api.get(`/orders/${id}`),

      placeOrder: async (payload, idempotencyKey) => {
        const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined;
        const data = await api.post('/orders', payload, { headers });
        get().clearCart();
        return data;
      },

      fetchSessions: () => api.get('/auth/sessions'),
      revokeSession: (id) => api.delete(`/auth/sessions/${id}`),
      logoutAllOther: async () => {
        const sessions = await api.get('/auth/sessions');
        await Promise.all(
          (sessions || [])
            .filter((session) => !session.current)
            .map((session) => api.delete(`/auth/sessions/${session.id}`).catch(() => {}))
        );
      },

      requestReturn: (id, reason) => api.post(`/orders/${id}/return`, { reason }),

      cancelOrder: async (id) => {
        const updated = await api.patch(`/orders/${id}/cancel`);
        set((state) => ({
          orders: state.orders.map((order) => (order.id === id ? { ...order, status: updated.status } : order)),
        }));
        return updated;
      },

      toast: null,
      showToast: (message, type = 'success') => {
        set({ toast: { message, type, id: Date.now() } });
        setTimeout(() => set({ toast: null }), 3000);
      },
    }),
    {
      name: 'luxe-store',
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist, user: state.user }),
    }
  )
);

export default useStore;
