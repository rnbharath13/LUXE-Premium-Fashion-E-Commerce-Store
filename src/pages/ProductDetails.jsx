import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Truck, RotateCcw, Shield, ChevronRight } from 'lucide-react';
import { getProductById, getRelatedProducts } from '../data/products';
import ProductCard from '../components/ProductCard';
import useStore from '../store/useStore';

export default function ProductDetails() {
  const { id } = useParams();
  const product = getProductById(id);
  const { addToCart, setCartOpen, toggleWishlist, isWishlisted, showToast } = useStore();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0]);
      setSelectedColor(product.colors[0]);
      window.scrollTo(0, 0);
    }
  }, [id, product]);

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Product not found
        </h2>
        <Link to="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    </div>
  );

  const related = getRelatedProducts(product);
  const wishlisted = isWishlisted(product.id);

  const sizePremium = { XS: 0, S: 0, M: 0, L: 0.03, XL: 0.06, XXL: 0.10, XXXL: 0.15 };
  const shoePremium = { '35': 0, '36': 0, '37': 0, '38': 0, '39': 0, '40': 0, '41': 0.02, '42': 0.04, '43': 0.06, '44': 0.08, '45': 0.10, '46': 0.12 };
  const trouserPremium = { '28': 0, '30': 0, '32': 0.03, '34': 0.05, '36': 0.08, '38': 0.10 };
  const getSizeMultiplier = (size) => {
    if (sizePremium[size] !== undefined) return sizePremium[size];
    if (shoePremium[size] !== undefined) return shoePremium[size];
    if (trouserPremium[size] !== undefined) return trouserPremium[size];
    return 0;
  };
  const sizeMultiplier = getSizeMultiplier(selectedSize);
  const displayPrice = (product.price * (1 + sizeMultiplier)).toFixed(2);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (!selectedSize) { showToast('Please select a size', 'error'); return; }
    addToCart({ ...product, price: parseFloat(displayPrice), quantity }, selectedSize, selectedColor);
    showToast(product.name + ' added to cart!');
    setCartOpen(true);
  };

  const reviews = [
    { name: 'Alex K.', rating: 5, date: 'Apr 2026', comment: 'Absolutely incredible quality. Worth every penny.' },
    { name: 'Maria S.', rating: 5, date: 'Mar 2026', comment: 'The fit is perfect and the material feels luxurious.' },
    { name: 'James P.', rating: 4, date: 'Mar 2026', comment: 'Great product, fast delivery. Very happy with my purchase.' },
  ];

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider mb-8" style={{ color: 'var(--text-muted)' }}>
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-14 mb-20">
          {/* Images */}
          <div>
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: '4/5', background: 'var(--bg-secondary)' }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {discount && (
                <span
                  className="absolute top-4 left-4 text-xs font-bold px-2.5 py-1 uppercase"
                  style={{ background: 'var(--accent-red)', color: '#fff' }}
                >
                  -{discount}%
                </span>
              )}
              {!product.inStock && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.7)' }}
                >
                  <span className="font-bold text-xl uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2 mt-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="cursor-pointer overflow-hidden transition-all"
                  style={{
                    width: 72, height: 88,
                    border: i === 1 ? '2px solid #1c1c1c' : '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                  }}
                >
                  <img
                    src={product.image}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: i === 1 ? 1 : 0.65 }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
              {product.brand}
            </p>
            <div className="flex items-start justify-between mb-4">
              <h1
                className="text-3xl font-bold leading-tight"
                style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
              >
                {product.name}
              </h1>
              <button
                onClick={() => { toggleWishlist(product); showToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', 'info'); }}
                className="p-2.5 transition-all hover:bg-gray-100 ml-3 flex-shrink-0"
                style={{ border: '1px solid var(--border)' }}
              >
                <Heart size={18} fill={wishlisted ? '#c41e3a' : 'none'} stroke={wishlisted ? '#c41e3a' : '#9a9a9a'} />
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} fill={i <= Math.floor(product.rating) ? '#c9a96e' : 'none'} stroke="#c9a96e" strokeWidth={1.5} />
                ))}
                <span className="text-sm font-semibold ml-1" style={{ color: 'var(--text-primary)' }}>{product.rating}</span>
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({product.reviews} reviews)</span>
              <div className="flex gap-1.5">
                {product.tags.map((t) => (
                  <span key={t} className={t === 'Sale' ? 'badge-sale' : 'badge-new'}>{t}</span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-8 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <span className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>${displayPrice}</span>
                {sizeMultiplier > 0 && (
                  <span className="ml-2 text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Size {selectedSize} pricing
                  </span>
                )}
              </div>
              {product.originalPrice && (
                <span className="text-xl line-through" style={{ color: 'var(--text-muted)' }}>${product.originalPrice}</span>
              )}
              {discount && (
                <span className="text-sm font-bold px-2 py-0.5" style={{ background: 'rgba(196,30,58,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(196,30,58,0.2)' }}>
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Color */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-primary)' }}>
                Colour
              </p>
              <div className="flex gap-3">
                {product.colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(c)}
                    className="w-8 h-8 rounded-full transition-all"
                    style={{
                      background: c,
                      outline: selectedColor === c ? '2px solid #1c1c1c' : '2px solid transparent',
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            {product.sizes[0] !== 'One Size' && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
                    Size
                  </p>
                  <button className="text-xs underline underline-offset-2 transition-colors hover:text-black" style={{ color: 'var(--text-muted)' }}>
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className="px-4 py-2 text-sm font-medium transition-all"
                      style={{
                        background: selectedSize === s ? '#1c1c1c' : 'transparent',
                        border: '1px solid ' + (selectedSize === s ? '#1c1c1c' : 'var(--border)'),
                        color: selectedSize === s ? '#fff' : 'var(--text-secondary)',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Add */}
            <div className="flex gap-3 mb-8">
              <div className="flex items-center" style={{ border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 text-lg font-medium transition-colors hover:bg-gray-100"
                  style={{ color: 'var(--text-muted)' }}
                >
                  −
                </button>
                <span className="px-4 py-3 font-semibold min-w-[2.5rem] text-center" style={{ color: 'var(--text-primary)' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-3 text-lg font-medium transition-colors hover:bg-gray-100"
                  style={{ color: 'var(--text-muted)' }}
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 btn-primary justify-center text-sm"
              >
                <ShoppingBag size={16} />
                {product.inStock ? 'Add to Bag' : 'Out of Stock'}
              </button>
            </div>

            {/* Perks */}
            <div className="space-y-3 p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              {[
                [Truck, 'Free shipping on orders over $150'],
                [RotateCcw, 'Free 30-day returns'],
                [Shield, 'Secure checkout'],
              ].map(([Icon, text], i) => (
                <div key={i} className="flex items-center gap-3">
                  <Icon size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-20">
          <div className="flex gap-8 border-b mb-8" style={{ borderColor: 'var(--border)' }}>
            {['description', 'details', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="pb-3 text-sm font-semibold capitalize transition-all relative"
                style={{ color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                {tab === 'reviews' ? `Reviews (${product.reviews})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: '#1c1c1c' }} />
                )}
              </button>
            ))}
          </div>
          {activeTab === 'description' && (
            <p className="leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
          )}
          {activeTab === 'details' && (
            <div className="grid grid-cols-2 gap-3 max-w-lg">
              {[
                ['Brand', product.brand],
                ['Category', product.category],
                ['Available Sizes', product.sizes.join(', ')],
                ['In Stock', product.inStock ? 'Yes' : 'No'],
              ].map(([k, v]) => (
                <div key={k} className="p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{k}</p>
                  <p className="text-sm font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{v}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="space-y-4 max-w-2xl">
              {reviews.map((r, i) => (
                <div key={i} className="p-5" style={{ border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: '#1c1c1c' }}
                      >
                        {r.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} fill={s <= r.rating ? '#c9a96e' : 'none'} stroke="#c9a96e" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
              >
                You May Also Like
              </h2>
              <Link
                to="/shop"
                className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors hover:text-black"
                style={{ color: 'var(--text-muted)' }}
              >
                View All <ChevronRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
