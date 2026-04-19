import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Cart
      cart: [],
      cartOpen: false,

      addToCart: (product, selectedSize, selectedColor) => {
        const item = { ...product, selectedSize, selectedColor, quantity: 1 };
        const key = `${product.id}-${selectedSize}-${selectedColor}`;
        set((state) => {
          const existing = state.cart.find(i => `${i.id}-${i.selectedSize}-${i.selectedColor}` === key);
          if (existing) {
            return {
              cart: state.cart.map(i =>
                `${i.id}-${i.selectedSize}-${i.selectedColor}` === key
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              )
            };
          }
          return { cart: [...state.cart, item] };
        });
      },

      removeFromCart: (id, selectedSize, selectedColor) => {
        set((state) => ({
          cart: state.cart.filter(i => !(i.id === id && i.selectedSize === selectedSize && i.selectedColor === selectedColor))
        }));
      },

      updateQuantity: (id, selectedSize, selectedColor, qty) => {
        if (qty < 1) { get().removeFromCart(id, selectedSize, selectedColor); return; }
        set((state) => ({
          cart: state.cart.map(i =>
            i.id === id && i.selectedSize === selectedSize && i.selectedColor === selectedColor
              ? { ...i, quantity: qty }
              : i
          )
        }));
      },

      clearCart: () => set({ cart: [] }),

      setCartOpen: (open) => set({ cartOpen: open }),

      get cartCount() { return get().cart.reduce((sum, i) => sum + i.quantity, 0); },
      get cartTotal() { return get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0); },

      // Wishlist
      wishlist: [],
      toggleWishlist: (product) => {
        set((state) => {
          const exists = state.wishlist.find(p => p.id === product.id);
          return { wishlist: exists ? state.wishlist.filter(p => p.id !== product.id) : [...state.wishlist, product] };
        });
      },
      isWishlisted: (id) => get().wishlist.some(p => p.id === id),

      // User / Auth
      user: null,
      orders: [],

      login: (userData) => {
        const orders = [
          { id: 'ORD-2847', date: '2026-04-10', status: 'Delivered', total: 449.98, items: 2, tracking: 'TRK123456' },
          { id: 'ORD-2831', date: '2026-04-02', status: 'Processing', total: 159.99, items: 1, tracking: 'TRK123457' },
          { id: 'ORD-2812', date: '2026-03-25', status: 'Delivered', total: 739.97, items: 3, tracking: 'TRK123458' },
        ];
        set({ user: { ...userData, avatar: userData.email[0].toUpperCase() }, orders });
      },

      logout: () => set({ user: null, orders: [], cart: [], wishlist: [] }),

      // Toast
      toast: null,
      showToast: (message, type = 'success') => {
        set({ toast: { message, type, id: Date.now() } });
        setTimeout(() => set({ toast: null }), 3000);
      },

      // Filters
      filters: { search: '', category: 'all', minPrice: 0, maxPrice: 500, sortBy: 'featured', tags: [] },
      setFilters: (updates) => set((state) => ({ filters: { ...state.filters, ...updates } })),
      resetFilters: () => set({ filters: { search: '', category: 'all', minPrice: 0, maxPrice: 500, sortBy: 'featured', tags: [] } }),
    }),
    {
      name: 'luxe-store',
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist, user: state.user, orders: state.orders }),
    }
  )
);

export default useStore;
