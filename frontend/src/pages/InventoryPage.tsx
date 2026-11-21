import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Utensils, 
  History, 
  Trash2, 
  Edit3, 
  Package, 
  MapPin, 
  Clock, 
  CheckSquare,
  Sparkles,
  LayoutGrid,
  List,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { api } from '../services/api';
import { Product, Category, StockMovement } from '../types';

interface InventoryPageProps {
  onNavigate: (page: string) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Consumption form state
  const [consumeQty, setConsumeQty] = useState<number>(1.0);
  const [consumeNotes, setConsumeNotes] = useState('');
  const [consumeLoading, setConsumeLoading] = useState(false);

  // History state
  const [historyMovements, setHistoryMovements] = useState<StockMovement[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Add Product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCatId, setNewProdCatId] = useState<number>(4);
  const [newProdUnit, setNewProdUnit] = useState('kg');
  const [newProdMinStock, setNewProdMinStock] = useState<number>(2.0);
  const [newProdQty, setNewProdQty] = useState<number>(5.0);
  const [newProdLocation, setNewProdLocation] = useState('Pantry');
  const [newProdPrice, setNewProdPrice] = useState<number>(100.0);
  const [addLoading, setAddLoading] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [prodsData, catsData] = await Promise.all([
        api.getInventory({ 
          search: search || undefined, 
          category_id: selectedCategory, 
          stock_status: selectedStatus 
        }),
        api.getCategories()
      ]);
      setProducts(prodsData);
      setCategories(catsData);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleOpenConsume = (p: Product) => {
    setActiveProduct(p);
    setConsumeQty(1.0);
    setConsumeNotes('Daily kitchen meal preparation');
    setShowConsumeModal(true);
  };

  const handleConfirmConsume = async () => {
    if (!activeProduct) return;
    setConsumeLoading(true);
    try {
      await api.consumeProduct(activeProduct.product_id, {
        movement_type: 'CONSUMPTION',
        quantity: consumeQty,
        notes: consumeNotes
      });
      setShowConsumeModal(false);
      fetchInventory();
    } catch (err: any) {
      alert(err.message || 'Consumption failed');
    } finally {
      setConsumeLoading(false);
    }
  };

  const handleOpenHistory = async (p: Product) => {
    setActiveProduct(p);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const hist = await api.getProductHistory(p.product_id);
      setHistoryMovements(hist);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product and all its inventory batches?')) return;
    try {
      await api.deleteProduct(id);
      fetchInventory();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await api.createProduct({
        product_name: newProdName,
        category_id: newProdCatId,
        default_unit: newProdUnit,
        min_stock_level: newProdMinStock,
        current_quantity: newProdQty,
        storage_location: newProdLocation,
        purchase_price: newProdPrice
      });
      setShowAddModal(false);
      setNewProdName('');
      fetchInventory();
    } catch (err: any) {
      alert(err.message || 'Failed to create product');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-muted">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange">Pantry & Storage Catalog</span>
          <h1 className="font-serif text-3xl font-bold text-charcoal mt-1">Household Inventory</h1>
          <p className="text-xs text-secondary mt-1">
            Real-time multi-batch tracking, FIFO pantry consumption, and storage location classification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-cream-muted shadow-soft">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewLayout === 'grid' ? 'bg-orange text-white' : 'text-secondary hover:text-charcoal'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewLayout('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewLayout === 'table' ? 'bg-orange text-white' : 'text-secondary hover:text-charcoal'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-orange hover:bg-orange-dark text-white font-semibold text-xs shadow-soft hover:shadow-card transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
            selectedCategory === undefined 
              ? 'bg-charcoal text-white shadow-soft' 
              : 'bg-white border border-cream-muted text-secondary hover:text-charcoal hover:border-orange/50'
          }`}
        >
          All Items ({products.length})
        </button>
        {categories.map((c) => {
          const isSelected = selectedCategory === c.category_id;
          return (
            <button
              key={c.category_id}
              onClick={() => setSelectedCategory(isSelected ? undefined : c.category_id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                isSelected 
                  ? 'bg-orange text-white shadow-soft' 
                  : 'bg-white border border-cream-muted text-secondary hover:text-charcoal hover:border-orange/50'
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-4 rounded-2xl border border-cream-muted shadow-soft">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-secondary absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search products (e.g. Basmati Rice, Milk, Toor Dal, Everest Masala)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-muted text-xs text-charcoal outline-none focus:border-orange bg-cream-light"
          />
        </form>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-cream-muted text-xs text-charcoal font-semibold outline-none bg-cream-light"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="SAFE">Well Stocked</option>
            <option value="LOW_STOCK">Low Stock Alert</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* ========================================================
          PRODUCTS PRESENTATION: GRID OR TABLE
          ======================================================== */}
      {loading ? (
        <div className="p-16 text-center text-xs text-secondary animate-pulse">Loading inventory records from MySQL...</div>
      ) : products.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-cream-muted text-secondary text-xs shadow-soft">
          No products matched your criteria. Click "Add Product" or scan a bill to populate pantry inventory.
        </div>
      ) : viewLayout === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => {
            const isLow = p.stock_status === 'LOW_STOCK';
            const isOut = p.stock_status === 'OUT_OF_STOCK';

            return (
              <div
                key={p.product_id}
                className={`p-5 rounded-2xl bg-white border transition-all duration-300 shadow-soft hover:shadow-card flex flex-col justify-between ${
                  isOut ? 'border-charcoal/30' : isLow ? 'border-orange/50' : 'border-cream-muted'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                      {p.category_name}
                    </span>
                    {isOut ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-charcoal text-white">
                        Out of Stock
                      </span>
                    ) : isLow ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange/15 text-orange-dark border border-orange/30">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Well Stocked
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-charcoal text-base mb-1">{p.product_name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-secondary mb-4">
                    <MapPin className="w-3.5 h-3.5 text-secondary" />
                    <span>{p.storage_location}</span>
                  </div>

                  {/* Stock Metrics Box */}
                  <div className="p-3.5 rounded-xl bg-cream-light border border-cream-muted space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-secondary font-medium">In Pantry:</span>
                      <span className="font-serif text-xl font-bold text-charcoal">
                        {p.current_quantity.toFixed(2)} <span className="text-xs font-mono font-normal">{p.default_unit}</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-secondary text-[11px] pt-1 border-t border-cream-muted/70">
                      <span>Threshold Min:</span>
                      <span className="font-mono text-charcoal">{p.min_stock_level.toFixed(2)} {p.default_unit}</span>
                    </div>

                    <div className="flex justify-between items-center text-secondary text-[11px]">
                      <span>Earliest Expiry:</span>
                      <span className="font-mono text-charcoal">
                        {p.earliest_expiry ? (
                          <span className="text-orange font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {p.earliest_expiry}
                          </span>
                        ) : 'No active batch'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-cream-muted flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenConsume(p)}
                    disabled={p.current_quantity <= 0}
                    className="flex-1 py-2 rounded-xl bg-orange hover:bg-orange-dark text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-30"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Consume</span>
                  </button>
                  <button
                    onClick={() => handleOpenHistory(p)}
                    className="p-2 rounded-xl border border-cream-muted text-secondary hover:text-charcoal hover:bg-cream transition-colors"
                    title="Audit History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.product_id)}
                    className="p-2 rounded-xl border border-cream-muted text-secondary hover:text-red-600 hover:bg-cream transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-cream-muted shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cream-muted text-secondary font-bold uppercase text-[10px] bg-cream-light/60">
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-center">Available Stock</th>
                  <th className="py-3.5 px-4 text-center">Min Threshold</th>
                  <th className="py-3.5 px-4">Earliest Expiry</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-muted/50">
                {products.map((p) => {
                  const isLow = p.stock_status === 'LOW_STOCK';
                  const isOut = p.stock_status === 'OUT_OF_STOCK';
                  return (
                    <tr key={p.product_id} className="hover:bg-cream-light/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-charcoal">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-orange flex-shrink-0" />
                          <span>{p.product_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-secondary">{p.category_name}</td>
                      <td className="py-3.5 px-4 text-secondary">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-secondary" />
                          {p.storage_location}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-charcoal font-mono text-sm">
                        {p.current_quantity.toFixed(2)} {p.default_unit}
                      </td>
                      <td className="py-3.5 px-4 text-center text-secondary font-mono">
                        {p.min_stock_level.toFixed(2)} {p.default_unit}
                      </td>
                      <td className="py-3.5 px-4 text-secondary font-mono">
                        {p.earliest_expiry || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-charcoal text-white">Out of Stock</span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange/15 text-orange-dark">Low Stock</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Safe</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenConsume(p)}
                            disabled={p.current_quantity <= 0}
                            className="p-1.5 text-secondary hover:text-orange rounded-lg hover:bg-cream disabled:opacity-30"
                            title="Consume"
                          >
                            <Utensils className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenHistory(p)}
                            className="p-1.5 text-secondary hover:text-charcoal rounded-lg hover:bg-cream"
                            title="History"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.product_id)}
                            className="p-1.5 text-secondary hover:text-red-600 rounded-lg hover:bg-cream"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONSUME MODAL */}
      {showConsumeModal && activeProduct && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-card border border-cream-muted space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-muted">
              <h3 className="font-bold text-charcoal text-base">Record Pantry Consumption</h3>
              <button onClick={() => setShowConsumeModal(false)} className="text-secondary hover:text-charcoal">✕</button>
            </div>
            
            <p className="text-xs text-secondary leading-relaxed">
              Consuming <span className="font-bold text-charcoal">{activeProduct.product_name}</span>. The system will deduct from earliest expiring batches first (FIFO) and log an audit movement.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">
                  Quantity to Consume ({activeProduct.default_unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={activeProduct.current_quantity}
                  value={consumeQty}
                  onChange={(e) => setConsumeQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal font-mono outline-none focus:border-orange bg-cream-light"
                />
                <span className="text-[10px] text-secondary mt-1 block">
                  Available in pantry: {activeProduct.current_quantity} {activeProduct.default_unit}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Usage Notes</label>
                <input
                  type="text"
                  value={consumeNotes}
                  onChange={(e) => setConsumeNotes(e.target.value)}
                  placeholder="e.g. Dinner cooking, family usage"
                  className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal outline-none focus:border-orange bg-cream-light"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-cream-muted flex gap-2">
              <button
                onClick={() => setShowConsumeModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-cream-muted text-xs font-semibold text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConsume}
                disabled={consumeLoading || consumeQty <= 0 || consumeQty > activeProduct.current_quantity}
                className="flex-1 py-2.5 rounded-xl bg-orange hover:bg-orange-dark text-white text-xs font-semibold disabled:opacity-60"
              >
                {consumeLoading ? 'Deducting...' : 'Confirm Consumption'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistoryModal && activeProduct && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-card border border-cream-muted space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-cream-muted">
              <div>
                <h3 className="font-bold text-charcoal text-base">Stock Movement Audit Trail</h3>
                <p className="text-[11px] text-secondary">{activeProduct.product_name} (ID #{activeProduct.product_id})</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-secondary hover:text-charcoal">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs">
              {historyLoading ? (
                <div className="py-8 text-center text-secondary">Querying `stock_movements` table...</div>
              ) : historyMovements.length === 0 ? (
                <div className="py-8 text-center text-secondary">No stock movement history recorded yet.</div>
              ) : (
                historyMovements.map((m) => (
                  <div key={m.movement_id} className="p-3 rounded-xl bg-cream-light border border-cream-muted flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.movement_type === 'PURCHASE' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange/15 text-orange-dark'
                        }`}>
                          {m.movement_type}
                        </span>
                        <span className="font-mono text-secondary text-[10px]">{new Date(m.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-secondary text-[11px] mt-1">{m.notes || 'Routine stock change'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono font-bold ${m.quantity_changed > 0 ? 'text-emerald-700' : 'text-orange-dark'}`}>
                        {m.quantity_changed > 0 ? `+${m.quantity_changed}` : m.quantity_changed}
                      </p>
                      <p className="text-[10px] text-secondary font-mono">Bal: {m.balance_after}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full py-2.5 rounded-xl bg-charcoal text-white text-xs font-semibold"
            >
              Close History
            </button>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-card border border-cream-muted space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-muted">
              <h3 className="font-bold text-charcoal text-base">Add New Grocery Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-secondary hover:text-charcoal">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basmati Rice, Ghee, Olive Oil"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal font-semibold outline-none focus:border-orange bg-cream-light"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Category</label>
                  <select
                    value={newProdCatId}
                    onChange={(e) => setNewProdCatId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal outline-none focus:border-orange bg-cream-light"
                  >
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Unit</label>
                  <select
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal outline-none focus:border-orange bg-cream-light"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="litre">litre</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pcs</option>
                    <option value="pack">pack</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Initial Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProdQty}
                    onChange={(e) => setNewProdQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal font-mono outline-none focus:border-orange bg-cream-light"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Min Threshold</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProdMinStock}
                    onChange={(e) => setNewProdMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal font-mono outline-none focus:border-orange bg-cream-light"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Storage Location</label>
                  <select
                    value={newProdLocation}
                    onChange={(e) => setNewProdLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal outline-none focus:border-orange bg-cream-light"
                  >
                    <option value="Pantry">Pantry</option>
                    <option value="Refrigerator">Refrigerator</option>
                    <option value="Freezer">Freezer</option>
                    <option value="Spice Rack">Spice Rack</option>
                    <option value="Kitchen Shelf">Kitchen Shelf</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal font-mono outline-none focus:border-orange bg-cream-light"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-cream-muted flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-cream-muted text-xs font-semibold text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-2.5 rounded-xl bg-orange hover:bg-orange-dark text-white text-xs font-semibold disabled:opacity-60"
                >
                  {addLoading ? 'Saving...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
