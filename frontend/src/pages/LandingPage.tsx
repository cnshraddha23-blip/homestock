import React from 'react';
import { 
  ArrowRight, 
  ScanLine, 
  Boxes, 
  AlertTriangle, 
  CheckSquare, 
  TrendingUp, 
  ShieldCheck, 
  Database, 
  Camera, 
  Sparkles, 
  Receipt, 
  Clock, 
  Calendar,
  Layers,
  ChevronRight,
  Package
} from 'lucide-react';
import { ThreeParticles } from '../components/ThreeParticles';
import { ScrollReveal } from '../components/ScrollReveal';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="relative overflow-hidden bg-cream min-h-screen text-charcoal">
      
      {/* ========================================================
          SECTION 1: HERO SECTION
          ======================================================== */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        {/* Interactive 3D Particle Canvas */}
        <ThreeParticles className="absolute inset-0 pointer-events-none z-0" particleCount={160} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            
            <ScrollReveal direction="down" delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-muted/60 border border-cream-muted text-charcoal text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-orange" />
                <span>Next-Gen Household DBMS Architecture</span>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-charcoal leading-[1.1] mb-6">
                Your Home, Your Groceries, <br />
                <span className="text-orange italic font-normal">Under Control.</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3}>
              <p className="text-lg sm:text-xl text-secondary leading-relaxed mb-8 max-w-2xl mx-auto">
                Manage your groceries intelligently. Scan bills, monitor inventory, prevent expiry waste and understand every rupee you spend.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.4}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => onNavigate('register')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-orange hover:bg-orange-dark text-white font-semibold text-base shadow-card hover:shadow-float transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  Start Managing
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
                <a
                  href="#features"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cream-light hover:bg-white text-charcoal border border-cream-muted font-semibold text-base shadow-soft transition-all duration-200 text-center"
                >
                  Explore Features
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Interactive Floating Grocery Hero Graphic */}
          <ScrollReveal direction="up" delay={0.5} distance={40}>
            <div className="relative max-w-4xl mx-auto mt-10">
              <div className="relative rounded-2xl bg-gradient-to-b from-cream-light to-white p-4 sm:p-6 shadow-card border border-cream-muted/90">
                
                {/* Mockup Dashboard Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-cream-muted/60 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                    <span className="ml-3 text-xs font-mono text-secondary">homestock.internal/dbms-dashboard</span>
                  </div>
                  <div className="text-xs font-semibold text-orange bg-orange/10 px-3 py-1 rounded-full">
                    Live SQL Transactions Active
                  </div>
                </div>

                {/* Dashboard Snapshot Preview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Bill OCR preview */}
                  <div className="rounded-xl p-4 bg-cream/70 border border-cream-muted flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-charcoal uppercase tracking-wider">Supermarket Receipt</span>
                        <Receipt className="w-4 h-4 text-orange" />
                      </div>
                      <div className="text-xs text-secondary space-y-1 font-mono">
                        <div className="flex justify-between"><span>Basmati Rice (5kg)</span><span className="font-bold text-charcoal">₹600.00</span></div>
                        <div className="flex justify-between"><span>Amul Taza Milk (2L)</span><span className="font-bold text-charcoal">₹128.00</span></div>
                        <div className="flex justify-between"><span>Toor Dal (1kg)</span><span className="font-bold text-charcoal">₹165.00</span></div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-cream-muted flex justify-between items-center text-xs">
                      <span className="font-bold text-charcoal">Total Amount</span>
                      <span className="font-bold text-orange text-sm">₹893.00</span>
                    </div>
                  </div>

                  {/* Card 2: Expiry alert */}
                  <div className="rounded-xl p-4 bg-cream/70 border border-cream-muted flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-charcoal uppercase tracking-wider">Expiry Monitor</span>
                        <Clock className="w-4 h-4 text-orange" />
                      </div>
                      <div className="space-y-2">
                        <div className="p-2 rounded-lg bg-orange/10 border border-orange/20 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-charcoal">Amul Milk (Batch #01)</p>
                            <p className="text-[10px] text-secondary">Expires in 2 days</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange text-white">Critical</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white/60 border border-cream-muted flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-charcoal">Fresh Malai Paneer</p>
                            <p className="text-[10px] text-secondary">Expires in 5 days</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">Notice</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] text-secondary">Zero food waste tracking via batch FIFO</p>
                  </div>

                  {/* Card 3: Monthly Expenses */}
                  <div className="rounded-xl p-4 bg-cream/70 border border-cream-muted flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-charcoal uppercase tracking-wider">Monthly Spend</span>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-2xl font-bold text-charcoal font-serif">₹5,420.00</p>
                      <p className="text-xs text-secondary mb-3">Target Budget: ₹6,500.00</p>
                      <div className="w-full bg-cream-muted rounded-full h-2">
                        <div className="bg-orange h-2 rounded-full" style={{ width: '83%' }}></div>
                      </div>
                    </div>
                    <div className="text-[11px] text-secondary flex justify-between mt-3 pt-2 border-t border-cream-muted">
                      <span>Remaining</span>
                      <span className="font-bold text-emerald-700">₹1,080.00 left</span>
                    </div>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="hidden sm:flex absolute -top-5 -left-5 bg-white px-4 py-2 rounded-xl shadow-card border border-cream-muted items-center gap-2">
                  <Camera className="w-4 h-4 text-orange" />
                  <span className="text-xs font-bold text-charcoal">Instant OCR Ingestion</span>
                </div>
                <div className="hidden sm:flex absolute -bottom-4 -right-4 bg-white px-4 py-2 rounded-xl shadow-card border border-cream-muted items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-charcoal">100% MySQL Relational Engine</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========================================================
          SECTION 2: SMART GROCERY MANAGEMENT
          ======================================================== */}
      <section id="features" className="py-24 bg-cream-light border-y border-cream-muted/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-orange">Engineered For Modern Homes</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-2">
              Transforming chaos into structured household precision.
            </h2>
            <p className="text-secondary text-base mt-4">
              Traditional grocery tracking relies on forgotten paper notes or generic spreadsheets. HomeStock automates every step with relational database integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delay={0.1}>
              <div className="p-8 rounded-2xl bg-cream border border-cream-muted hover:border-orange/40 transition-all duration-300 hover:shadow-card group">
                <div className="w-12 h-12 rounded-xl bg-orange/15 text-orange flex items-center justify-center mb-6 group-hover:bg-orange group-hover:text-white transition-colors">
                  <ScanLine className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-charcoal mb-3">Intelligent OCR Scanning</h3>
                <p className="text-secondary text-sm leading-relaxed">
                  Capture physical paper receipts. Our pipeline extracts items, quantities, units, and rates directly into MySQL tables.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="p-8 rounded-2xl bg-cream border border-cream-muted hover:border-orange/40 transition-all duration-300 hover:shadow-card group">
                <div className="w-12 h-12 rounded-xl bg-orange/15 text-orange flex items-center justify-center mb-6 group-hover:bg-orange group-hover:text-white transition-colors">
                  <Boxes className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-charcoal mb-3">Multi-Batch Inventory</h3>
                <p className="text-secondary text-sm leading-relaxed">
                  Support separate batches for identical products with distinct expiry dates. FIFO consumption ensures items are consumed before spoiling.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="p-8 rounded-2xl bg-cream border border-cream-muted hover:border-orange/40 transition-all duration-300 hover:shadow-card group">
                <div className="w-12 h-12 rounded-xl bg-orange/15 text-orange flex items-center justify-center mb-6 group-hover:bg-orange group-hover:text-white transition-colors">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-charcoal mb-3">Annual Expense Intelligence</h3>
                <p className="text-secondary text-sm leading-relaxed">
                  Understand exactly where your grocery budget goes every month and year. Track category trends, inflation, and seasonal spikes.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 3: BILL SCANNING DEEP DIVE
          ======================================================== */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <ScrollReveal direction="right">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-orange">Computer Vision + DBMS</span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-2 mb-6">
                  Snap your grocery receipt. Let SQL do the bookkeeping.
                </h2>
                <div className="space-y-4 text-secondary text-sm leading-relaxed">
                  <p>
                    Simply upload or snap a photo of any supermarket bill. OpenCV applies adaptive thresholding and contrast normalization before Tesseract OCR extracts the raw text.
                  </p>
                  <p>
                    Our heuristic engine maps item lines to categories and detects quantities and prices. The side-by-side verification screen lets you verify before committing an atomic transaction to MySQL.
                  </p>
                </div>

                <div className="mt-8 space-y-3">
                  {[
                    "Supports JPG, PNG, WEBP, and scanned PDF invoices",
                    "Preserves original receipt photos as binary BLOBs in MySQL",
                    "Auto-increments existing stock instead of overwriting",
                    "Dual language support (English & Kannada receipt headers)"
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-orange/20 text-orange flex items-center justify-center flex-shrink-0">
                        <CheckSquare className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium text-charcoal">{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigate('scan')}
                  className="mt-8 px-6 py-3 rounded-xl bg-charcoal text-white font-semibold text-sm hover:bg-orange transition-colors flex items-center gap-2"
                >
                  Try Bill Scanner
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left">
              <div className="rounded-2xl bg-cream-light p-6 border border-cream-muted shadow-card relative">
                <div className="text-xs font-mono text-secondary mb-4 pb-2 border-b border-cream-muted flex justify-between">
                  <span>OCR Extraction Pipeline</span>
                  <span className="text-emerald-700 font-bold">Confidence: 94.2%</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-cream-muted flex justify-between items-center">
                    <div>
                      <span className="font-bold text-charcoal block">NATURE'S BASKET SUPERSTORE</span>
                      <span className="text-secondary text-[11px]">Invoice #NB-49210 • 18 Nov 2026</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-cream text-[10px] font-bold text-orange">Verified</span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-cream-muted space-y-2">
                    <div className="flex justify-between font-semibold text-charcoal">
                      <span>Basmati Rice (Grains)</span>
                      <span>2.00 kg × ₹120 = ₹240.00</span>
                    </div>
                    <div className="flex justify-between font-semibold text-charcoal">
                      <span>Amul Taza Milk (Dairy)</span>
                      <span>2.00 L × ₹64 = ₹128.00</span>
                    </div>
                    <div className="flex justify-between font-semibold text-charcoal">
                      <span>Toor Dal Premium (Pulses)</span>
                      <span>1.00 kg × ₹165 = ₹165.00</span>
                    </div>
                  </div>

                  <div className="p-3 bg-orange/10 rounded-lg border border-orange/20 flex justify-between items-center font-bold text-charcoal">
                    <span>Grand Total Recorded in SQL:</span>
                    <span className="text-orange text-base">₹533.00</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 4: INVENTORY MANAGEMENT
          ======================================================== */}
      <section className="py-24 bg-cream-light border-y border-cream-muted/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-orange">Real-time Stock Control</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-2">
              Full inventory traceability with audit movements.
            </h2>
            <p className="text-secondary text-base mt-4">
              Every grocery item in your household has a home. Track by storage location (Refrigerator, Freezer, Pantry, Spice Rack) and record daily consumption.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Available Products", count: "10 items", desc: "Well-stocked essentials", color: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "Low Stock Alert", count: "3 items", desc: "Below min threshold", color: "text-orange-dark", bg: "bg-orange/10" },
              { label: "Out of Stock", count: "1 item", desc: "Ready for restock list", color: "text-charcoal", bg: "bg-cream-muted" },
              { label: "Storage Zones", count: "5 locations", desc: "Fridge, Pantry, Spices...", color: "text-orange", bg: "bg-cream" },
            ].map((stat, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.1}>
                <div className="p-6 rounded-2xl bg-white border border-cream-muted shadow-soft">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${stat.bg} ${stat.color} mb-3`}>
                    {stat.label}
                  </span>
                  <p className="text-2xl font-bold text-charcoal font-serif">{stat.count}</p>
                  <p className="text-xs text-secondary mt-1">{stat.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 5: EXPIRY MONITORING
          ======================================================== */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <ScrollReveal direction="right">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white border-l-4 border-l-emerald-500 border border-cream-muted shadow-soft flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase">Safe Status (Green)</span>
                    <p className="text-sm font-semibold text-charcoal">Basmati Rice (Expires in 150 days)</p>
                  </div>
                  <span className="text-xs font-bold text-secondary">Pantry Shelf</span>
                </div>

                <div className="p-4 rounded-xl bg-white border-l-4 border-l-orange border border-cream-muted shadow-soft flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-orange uppercase">Expiring Soon (Orange)</span>
                    <p className="text-sm font-semibold text-charcoal">Amul Taza Milk (Expires in 2 days)</p>
                  </div>
                  <span className="text-xs font-bold text-orange">Consume Soon</span>
                </div>

                <div className="p-4 rounded-xl bg-white border-l-4 border-l-charcoal border border-cream-muted shadow-soft flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-charcoal uppercase">Expired (Charcoal Badge)</span>
                    <p className="text-sm font-semibold text-charcoal">Organic Tomatoes (Expired 2 days ago)</p>
                  </div>
                  <span className="text-xs font-bold text-secondary">Discard / Compost</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-orange">Prevent Waste, Save Money</span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-2 mb-6">
                  Intelligent Expiry Tracking with Visual Indicators.
                </h2>
                <p className="text-secondary text-sm leading-relaxed mb-4">
                  HomeStock categorizes inventory batches into Safe, Expiring Soon (within 7 days), and Expired. Never invent expiry dates: the system calculates default category shelf-life or allows custom date input.
                </p>
                <p className="text-secondary text-sm leading-relaxed mb-6">
                  One-click actions let you mark batches as consumed or discarded, keeping stock levels 100% accurate without manual arithmetic.
                </p>
                <button
                  onClick={() => onNavigate('expiry')}
                  className="px-6 py-3 rounded-xl bg-orange text-white font-semibold text-sm hover:bg-orange-dark transition-colors"
                >
                  View Expiry Tracker
                </button>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 6: MONTHLY GROCERY PLANNING
          ======================================================== */}
      <section className="py-24 bg-cream-light border-y border-cream-muted/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-orange">Personalized Monthly Planner</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-2">
              Automated shopping lists that check your pantry first.
            </h2>
            <p className="text-secondary text-base mt-4">
              At the start of every month, HomeStock generates your shopping checklist using your recurring preferences minus what you already have in stock.
            </p>
          </div>

          <div className="bg-cream rounded-2xl p-6 sm:p-8 border border-cream-muted shadow-card max-w-3xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-cream-muted mb-6">
              <div>
                <h3 className="font-bold text-charcoal text-lg">Smart Reorder Formula</h3>
                <p className="text-xs text-secondary font-mono">Quantity to Buy = MAX(1, Preferred Monthly Qty - Current Stock)</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange/15 text-orange">SQL Stored Procedure</span>
            </div>

            <div className="space-y-3">
              {[
                { name: "Basmati Rice", target: "10 kg", stock: "2.5 kg", buy: "7.5 kg", unitPrice: "₹120/kg", est: "₹900.00" },
                { name: "Chakki Fresh Atta", target: "10 kg", stock: "8.0 kg", buy: "2.0 kg", unitPrice: "₹55/kg", est: "₹110.00" },
                { name: "Amul Taza Milk", target: "15 L", stock: "1.0 L", buy: "14.0 L", unitPrice: "₹64/L", est: "₹896.00" },
                { name: "Toor Dal Premium", target: "2.0 kg", stock: "0.8 kg", buy: "1.2 kg", unitPrice: "₹165/kg", est: "₹198.00" },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 bg-white rounded-xl border border-cream-muted flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="font-bold text-charcoal text-sm flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-orange" />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-secondary">
                    <span>Desired: {item.target}</span>
                    <span className="font-mono text-charcoal">In Pantry: {item.stock}</span>
                    <span className="font-bold text-orange px-2 py-0.5 rounded bg-orange/10">Buy: {item.buy}</span>
                    <span className="font-bold text-charcoal">{item.est}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-cream-muted flex justify-between items-center text-sm font-bold">
              <span className="text-charcoal">Estimated Grocery Run Budget:</span>
              <span className="text-orange text-lg">₹2,104.00</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 7: EXPENSE ANALYTICS
          ======================================================== */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <ScrollReveal direction="right">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-orange">Financial Transparency</span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-2 mb-6">
                  Understand every single Rupee (₹) you spend.
                </h2>
                <p className="text-secondary text-sm leading-relaxed mb-4">
                  No more wondering where the household money vanished. HomeStock tracks verified expenses derived directly from confirmed supermarket purchases.
                </p>
                <div className="space-y-4 my-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-orange/15 text-orange flex items-center justify-center font-bold text-xs">₹</div>
                    <div>
                      <p className="text-sm font-bold text-charcoal">Monthly Budget Tracking</p>
                      <p className="text-xs text-secondary">Set a target budget and receive instant alerts when spending exceeds limits.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-orange/15 text-orange flex items-center justify-center font-bold text-xs">₹</div>
                    <div>
                      <p className="text-sm font-bold text-charcoal">Rolling 12-Month Annual Trends</p>
                      <p className="text-xs text-secondary">Compare festival months, seasonal spikes, and category allocations.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('expenses')}
                  className="px-6 py-3 rounded-xl bg-charcoal text-white font-semibold text-sm hover:bg-orange transition-colors"
                >
                  Explore Expense Reports
                </button>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left">
              <div className="p-6 rounded-2xl bg-cream-light border border-cream-muted shadow-card">
                <div className="flex justify-between items-center mb-6 pb-2 border-b border-cream-muted">
                  <span className="text-xs font-bold text-charcoal uppercase">Fiscal Year 2026 Overview</span>
                  <span className="text-xs font-bold text-orange">Indian Rupees (₹)</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-white rounded-xl border border-cream-muted">
                    <span className="text-[11px] text-secondary">Annual Total</span>
                    <p className="text-xl font-bold text-charcoal font-serif">₹27,840.00</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-cream-muted">
                    <span className="text-[11px] text-secondary">Avg. Monthly</span>
                    <p className="text-xl font-bold text-charcoal font-serif">₹2,530.00</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-secondary"><span>Grains & Flours</span><span className="font-bold text-charcoal">₹9,450.00 (34%)</span></div>
                  <div className="w-full bg-cream-muted rounded-full h-1.5"><div className="bg-orange h-1.5 rounded-full" style={{ width: '34%' }}></div></div>
                  
                  <div className="flex justify-between text-secondary pt-2"><span>Dairy & Milk</span><span className="font-bold text-charcoal">₹6,800.00 (24%)</span></div>
                  <div className="w-full bg-cream-muted rounded-full h-1.5"><div className="bg-orange-dark h-1.5 rounded-full" style={{ width: '24%' }}></div></div>

                  <div className="flex justify-between text-secondary pt-2"><span>Fresh Vegetables</span><span className="font-bold text-charcoal">₹4,200.00 (15%)</span></div>
                  <div className="w-full bg-cream-muted rounded-full h-1.5"><div className="bg-charcoal h-1.5 rounded-full" style={{ width: '15%' }}></div></div>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 8: HOW IT WORKS
          ======================================================== */}
      <section id="how-it-works" className="py-24 bg-cream-light border-y border-cream-muted/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-orange">Simple 4-Step Process</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-2">
              From checkout counter to automated pantry control.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Scan Grocery Bill", desc: "Upload a receipt photo from DMart, Nature's Basket, or your local kirana store." },
              { step: "02", title: "Review & Correct", desc: "Inspect OCR parsed line items, verify quantities and prices on the side-by-side screen." },
              { step: "03", title: "Atomic SQL Save", desc: "The system stores the bill image BLOB, creates inventory batches, and logs financial expenses." },
              { step: "04", title: "Stay Notified", desc: "Get real-time alerts before items expire and automated monthly shopping lists." },
            ].map((s, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.15}>
                <div className="p-6 rounded-2xl bg-cream border border-cream-muted relative hover:shadow-soft transition-all">
                  <span className="font-serif text-4xl font-bold text-orange/30 block mb-3">{s.step}</span>
                  <h3 className="font-bold text-charcoal text-lg mb-2">{s.title}</h3>
                  <p className="text-secondary text-xs leading-relaxed">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 9: FINAL CTA
          ======================================================== */}
      <section className="py-24 bg-charcoal text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal direction="up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charcoal-muted text-orange text-xs font-semibold mb-6">
              <Package className="w-3.5 h-3.5" />
              <span>DBMS Academic Project Evaluation</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-6">
              Ready to take complete control of your household groceries?
            </h2>
            <p className="text-cream-muted text-base max-w-xl mx-auto mb-8">
              Experience the power of normalized MySQL storage, intelligent OCR bill scanning, and accurate financial analytics today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('register')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-orange hover:bg-orange-dark text-white font-semibold text-base shadow-card transition-all"
              >
                Create Free Account
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-charcoal-muted hover:bg-charcoal border border-charcoal text-cream font-semibold text-base transition-all"
              >
                Sign In with Demo User
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========================================================
          SECTION 10: FOOTER
          ======================================================== */}
      <footer id="about" className="py-12 bg-charcoal-dark text-secondary text-xs border-t border-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange text-white flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-serif font-bold text-white text-base">HomeStock</span>
            <span className="text-secondary">| Academic DBMS Project</span>
          </div>
          <p className="text-center sm:text-right">
            Designed with Cream, Orange & Charcoal. Backed 100% by Relational SQL.
          </p>
        </div>
      </footer>

    </div>
  );
};
