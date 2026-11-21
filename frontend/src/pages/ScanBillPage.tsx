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
  Store, 
  Calendar, 
  Barcode, 
  ShieldCheck, 
  Receipt,
  Camera,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { ExtractedItem, OCRScanResponse } from '../types';

interface ScanBillPageProps {
  onNavigate: (page: string) => void;
}

// Pre-packaged realistic demo receipt templates for 1-click live testing
const DEMO_RECEIPTS = [
  {
    id: 'dmart',
    name: 'DMart Supercenter',
    tag: 'Monthly Staples & Grains',
    location: 'Koramangala, Bengaluru',
    billNumber: 'DM-894210',
    date: new Date().toISOString().split('T')[0],
    subtotal: 1650.00,
    tax: 41.25,
    discount: 50.00,
    total: 1641.25,
    items: [
      { item_name: 'India Gate Basmati Rice', category_id: 4, category_name: 'Grains', quantity: 5.0, unit: 'kg', unit_price: 130.0, line_total: 650.0, confidence: 0.98, storage_location: 'Pantry' },
      { item_name: 'Aashirvaad Shudh Chakki Atta', category_id: 4, category_name: 'Grains', quantity: 10.0, unit: 'kg', unit_price: 48.0, line_total: 480.0, confidence: 0.96, storage_location: 'Pantry' },
      { item_name: 'Tata Sampann Toor Dal', category_id: 5, category_name: 'Pulses', quantity: 2.0, unit: 'kg', unit_price: 165.0, line_total: 330.0, confidence: 0.95, storage_location: 'Pantry' },
      { item_name: 'Fortune Sunlite Refined Oil', category_id: 11, category_name: 'Other', quantity: 1.0, unit: 'litre', unit_price: 140.0, line_total: 140.0, confidence: 0.94, storage_location: 'Pantry' },
      { item_name: 'Madhur Pure & Hygienic Sugar', category_id: 11, category_name: 'Other', quantity: 1.0, unit: 'kg', unit_price: 50.0, line_total: 50.0, confidence: 0.92, storage_location: 'Pantry' },
    ]
  },
  {
    id: 'natures_basket',
    name: "Nature's Basket Organic Mart",
    tag: 'Dairy & Fresh Produce',
    location: 'Indiranagar 100ft Rd, Bengaluru',
    billNumber: 'NB-73109',
    date: new Date().toISOString().split('T')[0],
    subtotal: 825.00,
    tax: 28.50,
    discount: 25.00,
    total: 828.50,
    items: [
      { item_name: 'Amul Taaza Homogenised Milk', category_id: 3, category_name: 'Dairy', quantity: 3.0, unit: 'litre', unit_price: 64.0, line_total: 192.0, confidence: 0.97, storage_location: 'Refrigerator' },
      { item_name: 'Fresh Malai Paneer', category_id: 3, category_name: 'Dairy', quantity: 400.0, unit: 'g', unit_price: 110.0, line_total: 110.0, confidence: 0.95, storage_location: 'Refrigerator' },
      { item_name: 'Organic Vine Tomatoes', category_id: 1, category_name: 'Vegetables', quantity: 1.5, unit: 'kg', unit_price: 45.0, line_total: 67.5, confidence: 0.93, storage_location: 'Refrigerator' },
      { item_name: 'Kashmiri Royal Delicious Apples', category_id: 2, category_name: 'Fruits', quantity: 1.5, unit: 'kg', unit_price: 180.0, line_total: 270.0, confidence: 0.96, storage_location: 'Refrigerator' },
      { item_name: 'Epigamia Greek Yogurt (Berry)', category_id: 3, category_name: 'Dairy', quantity: 3.0, unit: 'pack', unit_price: 60.0, line_total: 180.0, confidence: 0.91, storage_location: 'Refrigerator' },
    ]
  },
  {
    id: 'kirana',
    name: 'Sri Krishna Kirana & Spices',
    tag: 'Spices, Tea & Household',
    location: 'Malleshwaram, Bengaluru',
    billNumber: 'SK-5512',
    date: new Date().toISOString().split('T')[0],
    subtotal: 510.00,
    tax: 15.00,
    discount: 10.00,
    total: 515.00,
    items: [
      { item_name: 'Tata Tea Gold Leaf', category_id: 7, category_name: 'Beverages', quantity: 500.0, unit: 'g', unit_price: 310.0, line_total: 310.0, confidence: 0.98, storage_location: 'Pantry' },
      { item_name: 'Everest Turmeric Powder', category_id: 8, category_name: 'Spices', quantity: 200.0, unit: 'g', unit_price: 65.0, line_total: 65.0, confidence: 0.95, storage_location: 'Spice Rack' },
      { item_name: 'Everest Shahi Garam Masala', category_id: 8, category_name: 'Spices', quantity: 100.0, unit: 'g', unit_price: 85.0, line_total: 85.0, confidence: 0.94, storage_location: 'Spice Rack' },
      { item_name: 'Tata Salt Vacuum Evaporated', category_id: 8, category_name: 'Spices', quantity: 2.0, unit: 'kg', unit_price: 25.0, line_total: 50.0, confidence: 0.93, storage_location: 'Kitchen Shelf' },
    ]
  }
];

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
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setSuccessMsg(null);
    setActiveTemplateId(null);
    if (!selectedFile.type.match(/(image\/jpeg|image\/png|image\/webp|application\/pdf)/i)) {
      setError('Please upload a valid image (JPG, PNG, WEBP) or PDF invoice.');
      return;
    }
    setFile(selectedFile);
    const localUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(localUrl);
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
      setError(err.message || 'OCR processing encountered an issue. You can still review or enter details.');
    } finally {
      setOcrLoading(false);
    }
  };

  const loadDemoTemplate = (tpl: typeof DEMO_RECEIPTS[0]) => {
    setActiveTemplateId(tpl.id);
    setStoreName(tpl.name);
    setStoreAddress(tpl.location);
    setBillNumber(tpl.billNumber);
    setPurchaseDate(tpl.date);
    setTaxAmount(tpl.tax);
    setDiscountAmount(tpl.discount);
    setTotalAmount(tpl.total);
    setConfidenceScore(0.96);
    setItems(tpl.items as any);
    setRawOcrText(
      `${tpl.name.toUpperCase()}\n${tpl.location}\nGSTIN: 29AABCU9603R1ZM\nBill No: ${tpl.billNumber}\nDate: ${tpl.date}\n` +
      `-----------------------------------------\n` +
      tpl.items.map(it => `${it.item_name.padEnd(24)} ${it.quantity} ${it.unit} @ ₹${it.unit_price} = ₹${it.line_total}`).join('\n') +
      `\n-----------------------------------------\nSUBTOTAL: ₹${tpl.subtotal}\nTAX: ₹${tpl.tax}\nDISCOUNT: -₹${tpl.discount}\nTOTAL: ₹${tpl.total}`
    );
    setPreviewUrl(null); // Displays realistic thermal paper preview on the left
    setIsScanned(true);
    setError(null);
    setSuccessMsg(`Loaded ${tpl.name} sample bill! Review the extracted items below.`);
  };

  const handleItemChange = (index: number, field: keyof ExtractedItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      const q = field === 'quantity' ? Number(value) : updated[index].quantity;
      const p = field === 'unit_price' ? Number(value) : updated[index].unit_price;
      updated[index].line_total = Math.round(q * p * 100) / 100;
    }

    setItems(updated);
    const newTotal = updated.reduce((acc, curr) => acc + (curr.line_total || 0), 0) + taxAmount - discountAmount;
    setTotalAmount(Math.round(newTotal * 100) / 100);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        item_name: 'Pantry Essential Item',
        category_id: 11,
        category_name: 'Other',
        quantity: 1.0,
        unit: 'kg',
        unit_price: 50.0,
        line_total: 50.0,
        confidence: 1.0,
        storage_location: 'Pantry'
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    const newTotal = updated.reduce((acc, curr) => acc + (curr.line_total || 0), 0) + taxAmount - discountAmount;
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
      
      setTimeout(() => {
        onNavigate('inventory');
      }, 1600);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange/15 text-orange text-xs font-bold uppercase tracking-wider mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>Computer Vision OCR & Ingestion Pipeline</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">Smart Grocery Bill Scanner</h1>
          <p className="text-xs text-secondary mt-1">
            Capture or drop any supermarket receipt. Review OCR extracted text before atomic SQL commit.
          </p>
        </div>

        {isScanned && (
          <button
            onClick={() => {
              setIsScanned(false);
              setFile(null);
              setPreviewUrl(null);
              setActiveTemplateId(null);
            }}
            className="px-4 py-2.5 rounded-xl bg-white border border-cream-muted text-xs font-semibold text-secondary hover:text-charcoal hover:border-orange flex items-center gap-2 self-start shadow-soft transition-all"
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

      {/* Main Interactive Screen */}
      {!isScanned ? (
        <div className="space-y-8">
          
          {/* Quick Demo Receipt Templates Bar */}
          <div className="bg-gradient-to-r from-cream-light via-white to-cream-light p-5 rounded-2xl border border-cream-muted shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange" />
                <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                  Test Instantly with Realistic Sample Receipts
                </span>
              </div>
              <span className="text-[11px] text-secondary">Click any receipt to preview OCR workflow</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DEMO_RECEIPTS.map((demo) => (
                <div
                  key={demo.id}
                  onClick={() => loadDemoTemplate(demo)}
                  className="p-3.5 rounded-xl bg-white hover:bg-orange/5 border border-cream-muted hover:border-orange cursor-pointer transition-all duration-200 shadow-sm hover:shadow-soft group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-charcoal text-xs group-hover:text-orange transition-colors">
                      {demo.name}
                    </span>
                    <span className="text-xs font-bold font-serif text-charcoal">₹{demo.total.toFixed(0)}</span>
                  </div>
                  <p className="text-[11px] text-secondary">{demo.tag}</p>
                  <div className="mt-2.5 pt-2 border-t border-cream-muted/60 flex items-center justify-between text-[10px] text-secondary font-mono">
                    <span>{demo.items.length} line items</span>
                    <span className="text-orange font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Inspect <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="max-w-3xl mx-auto">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cream-muted hover:border-orange rounded-3xl p-12 text-center bg-white hover:bg-cream-light/50 cursor-pointer transition-all duration-300 shadow-soft group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
              />
              
              <div className="w-16 h-16 rounded-2xl bg-orange/10 text-orange flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal mb-2">
                Drag & Drop receipt photo, or <span className="text-orange underline">browse file</span>
              </h3>
              <p className="text-xs text-secondary max-w-sm mx-auto mb-6 leading-relaxed">
                Supports camera photos, DMart slips, grocery bills, invoices (JPG, PNG, WEBP, or PDF up to 10MB).
              </p>

              <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] text-secondary">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> OpenCV Preprocessed</span>
                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-orange" /> Tesseract Multi-Language</span>
                <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-charcoal" /> Preserved in MySQL BLOB</span>
              </div>
            </div>

            {ocrLoading && (
              <div className="mt-8 text-center p-8 bg-cream-light rounded-2xl border border-cream-muted">
                <div className="w-9 h-9 border-3 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="font-bold text-charcoal text-sm">Extracting bill line items via Computer Vision...</p>
                <p className="text-xs text-secondary mt-1">Normalizing contrast, segmenting lines, and mapping grocery catalog.</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Side-by-side Confirmation Screen */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Realistic Thermal Paper Receipt Mockup (5 cols) */}
          <div className="lg:col-span-5 space-y-4 sticky top-24">
            
            {/* Visual Thermal Receipt Card */}
            <div className="bg-[#FAF8F5] rounded-xl p-5 border border-cream-muted shadow-card relative font-mono text-xs text-charcoal select-none overflow-hidden">
              {/* Serrated zigzag edge at top */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-cream-muted/40 [mask-image:radial-gradient(circle,transparent_4px,black_4.5px)] [mask-size:10px_10px]"></div>

              {/* Receipt Header */}
              <div className="text-center pb-4 border-b border-dashed border-charcoal/30 pt-2 space-y-1">
                <div className="w-8 h-8 rounded-full bg-charcoal text-white flex items-center justify-center mx-auto mb-1">
                  <Receipt className="w-4 h-4 text-orange" />
                </div>
                <h2 className="font-bold text-sm tracking-wider uppercase">{storeName || 'SUPERMARKET'}</h2>
                <p className="text-[10px] text-secondary">{storeAddress || 'Retail Store Location'}</p>
                <div className="flex justify-between text-[10px] text-secondary pt-2">
                  <span>BILL: {billNumber}</span>
                  <span>DATE: {purchaseDate}</span>
                </div>
              </div>

              {/* Physical Receipt Photo Preview (if uploaded) */}
              {previewUrl && (
                <div className="my-3 p-2 bg-white rounded-lg border border-cream-muted max-h-48 overflow-hidden flex items-center justify-center">
                  <img src={previewUrl} alt="Bill Preview" className="max-h-44 object-contain rounded" />
                </div>
              )}

              {/* Thermal Receipt Line Items */}
              <div className="py-3 space-y-1.5 border-b border-dashed border-charcoal/30 text-[11px]">
                <div className="flex justify-between font-bold text-[10px] uppercase text-secondary pb-1">
                  <span>ITEM / QTY</span>
                  <span>AMOUNT (₹)</span>
                </div>
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate max-w-[200px]">{it.item_name} ({it.quantity} {it.unit})</span>
                    <span className="font-bold">₹{it.line_total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Financial Totals on Receipt */}
              <div className="py-3 space-y-1 text-[11px]">
                <div className="flex justify-between text-secondary">
                  <span>SUBTOTAL:</span>
                  <span>₹{(totalAmount - taxAmount + discountAmount).toFixed(2)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-secondary">
                    <span>GST TAX:</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>DISCOUNT:</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-charcoal/40 flex justify-between text-sm font-bold text-charcoal">
                  <span>NET TOTAL:</span>
                  <span className="text-orange font-bold">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Barcode Mockup */}
              <div className="pt-3 border-t border-dashed border-charcoal/30 text-center">
                <Barcode className="w-full h-8 text-charcoal/60 mx-auto" />
                <span className="text-[9px] text-secondary tracking-widest uppercase">*** THANK YOU FOR SHOPPING ***</span>
              </div>
            </div>

            {/* Confidence & Storage Badge */}
            <div className="p-3.5 rounded-xl bg-white border border-cream-muted text-xs space-y-1.5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-secondary font-semibold">OCR Confidence:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  {Math.round(confidenceScore * 100)}% High Accuracy
                </span>
              </div>
              <div className="flex items-center justify-between text-secondary">
                <span>Database Storage:</span>
                <span className="font-mono text-charcoal text-[11px]">`bills.bill_image_blob`</span>
              </div>
            </div>

          </div>

          {/* RIGHT: Editable Extraction Grid & Review (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-cream-muted shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-cream-muted">
              <div>
                <h3 className="font-bold text-charcoal text-base">Extracted Products Table</h3>
                <p className="text-xs text-secondary">
                  Review & correct any details before saving into normalized SQL tables.
                </p>
              </div>
              <button
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-xl bg-cream hover:bg-cream-muted text-xs font-semibold text-charcoal flex items-center gap-1.5 self-start transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-orange" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Receipt Metadata Editable Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-cream-light rounded-xl border border-cream-muted text-xs">
              <div>
                <label className="block text-[10px] font-bold text-secondary uppercase mb-1">Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-cream-muted font-bold text-charcoal outline-none focus:border-orange bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-secondary uppercase mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-cream-muted font-mono text-charcoal outline-none focus:border-orange bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-secondary uppercase mb-1">Bill Number</label>
                <input
                  type="text"
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-cream-muted font-mono text-charcoal outline-none focus:border-orange bg-white"
                />
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cream-muted text-secondary font-bold uppercase text-[10px] bg-cream-light/40">
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-2 w-20">Qty</th>
                    <th className="py-2.5 px-2 w-16">Unit</th>
                    <th className="py-2.5 px-2 w-24">Rate (₹)</th>
                    <th className="py-2.5 px-3 w-24">Line Total</th>
                    <th className="py-2.5 px-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-muted/50">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-cream-light/30">
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={it.item_name}
                          onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-cream-muted focus:border-orange text-xs text-charcoal font-semibold bg-white outline-none"
                        />
                        <span className="text-[10px] text-secondary mt-0.5 block">{it.category_name}</span>
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0.1"
                          value={it.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-cream-muted focus:border-orange text-xs text-charcoal font-mono bg-white outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <select
                          value={it.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-1 py-1.5 rounded border border-cream-muted focus:border-orange text-xs text-charcoal font-mono bg-white outline-none"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="litre">litre</option>
                          <option value="ml">ml</option>
                          <option value="pack">pack</option>
                          <option value="pcs">pcs</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={it.unit_price}
                          onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-cream-muted focus:border-orange text-xs text-charcoal font-mono bg-white outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-bold text-charcoal font-mono text-sm">
                        ₹{it.line_total.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-secondary hover:text-red-600 rounded"
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

            {/* Financial Summary */}
            <div className="pt-4 border-t border-cream-muted flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1 text-secondary">
                <div className="flex gap-4">
                  <span>Items: {items.length}</span>
                  <span>Tax: ₹{taxAmount.toFixed(2)}</span>
                  <span>Discount: ₹{discountAmount.toFixed(2)}</span>
                </div>
                <p className="text-[10px]">All records committed with ACID consistency.</p>
              </div>

              <div className="text-right">
                <span className="text-secondary text-[11px] block">Final Bill Total:</span>
                <span className="font-serif text-3xl font-bold text-orange">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Confirmation CTA */}
            <div className="pt-2">
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
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
