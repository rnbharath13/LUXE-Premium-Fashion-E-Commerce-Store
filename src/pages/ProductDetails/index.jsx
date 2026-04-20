import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Truck, RotateCcw, Shield, ChevronRight } from 'lucide-react';
import { getProductById, getRelatedProducts } from '../../data/products';
import ProductCard from '../../components/ProductCard';
import useStore from '../../store/useStore';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id }      = useParams();
  const product     = getProductById(id);
  const { addToCart, setCartOpen, toggleWishlist, isWishlisted, showToast } = useStore();
  const [selectedSize,  setSelectedSize]  = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity,      setQuantity]      = useState(1);
  const [activeTab,     setActiveTab]     = useState('description');

  useEffect(() => {
    if (product) { setSelectedSize(product.sizes[0]); setSelectedColor(product.colors[0]); window.scrollTo(0, 0); }
  }, [id, product]);

  if (!product) return (
    <div className="pd-not-found">
      <div className="pd-not-found-inner">
        <h2 className="pd-not-found-title">Product not found</h2>
        <Link to="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    </div>
  );

  const related    = getRelatedProducts(product);
  const wishlisted = isWishlisted(product.id);

  const sizePremium    = { XS: 0, S: 0, M: 0, L: 0.03, XL: 0.06, XXL: 0.10, XXXL: 0.15 };
  const shoePremium    = { '35': 0, '36': 0, '37': 0, '38': 0, '39': 0, '40': 0, '41': 0.02, '42': 0.04, '43': 0.06, '44': 0.08, '45': 0.10, '46': 0.12 };
  const trouserPremium = { '28': 0, '30': 0, '32': 0.03, '34': 0.05, '36': 0.08, '38': 0.10 };

  const getSizeMultiplier = (size) => {
    if (sizePremium[size]    !== undefined) return sizePremium[size];
    if (shoePremium[size]    !== undefined) return shoePremium[size];
    if (trouserPremium[size] !== undefined) return trouserPremium[size];
    return 0;
  };

  const sizeMultiplier = getSizeMultiplier(selectedSize);
  const displayPrice   = (product.price * (1 + sizeMultiplier)).toFixed(2);
  const discount       = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  const handleAddToCart = () => {
    if (!selectedSize) { showToast('Please select a size', 'error'); return; }
    addToCart({ ...product, price: parseFloat(displayPrice), quantity }, selectedSize, selectedColor);
    showToast(product.name + ' added to cart!');
    setCartOpen(true);
  };

  const reviews = [
    { name: 'Alex K.',  rating: 5, date: 'Apr 2026', comment: 'Absolutely incredible quality. Worth every penny.' },
    { name: 'Maria S.', rating: 5, date: 'Mar 2026', comment: 'The fit is perfect and the material feels luxurious.' },
    { name: 'James P.', rating: 4, date: 'Mar 2026', comment: 'Great product, fast delivery. Very happy with my purchase.' },
  ];

  return (
    <div className="pd-page animate-fade-in">
      <div className="pd-inner">
        {/* Breadcrumb */}
        <div className="pd-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop">Shop</Link>
          <ChevronRight size={12} />
          <span className="pd-breadcrumb-current">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-14 mb-20">
          {/* Images */}
          <div>
            <div className="pd-main-img">
              <img src={product.image} alt={product.name} />
              {discount && <span className="pd-img-discount">-{discount}%</span>}
              {!product.inStock && (
                <div className="pd-img-oos-overlay">
                  <span className="pd-img-oos-label">Out of Stock</span>
                </div>
              )}
            </div>
            <div className="pd-thumbnails">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`pd-thumbnail ${i === 1 ? 'active' : 'inactive'}`}>
                  <img src={product.image} alt="" style={{ opacity: i === 1 ? 1 : 0.65 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="pd-brand">{product.brand}</p>
            <div className="flex items-start justify-between mb-4">
              <h1 className="pd-title">{product.name}</h1>
              <button
                className="pd-wish-btn"
                onClick={() => { toggleWishlist(product); showToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', 'info'); }}
              >
                <Heart size={18} fill={wishlisted ? '#c41e3a' : 'none'} stroke={wishlisted ? '#c41e3a' : '#9a9a9a'} />
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="pd-rating">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} size={14} fill={i <= Math.floor(product.rating) ? '#c9a96e' : 'none'} stroke="#c9a96e" strokeWidth={1.5} />
                ))}
                <span className="pd-rating-value">{product.rating}</span>
              </div>
              <span className="pd-review-count">({product.reviews} reviews)</span>
              <div className="flex gap-1.5">
                {product.tags.map((t) => <span key={t} className={t === 'Sale' ? 'badge-sale' : 'badge-new'}>{t}</span>)}
              </div>
            </div>

            {/* Price */}
            <div className="pd-price-section flex items-center gap-4">
              <div>
                <span className="pd-price">${displayPrice}</span>
                {sizeMultiplier > 0 && <span className="pd-size-pricing-note">Size {selectedSize} pricing</span>}
              </div>
              {product.originalPrice && <span className="pd-original-price">${product.originalPrice}</span>}
              {discount && <span className="pd-discount-badge">Save {discount}%</span>}
            </div>

            {/* Color */}
            <div className="mb-6">
              <p className="pd-picker-label">Colour</p>
              <div className="flex gap-3">
                {product.colors.map((c, i) => (
                  <button
                    key={i}
                    className={`pd-color-btn ${selectedColor === c ? 'active' : 'inactive'}`}
                    style={{ background: c }}
                    onClick={() => setSelectedColor(c)}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            {product.sizes[0] !== 'One Size' && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="pd-picker-label">Size</p>
                  <button className="pd-size-guide-btn">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`pd-size-btn ${selectedSize === s ? 'active' : ''}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Add */}
            <div className="flex gap-3 mb-8">
              <div className="pd-qty-wrap">
                <button className="pd-qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span className="pd-qty-val">{quantity}</span>
                <button className="pd-qty-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
              <button onClick={handleAddToCart} disabled={!product.inStock} className="flex-1 btn-primary justify-center text-sm">
                <ShoppingBag size={16} />
                {product.inStock ? 'Add to Bag' : 'Out of Stock'}
              </button>
            </div>

            {/* Perks */}
            <div className="pd-perks-box">
              {[[Truck, 'Free shipping on orders over $150'], [RotateCcw, 'Free 30-day returns'], [Shield, 'Secure checkout']].map(([Icon, text], i) => (
                <div key={i} className="pd-perk-item">
                  <Icon size={15} className="pd-perk-icon" />
                  <span className="pd-perk-label">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-20">
          <div className="pd-tabs-bar">
            {['description', 'details', 'reviews'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`pd-tab-btn ${activeTab === tab ? 'active' : 'inactive'}`}>
                {tab === 'reviews' ? `Reviews (${product.reviews})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && <div className="pd-tab-underline" />}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <p className="pd-description">{product.description || `A premium ${product.name.toLowerCase()} crafted with the finest materials for exceptional comfort and style. This piece embodies the LUXE philosophy of quality and sophistication.`}</p>
          )}

          {activeTab === 'details' && (
            <div className="pd-details-grid">
              {[['Material', '100% Premium Cotton'], ['Fit', 'Regular Fit'], ['Care', 'Machine Wash'], ['Origin', 'Made in Italy'], ['SKU', `LX-${product.id}`], ['Category', product.category]].map(([key, val]) => (
                <div key={key} className="pd-detail-item">
                  <p className="pd-detail-key">{key}</p>
                  <p className="pd-detail-value">{val}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4 max-w-2xl">
              {reviews.map((r) => (
                <div key={r.name} className="pd-review-card">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="pd-reviewer-name">{r.name}</span>
                      <span className="pd-review-date ml-3">{r.date}</span>
                    </div>
                    <div className="pd-review-stars">
                      {[1,2,3,4,5].map((i) => <Star key={i} size={12} fill={i <= r.rating ? '#c9a96e' : 'none'} stroke="#c9a96e" strokeWidth={1.5} />)}
                    </div>
                  </div>
                  <p className="pd-review-comment">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="pd-related-title">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
