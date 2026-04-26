import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Truck, RotateCcw, Shield, ChevronRight } from 'lucide-react';
import { api, normalizeProduct } from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import useStore from '../../store/useStore';
import './ProductDetails.css';

const FALLBACK = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, setCartOpen, toggleWishlist, isWishlisted, showToast, user } = useStore();
  const [product,       setProduct]      = useState(null);
  const [related,       setRelated]      = useState([]);
  const [reviews,       setReviews]      = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [activeImg,     setActiveImg]    = useState(0);
  const [selectedSize,  setSelectedSize]  = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity,      setQuantity]      = useState(1);
  const [activeTab,     setActiveTab]     = useState('description');
  const [reviewForm,    setReviewForm]    = useState({ rating: 5, comment: '' });
  const [submitting,    setSubmitting]    = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    window.scrollTo(0, 0);
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/products/${id}/related`),
      api.get(`/products/${id}/reviews`),
    ])
      .then(([prod, rel, revs]) => {
        const p = normalizeProduct(prod);
        setProduct(p);
        setRelated((rel || []).map(normalizeProduct));
        setReviews(revs || []);
        setSelectedSize(p.sizes[0] || '');
        setSelectedColor(p.colors[0] || '');
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="pd-not-found">
      <div className="pd-not-found-inner"><p className="pd-not-found-title">Loading...</p></div>
    </div>
  );

  if (!product) return (
    <div className="pd-not-found">
      <div className="pd-not-found-inner">
        <h2 className="pd-not-found-title">Product not found</h2>
        <Link to="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    </div>
  );

  const wishlisted = isWishlisted(product.id);

  const getSizeMultiplier = (size) => {
    const variant = product.variants?.find(v => v.size === size);
    return variant?.price_modifier ? Number(variant.price_modifier) : 0;
  };

  const sizeMultiplier = getSizeMultiplier(selectedSize);
  const displayPrice   = (product.price * (1 + sizeMultiplier)).toFixed(2);
  const discount       = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  // real images from DB, fall back to the primary image repeated
  const allImages = product.images?.length
    ? product.images.map(img => img.image_url)
    : [product.image];

  const handleAddToCart = () => {
    if (product.sizes[0] !== 'One Size' && !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }
    addToCart({ ...product, price: parseFloat(displayPrice), quantity }, selectedSize, selectedColor);
    showToast(product.name + ' added to cart!');
    setCartOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { showToast('Please log in to leave a review', 'error'); return; }
    setSubmitting(true);
    try {
      const review = await api.post(`/products/${id}/reviews`, reviewForm);
      setReviews(prev => [{ ...review, name: `${user.first_name} ${user.last_name?.[0] || ''}.` }, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      showToast('Review submitted!');
    } catch (err) {
      showToast(err?.message || 'Could not submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
              <img
                src={allImages[activeImg] || FALLBACK}
                alt={product.name}
                onError={e => { e.target.onerror = null; e.target.src = FALLBACK; }}
              />
              {discount && <span className="pd-img-discount">-{discount}%</span>}
              {!product.inStock && (
                <div className="pd-img-oos-overlay">
                  <span className="pd-img-oos-label">Out of Stock</span>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="pd-thumbnails">
                {allImages.map((src, i) => (
                  <div
                    key={i}
                    className={`pd-thumbnail ${i === activeImg ? 'active' : 'inactive'}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img
                      src={src}
                      alt=""
                      onError={e => { e.target.onerror = null; e.target.src = FALLBACK; }}
                    />
                  </div>
                ))}
              </div>
            )}
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
              <span className="pd-review-count">({reviews.length} reviews)</span>
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
            {product.colors.length > 0 && (
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
            )}

            {/* Size */}
            {product.sizes[0] !== 'One Size' && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="pd-picker-label">Size</p>
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
                {tab === 'reviews' ? `Reviews (${reviews.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && <div className="pd-tab-underline" />}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <p className="pd-description">{product.description || `A premium ${product.name.toLowerCase()} crafted with the finest materials for exceptional comfort and style.`}</p>
          )}

          {activeTab === 'details' && (
            <div className="pd-details-grid">
              {[
                ['Category', product.category],
                ['SKU', `LX-${product.id.slice(0, 8).toUpperCase()}`],
              ].map(([key, val]) => (
                <div key={key} className="pd-detail-item">
                  <p className="pd-detail-key">{key}</p>
                  <p className="pd-detail-value">{val}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6 max-w-2xl">
              {/* Submit review */}
              {user && (
                <form onSubmit={handleSubmitReview} className="pd-review-card">
                  <p className="pd-picker-label mb-3">Write a Review</p>
                  <div className="flex gap-2 mb-3">
                    {[1,2,3,4,5].map((i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setReviewForm(f => ({ ...f, rating: i }))}
                      >
                        <Star size={20} fill={i <= reviewForm.rating ? '#c9a96e' : 'none'} stroke="#c9a96e" strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="input-field w-full mb-3 text-sm"
                    rows={3}
                    placeholder="Share your thoughts..."
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    required
                  />
                  <button type="submit" className="btn-primary text-sm" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              {reviews.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No reviews yet. Be the first!</p>
              )}

              {reviews.map((r) => (
                <div key={r.id || r.name} className="pd-review-card">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="pd-reviewer-name">{r.name}</span>
                      <span className="pd-review-date ml-3">
                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
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
