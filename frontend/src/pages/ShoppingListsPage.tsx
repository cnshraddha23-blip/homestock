import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Sparkles, 
  Calendar, 
  Check, 
  Trash2, 
  RotateCcw, 
  DollarSign, 
  Layers, 
  SlidersHorizontal,
  PlusCircle,
  Tag,
  Printer,
  Copy,
  CheckCircle2,
  AlertCircle,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { MonthlyGroceryList, GroceryListItem, RecurringItem, Category } from '../types';

interface ShoppingListsPageProps {
  onNavigate: (page: string) => void;
}

export const ShoppingListsPage: React.FC<ShoppingListsPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'lists' | 'recurring'>('lists');
  const [lists, setLists] = useState<MonthlyGroceryList[]>([]);
  const [currentList, setCurrentList] = useState<MonthlyGroceryList | null>(null);
  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // New item modal
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCatId, setNewItemCatId] = useState<number>(4);
  const [newItemQty, setNewItemQty] = useState<number>(2.0);
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemPrice, setNewItemPrice] = useState<number>(100.0);

  // New recurring modal
  const [showAddRecurringModal, setShowAddRecurringModal] = useState(false);
  const [newRecName, setNewRecName] = useState('');
  const [newRecCatId, setNewRecCatId] = useState<number>(4);
  const [newRecQty, setNewRecQty] = useState<number>(5.0);
  const [newRecUnit, setNewRecUnit] = useState('kg');
  const [newRecPriority, setNewRecPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listsData, recData, catsData] = await Promise.all([
        api.getShoppingLists(),
        api.getRecurringItems(),
        api.getCategories()
      ]);
      setLists(listsData);
      setRecurringItems(recData);
      setCategories(catsData);
      if (listsData.length > 0 && !currentList) {
        setCurrentList(listsData[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateMonthly = async () => {
    setGenerating(true);
    try {
      const generated = await api.generateMonthlyList({});
      await fetchData();
      setCurrentList(generated);
    } catch (err: any) {
      alert(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleTogglePurchased = async (item: GroceryListItem) => {
    try {
      const updated = await api.updateListItem(item.list_item_id, {
        is_purchased: !item.is_purchased,
        is_skipped: false
      });
      if (currentList) {
        const updatedItems = currentList.items.map(it => 
          it.list_item_id === item.list_item_id ? updated : it
        );
        setCurrentList({ ...currentList, items: updatedItems });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleSkipped = async (item: GroceryListItem) => {
    try {
      const updated = await api.updateListItem(item.list_item_id, {
        is_skipped: !item.is_skipped,
        is_purchased: false
      });
      if (currentList) {
        const updatedItems = currentList.items.map(it => 
          it.list_item_id === item.list_item_id ? updated : it
        );
        setCurrentList({ ...currentList, items: updatedItems });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await api.deleteListItem(itemId);
      if (currentList) {
        const filtered = currentList.items.filter(it => it.list_item_id !== itemId);
        setCurrentList({ ...currentList, items: filtered });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateListItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentList) return;
    try {
      const newItem = await api.addListItem(currentList.list_id, {
        item_name: newItemName,
        category_id: newItemCatId,
        target_quantity: newItemQty,
        unit: newItemUnit,
        estimated_price: newItemPrice
      });
      setCurrentList({
        ...currentList,
        items: [...currentList.items, newItem],
        total_estimated_cost: currentList.total_estimated_cost + (newItemQty * newItemPrice)
      });
      setShowAddItemModal(false);
      setNewItemName('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addRecurringItem({
        item_name: newRecName,
        category_id: newRecCatId,
        preferred_monthly_quantity: newRecQty,
        unit: newRecUnit,
        priority: newRecPriority
      });
      setShowAddRecurringModal(false);
      setNewRecName('');
      const updatedRec = await api.getRecurringItems();
      setRecurringItems(updatedRec);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteRecurring = async (id: number) => {
    if (!confirm('Remove this essential from recurring monthly planning template?')) return;
    try {
      await api.deleteRecurringItem(id);
      setRecurringItems(recurringItems.filter(r => r.recurring_id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCopyChecklist = () => {
    if (!currentList) return;
    const textLines = [
      `🛒 HomeStock Grocery Checklist: ${currentList.list_name}`,
      `Total Items: ${currentList.items.length} | Est. Cost: ₹${currentList.total_estimated_cost.toFixed(2)}`,
      `----------------------------------------`,
      ...currentList.items.map(
        it => `${it.is_purchased ? '✅' : it.is_skipped ? '⏭️' : '◻️'} ${it.item_name} - ${it.target_quantity} ${it.unit} (₹${it.estimated_price * it.target_quantity})`
      )
    ].join('\n');

    navigator.clipboard.writeText(textLines);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handlePrintList = () => {
    window.print();
  };

  // Filter current list items
  const filteredListItems = currentList?.items.filter(item => {
    if (selectedCategory === 'ALL') return true;
    return item.category_name === selectedCategory;
  }) || [];

  const purchasedCount = currentList?.items.filter(i => i.is_purchased).length || 0;
  const totalCount = currentList?.items.length || 0;
  const progressPct = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-muted">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange">Personalized Monthly Shopping Engine</span>
          <h1 className="font-serif text-3xl font-bold text-charcoal mt-1">Smart Grocery Planning</h1>
          <p className="text-xs text-secondary mt-1">
            Generates your monthly market checklist based on recurring essentials, current pantry deficits & low stock.
          </p>
        </div>

        <button
          onClick={handleGenerateMonthly}
          disabled={generating}
          className="px-5 py-2.5 rounded-xl bg-orange hover:bg-orange-dark text-white font-semibold text-xs shadow-soft transition-all flex items-center gap-2 disabled:opacity-60 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 stroke-[2.2]" />
          <span>{generating ? 'Calculating Deficits...' : 'Auto-Generate Monthly List'}</span>
        </button>
      </div>

      {/* Tabs Switcher: Active Monthly List vs Recurring Essentials Template */}
      <div className="flex items-center gap-2 border-b border-cream-muted">
        <button
          onClick={() => setActiveTab('lists')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'lists' ? 'border-orange text-orange' : 'border-transparent text-secondary hover:text-charcoal'
          }`}
        >
          Monthly Grocery Lists ({lists.length})
        </button>
        <button
          onClick={() => setActiveTab('recurring')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'recurring' ? 'border-orange text-orange' : 'border-transparent text-secondary hover:text-charcoal'
          }`}
        >
          Recurring Essentials Template ({recurringItems.length})
        </button>
      </div>

      {/* ========================================================
          TAB 1: MONTHLY GROCERY LISTS
          ======================================================== */}
      {activeTab === 'lists' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Lists Selector Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-cream-muted shadow-soft space-y-3">
            <span className="text-xs font-bold text-charcoal uppercase block mb-2">Saved Grocery Plans</span>
            {lists.length === 0 ? (
              <div className="py-6 text-center text-xs text-secondary">
                No monthly lists generated yet. Click "Auto-Generate Monthly List" above!
              </div>
            ) : (
              lists.map((l) => (
                <div
                  key={l.list_id}
                  onClick={() => setCurrentList(l)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    currentList?.list_id === l.list_id 
                      ? 'bg-orange/10 border-orange shadow-sm' 
                      : 'bg-cream-light border-cream-muted hover:border-orange/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-charcoal text-xs">{l.list_name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-secondary">
                      {l.items.filter(i => i.is_purchased).length}/{l.items.length} Bought
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-secondary">
                    <span>Est. Cost: ₹{l.total_estimated_cost.toFixed(2)}</span>
                    <span className="font-mono">{new Date(l.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Active Checklist Details (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-cream-muted shadow-card space-y-5">
            {currentList ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cream-muted">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-charcoal text-lg">{currentList.list_name}</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange/10 text-orange-dark border border-orange/20">
                        {currentList.items.length} Items Planned
                      </span>
                    </div>
                    <p className="text-xs text-secondary font-mono mt-1">
                      Estimated Outgo: <span className="font-bold text-charcoal">₹{currentList.total_estimated_cost.toFixed(2)}</span> • {purchasedCount} marked bought
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleCopyChecklist}
                      className="px-3 py-1.5 rounded-lg border border-cream-muted hover:border-orange/40 bg-cream-light text-xs font-semibold text-charcoal flex items-center gap-1.5 transition-colors"
                      title="Copy text checklist for WhatsApp / SMS"
                    >
                      {copiedNotification ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-secondary" />
                          <span>Copy List</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handlePrintList}
                      className="px-3 py-1.5 rounded-lg border border-cream-muted hover:border-orange/40 bg-cream-light text-xs font-semibold text-charcoal flex items-center gap-1.5 transition-colors"
                      title="Print physical paper checklist"
                    >
                      <Printer className="w-3.5 h-3.5 text-secondary" />
                      <span>Print</span>
                    </button>

                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-orange hover:bg-orange-dark text-white text-xs font-semibold flex items-center gap-1.5 shadow-soft transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar of Purchased Items */}
                <div className="p-3.5 rounded-xl bg-cream-light border border-cream-muted">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-charcoal flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-orange" />
                      <span>Market Shopping Progress</span>
                    </span>
                    <span className="font-bold text-orange font-mono">{progressPct}% Complete ({purchasedCount}/{totalCount})</span>
                  </div>
                  <div className="w-full bg-cream-muted h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-orange h-full rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Category Filters */}
                {categories.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <span className="text-[11px] font-bold text-secondary flex items-center gap-1 mr-1">
                      <Filter className="w-3 h-3" /> Filter:
                    </span>
                    <button
                      onClick={() => setSelectedCategory('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        selectedCategory === 'ALL'
                          ? 'bg-charcoal text-white'
                          : 'bg-cream-light text-secondary hover:text-charcoal border border-cream-muted'
                      }`}
                    >
                      All ({currentList.items.length})
                    </button>
                    {categories.map(cat => {
                      const count = currentList.items.filter(i => i.category_name === cat.name).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={cat.category_id}
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                            selectedCategory === cat.name
                              ? 'bg-orange text-white'
                              : 'bg-cream-light text-secondary hover:text-charcoal border border-cream-muted'
                          }`}
                        >
                          {cat.name} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Items Checklist Table */}
                <div className="space-y-2">
                  {filteredListItems.length === 0 ? (
                    <div className="py-8 text-center text-xs text-secondary">
                      No items found for this category filter.
                    </div>
                  ) : (
                    filteredListItems.map((it) => (
                      <div
                        key={it.list_item_id}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
                          it.is_purchased 
                            ? 'bg-emerald-50/70 border-emerald-200 opacity-80' 
                            : it.is_skipped
                            ? 'bg-gray-100 border-gray-200 line-through text-secondary'
                            : 'bg-white border-cream-muted hover:border-orange/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleTogglePurchased(it)}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                              it.is_purchased 
                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                : 'border-cream-muted hover:border-orange bg-white'
                            }`}
                            title="Mark as purchased"
                          >
                            {it.is_purchased && <Check className="w-4 h-4 stroke-[3]" />}
                          </button>
                          <div>
                            <p className={`font-bold text-charcoal text-sm ${it.is_purchased ? 'line-through text-secondary' : ''}`}>
                              {it.item_name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-semibold text-secondary">
                                {it.notes || it.category_name || 'Household Essential'}
                              </span>
                              {it.category_name && (
                                <span className="px-1.5 py-0.5 rounded bg-cream text-[9px] font-bold text-charcoal">
                                  {it.category_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="font-bold text-charcoal font-mono text-xs block">
                              {it.target_quantity} {it.unit}
                            </span>
                            <span className="text-[10px] text-secondary">
                              ₹{(it.estimated_price * it.target_quantity).toFixed(2)} (@ ₹{it.estimated_price}/u)
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleSkipped(it)}
                              className="px-2 py-1 rounded text-[10px] font-semibold border border-cream-muted hover:bg-cream text-secondary"
                              title="Skip for next month"
                            >
                              {it.is_skipped ? 'Unskip' : 'Skip'}
                            </button>
                            <button
                              onClick={() => handleDeleteItem(it.list_item_id)}
                              className="p-1 text-secondary hover:text-red-600 rounded"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-xs text-secondary">
                Select a list on the left or generate a new monthly list.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 2: RECURRING ESSENTIALS TEMPLATE
          ======================================================== */}
      {activeTab === 'recurring' && (
        <div className="bg-white rounded-2xl p-6 border border-cream-muted shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-muted">
            <div>
              <h2 className="font-bold text-charcoal text-lg">Household Recurring Essentials Template</h2>
              <p className="text-xs text-secondary mt-1">
                Feed your household's monthly staples here. HomeStock evaluates these every month against your active inventory.
              </p>
            </div>
            <button
              onClick={() => setShowAddRecurringModal(true)}
              className="px-4 py-2 rounded-xl bg-orange hover:bg-orange-dark text-white text-xs font-semibold flex items-center gap-2 self-start"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Essential Staple</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recurringItems.map((r) => (
              <div key={r.recurring_id} className="p-4 rounded-xl bg-cream-light border border-cream-muted flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-secondary">{r.category_name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.priority === 'HIGH' ? 'bg-orange/15 text-orange-dark' : 'bg-cream text-secondary'
                    }`}>
                      {r.priority} Priority
                    </span>
                  </div>
                  <h3 className="font-bold text-charcoal text-base">{r.item_name}</h3>
                  <p className="text-xs font-mono text-charcoal font-semibold mt-1">
                    Target: {r.preferred_monthly_quantity} {r.unit} / month
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-cream-muted flex justify-between items-center text-xs">
                  <span className="text-emerald-700 text-[10px] font-bold">Template Active</span>
                  <button
                    onClick={() => handleDeleteRecurring(r.recurring_id)}
                    className="text-secondary hover:text-red-600 p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD LIST ITEM MODAL */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-card border border-cream-muted space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-muted">
              <h3 className="font-bold text-charcoal text-base">Add Item to Shopping Plan</h3>
              <button onClick={() => setShowAddItemModal(false)} className="text-secondary hover:text-charcoal">✕</button>
            </div>

            <form onSubmit={handleCreateListItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Groundnut Oil, Sunflower Seeds"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal font-semibold outline-none focus:border-orange bg-cream-light"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Target Qty</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal font-mono outline-none focus:border-orange bg-cream-light"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Unit</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
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

              <div>
                <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Expected Rate (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal font-mono outline-none focus:border-orange bg-cream-light"
                />
              </div>

              <div className="pt-3 border-t border-cream-muted flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-cream-muted text-xs font-semibold text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange hover:bg-orange-dark text-white text-xs font-semibold"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD RECURRING STAPLE MODAL */}
      {showAddRecurringModal && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-card border border-cream-muted space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-muted">
              <h3 className="font-bold text-charcoal text-base">Add Recurring Monthly Staple</h3>
              <button onClick={() => setShowAddRecurringModal(false)} className="text-secondary hover:text-charcoal">✕</button>
            </div>

            <form onSubmit={handleCreateRecurring} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Staple Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basmati Rice, Milk, Cooking Oil"
                  value={newRecName}
                  onChange={(e) => setNewRecName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal font-semibold outline-none focus:border-orange bg-cream-light"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Monthly Preferred Qty</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={newRecQty}
                    onChange={(e) => setNewRecQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal font-mono outline-none focus:border-orange bg-cream-light"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Unit</label>
                  <select
                    value={newRecUnit}
                    onChange={(e) => setNewRecUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal outline-none focus:border-orange bg-cream-light"
                  >
                    <option value="kg">kg</option>
                    <option value="litre">litre</option>
                    <option value="pack">pack</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Category</label>
                  <select
                    value={newRecCatId}
                    onChange={(e) => setNewRecCatId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal outline-none focus:border-orange bg-cream-light"
                  >
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Priority</label>
                  <select
                    value={newRecPriority}
                    onChange={(e) => setNewRecPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal outline-none focus:border-orange bg-cream-light"
                  >
                    <option value="HIGH">HIGH (Essential)</option>
                    <option value="MEDIUM">MEDIUM (Regular)</option>
                    <option value="LOW">LOW (Optional)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-cream-muted flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRecurringModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-cream-muted text-xs font-semibold text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange hover:bg-orange-dark text-white text-xs font-semibold"
                >
                  Save to Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
