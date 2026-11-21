import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Check, 
  Trash2, 
  Plus, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  DollarSign, 
  Calendar, 
  Store, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { ExtractedItem, OCRScanResponse } from '../types';

interface ScanBillPageProps {
  onNavigate: (page: string) => void;
}

export const ScanBillPage: React.FC<ScanBillPageProps> = ({ onNavigate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Extracted Bill Form State
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [rawOcrText, setRawOcrText] = useState('');
  const [confidenceScore, setConfidenceScore] = useState<number>(0);
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [isScanned, setIsScanned] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setSuccessMsg(null);
    if (!selectedFile.type.match(/(image\/jpeg|image\/png|image\/webp|application\/pdf)/i)) {
      setError('Please upload a valid image (JPG, PNG, WEBP) or PDF invoice.');
      return;
    }
    setFile(selectedFile);
    const localUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(localUrl);
    // Auto-trigger OCR upload
    triggerOcr(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const triggerOcr = async (fileToScan: File) => {
    setOcrLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', fileToScan);

      const res: OCRScanResponse = await api.uploadBill(formData);
      const data = res.scan_data;

      setStoreName(data.store_name);
      setStoreAddress(data.store_address || '');
      setBillNumber(data.bill_number || `BILL-${Date.now().toString().slice(-6)}`);
      setPurchaseDate(data.purchase_date);
      setTotalAmount(data.total_amount);
      setTaxAmount(data.tax || 0);
      setDiscountAmount(data.discount || 0);
      setRawOcrText(data.raw_ocr_text);
      setConfidenceScore(data.confidence_score);
      setItems(data.items);
      setIsScanned(true);

      if (res.image_preview) {
        setPreviewUrl(res.image_preview);
      }
    } catch (err: any) {
      setError(err.message || 'OCR processing encountered an issue. You can still enter details manually.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleItemChange = (index: number, field: keyof ExtractedItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto recalculate line total
    if (field === 'quantity' || field === 'unit_price') {
      const q = field === 'quantity' ? Number(value) : updated[index].quantity;
      const p = field === 'unit_price' ? Number(value) : updated[index].unit_price;
      updated[index].line_total = Math.round(q * p * 100) / 100;
    }

    setItems(updated);
    
    // Recalculate grand total
    const newTotal = updated.reduce((acc, curr) => acc + (curr.line_total || 0), 0);
    setTotalAmount(Math.round(newTotal * 100) / 100);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        item_name: 'New Pantry Item',
        category_id: 11, // Other
        category_name: 'Other',
        quantity: 1.0,
        unit: 'kg',
        unit_price: 50.0,
        line_total: 50.0,
        confidence: 1.0,
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    const newTotal = updated.reduce((acc, curr) => acc + (curr.line_total || 0), 0);
    setTotalAmount(Math.round(newTotal * 100) / 100);
  };

  const handleConfirmAndSave = async () => {
    if (!storeName.trim()) {
      setError('Please provide a valid store name.');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one line item to record.');
      return;
    }

    setConfirmLoading(true);
    setError(null);

    try {
      const payload = {
        store_name: storeName,
        store_address: storeAddress,
        bill_number: billNumber,
        purchase_date: purchaseDate || new Date().toISOString().split('T')[0],
        total_amount: totalAmount,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        payment_method: 'UPI / Card',
        raw_ocr_text: rawOcrText,
        bill_image_base64: previewUrl,
        items: items.map(it => ({
          item_name: it.item_name,
          category_id: it.category_id || 11,
          quantity: it.quantity,
          unit: it.unit || 'kg',
          unit_price: it.unit_price,
          line_total: it.line_total,
          expiry_date: it.expiry_date || null,
          storage_location: it.storage_location || 'Pantry'
        }))
      };

      const res = await api.confirmBill(payload);
      setSuccessMsg(res.message || 'Bill confirmed, inventory updated & expense recorded in MySQL!');
      
      // Reset after short delay
      setTimeout(() => {
        onNavigate('inventory');
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to save bill transaction.');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-muted">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange">Computer Vision OCR Pipeline</span>
          <h1 className="font-serif text-3xl font-bold text-charcoal mt-1">Smart Grocery Bill Scanner</h1>
          <p className="text-xs text-secondary mt-1">
            Upload any supermarket receipt. Review OCR extracted text before atomic SQL commit.
          </p>
        </div>
        {isScanned && (
          <button
            onClick={() => {
              setIsScanned(false);
              setFile(null);
              setPreviewUrl(null);
            }}
            className="px-4 py-2 rounded-xl bg-white border border-cream-muted text-xs font-semibold text-secondary hover:text-charcoal hover:border-orange flex items-center gap-2 self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Scan Another Receipt</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold shadow-soft">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Zone when not yet scanned */}
      {!isScanned ? (
        <div className="max-w-3xl mx-auto py-12">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-cream-muted hover:border-orange rounded-3xl p-12 text-center bg-white hover:bg-cream-light/50 cursor-pointer transition-all duration-200 shadow-soft"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
            />
            
            <div className="w-16 h-16 rounded-2xl bg-orange/10 text-orange flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="font-serif text-xl font-bold text-charcoal mb-2">
              Drag & Drop your receipt here, or <span className="text-orange underline">browse file</span>
            </h3>
            <p className="text-xs text-secondary max-w-sm mx-auto mb-6">
              Supports supermarket bills, invoice slips, kirana store receipts (JPG, PNG, WEBP, or PDF up to 10MB).
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-secondary">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> OpenCV Preprocessed</span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-orange" /> Tesseract OCR</span>
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-charcoal" /> Saved as MySQL BLOB</span>
            </div>
          </div>

          {ocrLoading && (
            <div className="mt-8 text-center p-6 bg-cream-light rounded-2xl border border-cream-muted">
              <div className="w-8 h-8 border-3 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="font-bold text-charcoal text-sm">Processing bill with Computer Vision OCR...</p>
              <p className="text-xs text-secondary mt-1">Normalizing contrast, segmenting lines, and extracting grocery prices.</p>
            </div>
          )}
        </div>
      ) : (
        /* Side-by-side Confirmation Interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Bill Preview & Metadata (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-cream-muted shadow-card space-y-4 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-cream-muted">
              <span className="text-xs font-bold text-charcoal uppercase">Receipt Preview</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Confidence: {Math.round(confidenceScore * 100)}%
              </span>
            </div>

            {/* Image Preview Box */}
            <div className="rounded-xl overflow-hidden bg-cream-light border border-cream-muted max-h-96 flex items-center justify-center p-2">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Scanned Bill" 
                  className="max-h-80 w-auto object-contain rounded-lg shadow-sm"
                />
              ) : (
                <div className="py-16 text-center text-secondary text-xs">No image preview available</div>
              )}
            </div>

            {/* Bill Header Info Form */}
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Store / Supermarket</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-cream-muted focus:border-orange text-charcoal font-semibold outline-none bg-cream-light"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-cream-muted focus:border-orange text-charcoal font-mono outline-none bg-cream-light"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Bill / Invoice #</label>
                  <input
                    type="text"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-cream-muted focus:border-orange text-charcoal font-mono outline-none bg-cream-light"
                  />
                </div>
              </div>
            </div>

            {/* Raw OCR Text Expandable Toggle */}
            <details className="text-[11px] text-secondary">
              <summary className="cursor-pointer font-bold hover:text-orange">View Raw OCR Text Dump</summary>
              <pre className="mt-2 p-2 bg-cream-light rounded-lg border border-cream-muted text-[10px] font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                {rawOcrText}
              </pre>
            </details>
          </div>

          {/* RIGHT: Extracted Line Items & Confirmation (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-cream-muted shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-muted">
              <div>
                <h3 className="font-bold text-charcoal text-base">Extracted Line Items</h3>
                <p className="text-[11px] text-secondary">Review, edit, or adjust items before committing to MySQL.</p>
              </div>
              <button
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-lg bg-cream hover:bg-cream-muted text-xs font-semibold text-charcoal flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-orange" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cream-muted text-secondary font-bold uppercase text-[10px]">
                    <th className="py-2 px-2">Item Name</th>
                    <th className="py-2 px-2 w-20">Qty</th>
                    <th className="py-2 px-2 w-16">Unit</th>
                    <th className="py-2 px-2 w-24">Rate (₹)</th>
                    <th className="py-2 px-2 w-24">Total (₹)</th>
                    <th className="py-2 px-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-muted/50">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-cream-light/40">
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={it.item_name}
                          onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-cream-muted focus:border-orange text-xs text-charcoal font-semibold bg-white outline-none"
                        />
                        <span className="text-[10px] text-secondary mt-0.5 block">{it.category_name}</span>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0.1"
                          value={it.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-cream-muted focus:border-orange text-xs text-charcoal font-mono bg-white outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={it.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-cream-muted focus:border-orange text-xs text-charcoal font-mono bg-white outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={it.unit_price}
                          onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-cream-muted focus:border-orange text-xs text-charcoal font-mono bg-white outline-none"
                        />
                      </td>
                      <td className="py-2 px-2 font-bold text-charcoal font-mono text-sm">
                        ₹{it.line_total.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-secondary hover:text-red-600 rounded transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Breakdown */}
            <div className="pt-4 border-t border-cream-muted space-y-2 text-xs">
              <div className="flex justify-between text-secondary">
                <span>Items Subtotal:</span>
                <span className="font-mono text-charcoal font-semibold">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Estimated Tax (GST):</span>
                <span className="font-mono text-charcoal">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Discounts Applied:</span>
                <span className="font-mono text-emerald-700">-₹{discountAmount.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-cream-muted flex justify-between items-center text-sm font-bold text-charcoal">
                <span>Final Bill Amount:</span>
                <span className="font-serif text-2xl font-bold text-orange">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Final Action Button */}
            <div className="pt-4">
              <button
                onClick={handleConfirmAndSave}
                disabled={confirmLoading}
                className="w-full py-4 rounded-xl bg-orange hover:bg-orange-dark text-white font-semibold text-sm shadow-soft hover:shadow-card transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {confirmLoading ? (
                  <span>Executing ACID SQL Transaction...</span>
                ) : (
                  <>
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>Confirm & Commit to SQL Database</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-secondary mt-2">
                Commits to: `bills`, `purchases`, `purchase_items`, `products`, `inventory_batches`, `expenses`.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
