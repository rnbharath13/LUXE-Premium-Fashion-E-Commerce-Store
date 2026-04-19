import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import useStore from '../store/useStore';

export default function ProductCard({ product, listView = false }) {
  const { toggleWishlist, isWishlisted, addToCart, setCartOpen, showToast } = useStore();
  const wishlisted = isWishlisted(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    addToCart(product, product.sizes[0], product.colors[0]);
    showToast(product.name + ' added to cart!');
    setCartOpen(true);
  };
  const handleWish = (e) => {
    e.preventDefault(); e.stopPropagation();
    toggleWishlist(product);
    showToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', 'info');
  };

  const tagStyle = (tag) => {
    if (tag === 'Sale') return 'badge-sale';
    if (tag === 'New Arrival') return 'badge-new';
    return 'badge';
  };

  if (listView) {
    return (
      <Link
        to={'/product/' + product.id}
        className="group flex gap-4 p-3 transition-all hover:bg-gray-50"
        style={{ border: '1px solid var(--border)', background: '#fff' }}
      >
        <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 100, height: 120 }}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.target.onerror = null; e.target.src = `https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80`; }}
          />
          {discount && (
            <span className="absolute top-1.5 left-1.5 text-xs font-bold px-1 py-0.5" style={{ background: 'var(--accent-red)', color: '#fff', fontSize: 10 }}>
              -{discount}%
            </span>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>{product.brand}</p>
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
            <div className="flex items-center gap-1 mb-2">
              <Star size={11} fill="#c9a96e" stroke="none" />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{product.rating}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>${product.price}</span>
              {product.originalPrice && (
                <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>${product.originalPrice}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleWish}
                className="w-7 h-7 flex items-center justify-center transition-all"
                style={{ border: '1px solid var(--border)' }}
              >
                <Heart size={13} fill={wishlisted ? '#c41e3a' : 'none'} stroke={wishlisted ? '#c41e3a' : '#1c1c1c'} />
              </button>
              {product.inStock && (
                <button
                  onClick={handleAdd}
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1"
                  style={{ background: '#1c1c1c', color: '#fff' }}
                >
                  <ShoppingBag size={11} /> Add
                </button>
              )}
              {!product.inStock && (
                <span className="text-xs px-3 py-1.5" style={{ color: '#9a9a9a', border: '1px solid var(--border)' }}>Out of Stock</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={'/product/' + product.id} className="group block">
      {/* Image */}
      <div className="product-img-wrap" style={{ aspectRatio: '3/4' }}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={{ display: 'block' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=90`;
          }}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.tags.slice(0, 1).map((tag) => (
            <span key={tag} className={tagStyle(tag)}>{tag}</span>
          ))}
        </div>
        {discount && (
          <span
            className="absolute top-3 right-10 text-xs font-bold px-1.5 py-0.5"
            style={{ background: 'var(--accent-red)', color: '#fff' }}
          >
            -{discount}%
          </span>
        )}
        {/* Wishlist */}
        <button
          onClick={handleWish}
          className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.9)' }}
        >
          <Heart
            size={15}
            fill={wishlisted ? '#c41e3a' : 'none'}
            stroke={wishlisted ? '#c41e3a' : '#1c1c1c'}
          />
        </button>
        {/* Quick add — slides up on hover */}
        {product.inStock && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAdd}
              className="w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 uppercase tracking-widest"
              style={{ background: '#1c1c1c', color: '#fff', letterSpacing: '0.08em' }}
            >
              <ShoppingBag size={14} /> Quick Add
            </button>
          </div>
        )}
        {!product.inStock && (
          <div className="absolute bottom-0 left-0 right-0">
            <div
              className="w-full py-2 text-xs font-semibold text-center uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.85)', color: '#9a9a9a' }}
            >
              Out of Stock
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-3 pb-1">
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
          {product.brand}
        </p>
        <h3 className="text-sm font-medium mb-1.5 truncate" style={{ color: 'var(--text-primary)' }}>
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                ${product.originalPrice}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star size={11} fill="#c9a96e" stroke="none" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{product.rating}</span>
          </div>
        </div>
        {product.colors?.length > 1 && (
          <div className="flex items-center gap-1.5 mt-2">
            {product.colors.map((c, i) => (
              <div
                key={i}
                className="w-3.5 h-3.5 rounded-full border"
                style={{ background: c, borderColor: 'var(--border)' }}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
