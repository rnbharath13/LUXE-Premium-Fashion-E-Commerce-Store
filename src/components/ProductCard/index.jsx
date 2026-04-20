import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import useStore from '../../store/useStore';
import './ProductCard.css';

export default function ProductCard({ product, listView = false }) {
  const { toggleWishlist, isWishlisted, addToCart, setCartOpen, showToast } = useStore();
  const wishlisted = isWishlisted(product.id);
  const discount   = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[0], product.colors[0]);
    showToast(product.name + ' added to cart!');
    setCartOpen(true);
  };

  const handleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    showToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', 'info');
  };

  const tagStyle = (tag) => {
    if (tag === 'Sale')        return 'badge-sale';
    if (tag === 'New Arrival') return 'badge-new';
    return 'badge';
  };

  /* ── List view ──────────────────────────────────── */
  if (listView) {
    return (
      <Link to={'/product/' + product.id} className="product-card-list">
        <div className="product-card-list-img">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80'; }}
          />
          {discount && <span className="product-card-list-discount">-{discount}%</span>}
        </div>

        <div className="product-card-list-body">
          <div className="product-card-list-top">
            <p className="product-card-brand">{product.brand}</p>
            <p className="product-card-name">{product.name}</p>
            <div className="product-card-list-rating">
              <Star size={11} fill="#c9a96e" stroke="none" />
              <span>{product.rating}</span>
            </div>
          </div>

          <div className="product-card-list-bottom">
            <div className="product-card-list-price-group">
              <span className="product-card-price">${product.price}</span>
              {product.originalPrice && (
                <span className="product-card-original-price">${product.originalPrice}</span>
              )}
            </div>
            <div className="product-card-list-actions">
              <button className="product-card-list-wish-btn" onClick={handleWish}>
                <Heart size={13} fill={wishlisted ? '#c41e3a' : 'none'} stroke={wishlisted ? '#c41e3a' : '#1c1c1c'} />
              </button>
              {product.inStock
                ? <button className="product-card-list-add-btn" onClick={handleAdd}><ShoppingBag size={11} /> Add</button>
                : <span className="product-card-list-oos">Out of Stock</span>}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  /* ── Grid view ──────────────────────────────────── */
  return (
    <Link to={'/product/' + product.id} className="product-card group block">
      <div className="product-card-img-wrap">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=90'; }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.tags.slice(0, 1).map((tag) => (
            <span key={tag} className={tagStyle(tag)}>{tag}</span>
          ))}
        </div>

        {discount && <span className="product-card-discount">-{discount}%</span>}

        <button className="product-card-wish-btn" onClick={handleWish}>
          <Heart size={15} fill={wishlisted ? '#c41e3a' : 'none'} stroke={wishlisted ? '#c41e3a' : '#1c1c1c'} />
        </button>

        {product.inStock && (
          <div className="product-card-quick-add-wrap">
            <button className="product-card-quick-add-btn" onClick={handleAdd}>
              <ShoppingBag size={14} /> Quick Add
            </button>
          </div>
        )}

        {!product.inStock && (
          <div className="product-card-oos">
            <div className="product-card-oos-label">Out of Stock</div>
          </div>
        )}
      </div>

      <div className="product-card-info">
        <p className="product-card-brand">{product.brand}</p>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-price-row">
          <div className="product-card-price-group">
            <span className="product-card-price">${product.price}</span>
            {product.originalPrice && (
              <span className="product-card-original-price">${product.originalPrice}</span>
            )}
          </div>
          <div className="product-card-rating">
            <Star size={11} fill="#c9a96e" stroke="none" />
            <span>{product.rating}</span>
          </div>
        </div>
        {product.colors?.length > 1 && (
          <div className="product-card-colors">
            {product.colors.map((c, i) => (
              <div key={i} className="product-card-color-dot" style={{ background: c }} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
