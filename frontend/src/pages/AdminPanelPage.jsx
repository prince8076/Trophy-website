import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  Package,
  ShoppingBag,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Tag,
  CheckCircle2,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  Filter,
  Save,
  X,
  AlertCircle,
  Eye,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  Truck,
  Check,
} from 'lucide-react';
import {
  fetchCategories,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  fetchAllOrders,
  updateOrderStatus,
} from '../api';
import { useTheme } from '../context/ThemeContext';
import HaikeiBackground from '../components/HaikeiBackground';
import SpotlightCard from '../components/ui/SpotlightCard';
import ShimmerButton from '../components/ui/ShimmerButton';

export default function AdminPanelPage() {
  const { theme } = useTheme();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'add' | 'orders'

  // Data states
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Toast feedback
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Add Trophy Form State
  const initialForm = {
    name: '',
    category: '',
    price: '',
    original_price: '',
    description: '',
    material: 'Pure Optical K9 Crystal & Polished Brass',
    dimensions: '11.0" H x 4.5" W x 3.0" Base',
    weight: '2.4 kg (5.3 lbs)',
    stock: 25,
    badge: 'Shreeji Signature',
    is_featured: true,
    image_url: '/uploads/star-pillar-crystal-award.png',
    max_engraving_lines: 4,
    max_chars_per_line: 35,
  };
  const [formData, setFormData] = useState(initialForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);

  // Edit Trophy Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation Modal
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Quick Preset Images for instant selection
  const presetImages = [
    { name: 'Star Pillar Crystal Award', url: '/uploads/star-pillar-crystal-award.png' },
    { name: 'Custom Submarine Acrylic', url: '/uploads/custom-submarine-acrylic-award.png' },
    { name: 'Imperial 3D Golden R Plinth', url: '/uploads/golden-letter-r-monogram-trophy.png' },
    { name: 'Centric Deal-Toy Metal Letter', url: '/uploads/centric-deal-toy-metal-letter-plaque.jpg' },
    { name: 'Graduation Open Book Plaque', url: '/uploads/graduation-open-book-mortarboard-plaque.jpg' },
  ];

  // Load all initial data
  const loadData = async () => {
    try {
      setRefreshing(true);
      const [cats, prods, ords] = await Promise.all([
        fetchCategories().catch(() => []),
        fetchProducts().catch(() => []),
        fetchAllOrders().catch(() => []),
      ]);
      setCategories(cats);
      setProducts(prods);
      setOrders(ords);
      if (cats.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: cats[0].id }));
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      showToast('Failed to load catalog data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Photo Upload
  const handleImageFileChange = async (e, isEditModal = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await uploadImage(file);
      if (isEditModal) {
        setEditingProduct(prev => ({ ...prev, image_url: res.image_url }));
      } else {
        setFormData(prev => ({ ...prev, image_url: res.image_url }));
      }
      showToast('Image uploaded successfully!');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Form Submission (Create New Trophy)
  const handleCreateSubmit = async e => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      showToast('Please provide a Trophy Name and Price.', 'error');
      return;
    }

    try {
      setCreatingProduct(true);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        stock: parseInt(formData.stock, 10) || 0,
        category: formData.category || (categories[0] ? categories[0].id : 1),
      };

      const newProduct = await createProduct(payload);
      showToast(`Trophy "${newProduct.name}" created successfully!`);
      setFormData({
        ...initialForm,
        category: categories[0] ? categories[0].id : '',
      });
      setActiveTab('inventory');
      loadData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to create trophy', 'error');
    } finally {
      setCreatingProduct(false);
    }
  };

  // Handle Update Trophy
  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    try {
      setSavingEdit(true);
      const payload = {
        name: editingProduct.name,
        price: parseFloat(editingProduct.price),
        original_price: editingProduct.original_price ? parseFloat(editingProduct.original_price) : null,
        description: editingProduct.description,
        material: editingProduct.material,
        dimensions: editingProduct.dimensions,
        weight: editingProduct.weight,
        stock: parseInt(editingProduct.stock, 10) || 0,
        badge: editingProduct.badge,
        image_url: editingProduct.image_url,
        is_featured: editingProduct.is_featured,
        category: editingProduct.category,
      };

      await updateProduct(editingProduct.id, payload);
      showToast(`"${editingProduct.name}" updated successfully!`);
      setEditingProduct(null);
      loadData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to update trophy', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Delete Trophy
  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProduct(deletingProduct.id);
      showToast(`Deleted "${deletingProduct.name}" from catalog.`);
      setDeletingProduct(null);
      loadData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to delete trophy', 'error');
    }
  };

  // Handle Order Status Change
  const handleStatusChange = async (orderNumber, newStatus) => {
    try {
      await updateOrderStatus(orderNumber, newStatus);
      showToast(`Order ${orderNumber} updated to "${newStatus}"!`);
      setOrders(prev =>
        prev.map(ord => (ord.order_number === orderNumber ? { ...ord, status: newStatus } : ord))
      );
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.material?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      p.category_slug === selectedCategory ||
      p.category === parseInt(selectedCategory, 10);

    return matchesSearch && matchesCategory;
  });

  // Color mapping for Order Status
  const getStatusBadgeStyle = status => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';
      case 'shipped':
        return 'bg-blue-950/80 text-blue-400 border-blue-500/40';
      case 'in_engraving':
        return 'bg-purple-950/80 text-purple-400 border-purple-500/40';
      case 'quality_inspection':
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40';
      case 'confirmed':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-slate-950">
      <HaikeiBackground variant="mesh" className="opacity-15" />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-24 right-6 z-50 px-5 py-3.5 rounded-xl border shadow-2xl flex items-center gap-3 backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-slate-900/95 border-amber-500/60 text-amber-200 shadow-amber-500/10'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Luxury Black & Gold styling */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-slate-800/80 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                style={{
                  backgroundColor: `${theme.primary}20`,
                  color: theme.primary,
                  borderColor: `${theme.primary}40`,
                }}
                className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase border inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Shreeji Management Console
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading-cinzel text-white">
              Trophy & Catalog <span style={{ color: theme.primary }}>Admin Studio</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Add new custom trophies, upload high-res photography, adjust prices in ₹, and oversee engraved orders.
            </p>
          </div>

          {/* Quick Action & Refresh */}
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
              title="Refresh Catalog Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            <button
              onClick={() => setActiveTab('add')}
              style={{
                background: `linear-gradient(135deg, ${theme.primaryLight}, ${theme.primary}, ${theme.primaryDark})`,
                boxShadow: `0 8px 20px -4px ${theme.primary}50`,
              }}
              className="px-4 py-2.5 rounded-xl text-slate-950 font-bold text-xs flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Trophy</span>
            </button>
          </div>
        </div>

        {/* Top Summary Stats Metric Cards with 21st.dev SpotlightCard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SpotlightCard className="p-4.5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Trophies</span>
              <Package className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white tabular-nums">{products.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Active in online storefront</div>
          </SpotlightCard>

          <SpotlightCard className="p-4.5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Categories</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white tabular-nums">{categories.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Crystal, Acrylic, Wood & Metal</div>
          </SpotlightCard>

          <SpotlightCard className="p-4.5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Customer Orders</span>
              <ShoppingBag className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white tabular-nums">{orders.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Received through website</div>
          </SpotlightCard>

          <SpotlightCard className="p-4.5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Avg. Unit Price</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-heading-cinzel tabular-nums">
              ₹&nbsp;
              {products.length > 0
                ? Math.round(
                    products.reduce((acc, p) => acc + parseFloat(p.price || 0), 0) / products.length
                  ).toLocaleString('en-IN')
                : '0'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Indian Rupee catalog standard</div>
          </SpotlightCard>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center border-b border-slate-800 mb-8 space-x-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Trophy Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'add'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Trophy</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders & Engravings ({orders.length})</span>
          </button>
        </div>

        {/* TAB 1: INVENTORY & PRICING LIST */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search by trophy title or material..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
                  <Filter className="w-3.5 h-3.5 text-amber-400" /> Filter:
                </span>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer w-full sm:w-auto"
                >
                  <option value="all">All Categories ({products.length})</option>
                  {categories.map(cat => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Trophies Grid / Cards */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-8">
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-300">No trophies match your filter</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query or clear filters to view the complete catalog.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-black/50"
                  >
                    <div>
                      {/* Thumbnail with overlay tags */}
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-800/50">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                          onError={e => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.badge && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/90 text-slate-950 shadow-md">
                              {product.badge}
                            </span>
                          )}
                          {product.is_featured && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 text-amber-400 border border-amber-500/30">
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-slate-950/85 backdrop-blur-md text-[10px] font-mono text-slate-400 border border-slate-800">
                          Stock: {product.stock}
                        </div>
                      </div>

                      {/* Category & Title */}
                      <div className="text-[11px] font-medium text-amber-400/90 uppercase tracking-wider mb-1">
                        {product.category_name || 'Shreeji Award'}
                      </div>
                      <h3 className="font-bold text-white text-base leading-snug line-clamp-1 mb-2">
                        {product.name}
                      </h3>

                      <p className="text-slate-400 text-xs line-clamp-2 mb-3">
                        {product.description}
                      </p>

                      <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60 text-xs space-y-1 mb-3">
                        <div className="flex justify-between text-slate-400">
                          <span>Material:</span>
                          <span className="text-slate-200 font-medium truncate max-w-[180px]">
                            {product.material}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Dimensions:</span>
                          <span className="text-slate-200 font-medium">{product.dimensions}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Bar & Action Buttons */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Price</div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-amber-400 font-heading-cinzel">
                            ₹{parseFloat(product.price).toLocaleString('en-IN')}
                          </span>
                          {product.original_price && (
                            <span className="text-xs text-slate-500 line-through">
                              ₹{parseFloat(product.original_price).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`/product/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View on Live Store"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setEditingProduct({ ...product })}
                          className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-400 hover:text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                          title="Edit Trophy Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(product)}
                          className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                          title="Delete Trophy"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADD NEW TROPHY FORM */}
        {activeTab === 'add' && (
          <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-heading-cinzel text-white flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-amber-400" />
                Add New Trophy to Catalog
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Upload bespoke photography, specify gold or crystal craftsmanship details, and configure instant pricing in Indian Rupees (₹).
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              {/* Photo Upload Section */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                  1. Trophy Photography & Visual
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Image Preview Box */}
                  <div className="relative aspect-square max-h-56 rounded-xl border-2 border-dashed border-slate-800 bg-slate-900 flex items-center justify-center overflow-hidden">
                    {formData.image_url ? (
                      <img
                        src={formData.image_url}
                        alt="Trophy Preview"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                        <span className="text-xs text-slate-500">No image chosen</span>
                      </div>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
                        <span className="text-xs font-semibold text-amber-300">Uploading Photo...</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <span className="text-xs text-slate-300 font-semibold block mb-1">
                        Upload Image File from Device:
                      </span>
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-slate-200 text-xs font-bold cursor-pointer transition-colors shadow-sm">
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>Choose Photo (PNG / JPG / WEBP)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleImageFileChange(e, false)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block mb-1">
                        Or enter direct Image URL / Relative Path:
                      </span>
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="/uploads/star-pillar-crystal-award.png"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    {/* Quick Pick from Uploaded Trophies */}
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">
                        Quick Pick User Trophy Assets:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {presetImages.map(preset => (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => setFormData({ ...formData, image_url: preset.url })}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                              formData.image_url === preset.url
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Trophy Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Imperial Monogram 3D Golden 'R' Plinth Trophy"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Award Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing in Indian Rupees */}
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4.5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                    Price (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-amber-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      step="1"
                      required
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="4850"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-slate-100 font-bold focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Original MRP (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      step="1"
                      value={formData.original_price}
                      onChange={e => setFormData({ ...formData, original_price: e.target.value })}
                      placeholder="5600"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Initial Stock Available
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="25"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Trophy Description & Presentation Details *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe craftsmanship, crystal grade, 24K gold plating, and significance of this trophy award..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Material, Dimensions, Weight, Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Material Craft
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={e => setFormData({ ...formData, material: e.target.value })}
                    placeholder="Grade-A Optical Crystal"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={e => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder={'11.5" H x 4.0" W x 3.0" Base'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Weight
                  </label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="2.8 kg (6.2 lbs)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Highlight Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Signature Crystal"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 bg-slate-900 border-slate-700"
                />
                <label htmlFor="is_featured" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Feature this trophy prominently on the Homepage & Showcase Carousel
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(initialForm)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset Form
                </button>

                <button
                  type="submit"
                  disabled={creatingProduct}
                  style={{
                    background: `linear-gradient(135deg, ${theme.primaryLight}, ${theme.primary}, ${theme.primaryDark})`,
                    boxShadow: `0 8px 25px -4px ${theme.primary}50`,
                  }}
                  className="px-6 py-2.5 rounded-xl text-slate-950 font-extrabold text-xs flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {creatingProduct ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving to Catalog...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Publish Trophy to Store</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: ORDERS & ENGRAVING PIPELINE */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  Live Order Dispatch Pipeline ({orders.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect buyer customization requests, personalized laser-etched messages, and advance order status.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-8">
                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-300">No Orders Received Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  When customers purchase trophies and submit custom engraving requests, they will appear here with full plate inspection.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all"
                  >
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-amber-400">
                            {order.order_number}
                          </span>
                          <span className="text-xs text-slate-500">
                            • {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1">
                          <span className="font-semibold text-white">{order.customer_name}</span> ({order.customer_email} • {order.customer_phone})
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Delivery: {order.shipping_address}, {order.city} - {order.postal_code}
                        </div>
                      </div>

                      {/* Status Dropdown & Total */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block uppercase">Total Amount</span>
                          <span className="text-lg font-black text-amber-400 font-heading-cinzel">
                            ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Status:</span>
                          <select
                            value={order.status}
                            onChange={e => handleStatusChange(order.order_number, e.target.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${getStatusBadgeStyle(
                              order.status
                            )}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_engraving">In Engraving</option>
                            <option value="quality_inspection">Quality Inspection</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Order Items with Engraving Inspection */}
                    <div className="mt-4 space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                        Ordered Items & Engraved Plate Details:
                      </span>
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                          >
                            <div>
                              <div className="font-bold text-white text-xs">
                                {item.product_name} <span className="text-amber-400">× {item.quantity}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Unit Price: ₹{parseFloat(item.unit_price).toLocaleString('en-IN')}
                              </div>
                            </div>

                            {/* Plate Engraving Badge & Text */}
                            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs md:max-w-md w-full">
                              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 border-b border-slate-800 pb-1">
                                <span>Font: <strong className="text-amber-300">{item.engraving_font || 'Classic Serif'}</strong></span>
                                <span>Plate: <strong className="text-amber-300">{item.plate_color || 'Brushed Gold'}</strong></span>
                              </div>
                              <div className="font-mono text-[11px] text-slate-300 space-y-0.5">
                                {item.engraving_line1 && (
                                  <div>Line 1: <span className="text-amber-200 font-semibold">{item.engraving_line1}</span></div>
                                )}
                                {item.engraving_line2 && (
                                  <div>Line 2: <span className="text-amber-200">{item.engraving_line2}</span></div>
                                )}
                                {item.engraving_line3 && (
                                  <div>Line 3: <span className="text-amber-200">{item.engraving_line3}</span></div>
                                )}
                                {!item.engraving_line1 && !item.engraving_line2 && !item.engraving_line3 && (
                                  <div className="text-slate-500 italic">No custom engraving requested</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-500 italic">No specific items listed</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* EDIT TROPHY MODAL */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setEditingProduct(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold font-heading-cinzel text-white flex items-center gap-2 mb-4">
                <Edit3 className="w-5 h-5 text-amber-400" />
                Edit Trophy: {editingProduct.name}
              </h2>

              <div className="space-y-4">
                {/* Image Edit Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="aspect-square max-h-32 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                    <img
                      src={editingProduct.image_url}
                      alt="Thumbnail"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-200 text-xs font-bold cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload New Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageFileChange(e, true)}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={editingProduct.image_url}
                      onChange={e =>
                        setEditingProduct({ ...editingProduct, image_url: e.target.value })
                      }
                      placeholder="Photo URL or path"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Trophy Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={e =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-400 mb-1">
                      Price (₹ INR)
                    </label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={e =>
                        setEditingProduct({ ...editingProduct, price: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Original Price (₹)
                    </label>
                    <input
                      type="number"
                      value={editingProduct.original_price || ''}
                      onChange={e =>
                        setEditingProduct({ ...editingProduct, original_price: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Stock</label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={e =>
                        setEditingProduct({ ...editingProduct, stock: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Badge</label>
                    <input
                      type="text"
                      value={editingProduct.badge || ''}
                      onChange={e =>
                        setEditingProduct({ ...editingProduct, badge: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description}
                    onChange={e =>
                      setEditingProduct({ ...editingProduct, description: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-2"
                  >
                    {savingEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                Confirm Trophy Deletion
              </h3>
              <p className="text-xs text-slate-300 mb-4">
                Are you sure you want to permanently delete{' '}
                <strong className="text-amber-300">"{deletingProduct.name}"</strong>? This will remove it from all storefront catalog pages.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeletingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProduct}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Trophy</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
