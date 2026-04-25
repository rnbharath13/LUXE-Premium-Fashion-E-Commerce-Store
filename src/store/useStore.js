import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAccessToken, clearAccessToken } from '../lib/api';

const useStore = create(
  persist(
    (set, get) => ({

      // ── Cart ──────────────────────────────────────────────────────
      cart: [],
      cartOpen: false,

      addToCart: (product, selectedSize, selectedColor) => {
        const key = `${product.id}-${selectedSize}-${selectedColor}`;
        set((state) => {
          const existing = state.cart.find(
            i => `${i.id}-${i.selectedSize}-${i.selectedColor}` === key
          );
          if (existing) {
            return {
              cart: state.cart.map(i =>
                `${i.id}-${i.selectedSize}-${i.selectedColor}` === key
                  ? { ...i, quantity: i.quantity + (product.quantity || 1) }
                  : i
              ),
            };
          }
          return { cart: [...state.cart, { ...product, selectedSize, selectedColor, quantity: product.quantity || 1 }] };
        });
      },

      removeFromCart: (id, selectedSize, selectedColor) => {
        set((state) => ({
          cart: state.cart.filter(
            i => !(i.id === id && i.selectedSize === selectedSize && i.selectedColor === selectedColor)
          ),
        }));
      },

      updateQuantity: (id, selectedSize, selectedColor, qty) => {
        if (qty < 1) { get().removeFromCart(id, selectedSize, selectedColor); return; }
        set((state) => ({
          cart: state.cart.map(i =>
            i.id === id && i.selectedSize === selectedSize && i.selectedColor === selectedColor
              ? { ...i, quantity: qty }
              : i
          ),
        }));
      },

      clearCart:   () => set({ cart: [] }),
      setCartOpen: (open) => set({ cartOpen: open }),

      get cartCount() { return get().cart.reduce((sum, i) => sum + i.quantity, 0); },
      get cartTotal() { return get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0); },

      // ── Wishlist ──────────────────────────────────────────────────
      wishlist: [],

      toggleWishlist: async (product) => {
        const { wishlist, user, showToast } = get();
        const exists = wishlist.find(p => p.id === product.id);

        set({ wishlist: exists ? wishlist.filter(p => p.id !== product.id) : [...wishlist, product] });

        if (user) {
          try {
            exists ? await api.delete(`/wishlist/${product.id}`) : await api.post('/wishlist', { productId: product.id });
          } catch {
            set({ wishlist });
            showToast('Wishlist update failed', 'error');
          }
        }
      },

      isWishlisted: (id) => get().wishlist.some(p => p.id === id),

      // ── Auth ──────────────────────────────────────────────────────
      user: null,

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

      logout: () => {
        clearAccessToken();
        set({ user: null, cart: [], wishlist: [] });
        // Fire-and-forget — clears the httpOnly refresh cookie server-side
        api.post('/auth/logout').catch(() => {});
      },

      // ── Orders ────────────────────────────────────────────────────
      orders: [],

      fetchOrders: async () => {
        try {
          const data = await api.get('/orders');
          set({ orders: data });
        } catch {
          set({ orders: [] });
        }
      },

      placeOrder: async (payload) => {
        const data = await api.post('/orders', payload);
        get().clearCart();
        return data;
      },

      // ── Toast ─────────────────────────────────────────────────────
      toast: null,
      showToast: (message, type = 'success') => {
        set({ toast: { message, type, id: Date.now() } });
        setTimeout(() => set({ toast: null }), 3000);
      },

      // ── Filters ───────────────────────────────────────────────────
      filters: { search: '', category: 'all', minPrice: 0, maxPrice: 500, sortBy: 'featured', tags: [] },
      setFilters:   (updates) => set((state) => ({ filters: { ...state.filters, ...updates } })),
      resetFilters: () => set({ filters: { search: '', category: 'all', minPrice: 0, maxPrice: 500, sortBy: 'featured', tags: [] } }),
    }),
    {
      name: 'luxe-store',
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist, user: state.user }),
    }
  )
);

export default useStore;
