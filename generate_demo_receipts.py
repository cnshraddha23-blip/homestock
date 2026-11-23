import os
from PIL import Image, ImageDraw, ImageFont

def generate_receipt(filename, store_name, tagline, gstin, invoice_no, date_str, time_str, items, total, tax, discount, payment_mode):
    width = 650
    # Estimate height based on items
    height = 550 + (len(items) * 36) + 200

    # Create image with off-white thermal paper background
    img = Image.new("RGB", (width, height), color=(253, 252, 248))
    draw = ImageDraw.Draw(img)

    # Use default or basic fonts
    try:
        font_large = ImageFont.truetype("arial.ttf", 26)
        font_bold = ImageFont.truetype("arialbd.ttf", 18)
        font_regular = ImageFont.truetype("cour.ttf", 18) # Monospace Courier for thermal receipt feel
        font_bold_mono = ImageFont.truetype("courbd.ttf", 18)
        font_small = ImageFont.truetype("cour.ttf", 14)
    except Exception:
        font_large = ImageFont.load_default()
        font_bold = ImageFont.load_default()
        font_regular = ImageFont.load_default()
        font_bold_mono = ImageFont.load_default()
        font_small = ImageFont.load_default()

    y = 35

    # Store Header (Centered)
    draw.text((width // 2, y), store_name.upper(), fill=(25, 25, 25), font=font_large, anchor="mm")
    y += 28
    draw.text((width // 2, y), tagline, fill=(70, 70, 70), font=font_small, anchor="mm")
    y += 20
    draw.text((width // 2, y), f"GSTIN: {gstin}", fill=(70, 70, 70), font=font_small, anchor="mm")
    y += 24

    # Dashed divider
    draw.text((30, y), "-" * 56, fill=(130, 130, 130), font=font_regular)
    y += 24

    # Metadata
    draw.text((35, y), f"Invoice : {invoice_no}", fill=(30, 30, 30), font=font_regular)
    y += 22
    draw.text((35, y), f"Date    : {date_str}   Time: {time_str}", fill=(30, 30, 30), font=font_regular)
    y += 22
    draw.text((35, y), f"Cashier : POS-04 (Terminal 02)", fill=(30, 30, 30), font=font_regular)
    y += 26

    # Dashed divider
    draw.text((30, y), "=" * 56, fill=(50, 50, 50), font=font_regular)
    y += 24

    # Table Header
    header_str = f"{'ITEM':<22}{'QTY':<8}{'RATE':<10}{'AMOUNT':>10}"
    draw.text((35, y), header_str, fill=(20, 20, 20), font=font_bold_mono)
    y += 22
    draw.text((30, y), "-" * 56, fill=(130, 130, 130), font=font_regular)
    y += 26

    # Item Rows
    for name, qty_str, rate, amt in items:
        row_str = f"{name:<22}{qty_str:<8}{rate:>8.2f}{amt:>12.2f}"
        draw.text((35, y), row_str, fill=(20, 20, 20), font=font_regular)
        y += 26

    # Dashed divider
    draw.text((30, y), "-" * 56, fill=(130, 130, 130), font=font_regular)
    y += 26

    subtotal = total + discount - tax
    draw.text((35, y), f"{'Subtotal':<38}INR {subtotal:>8.2f}", fill=(50, 50, 50), font=font_regular)
    y += 22
    if discount > 0:
        draw.text((35, y), f"{'Store Promo Savings':<38}-INR {discount:>7.2f}", fill=(180, 50, 50), font=font_regular)
        y += 22
    draw.text((35, y), f"{'CGST (2.5%) + SGST (2.5%)':<38}INR {tax:>8.2f}", fill=(50, 50, 50), font=font_regular)
    y += 24

    draw.text((30, y), "=" * 56, fill=(40, 40, 40), font=font_regular)
    y += 28

    # Grand Total
    draw.text((35, y), f"{'TOTAL PAYABLE':<28}INR {total:>12.2f}", fill=(10, 10, 10), font=font_bold_mono)
    y += 34
    draw.text((30, y), "-" * 56, fill=(130, 130, 130), font=font_regular)
    y += 24

    # Payment info
    draw.text((35, y), f"Payment Mode : {payment_mode}", fill=(50, 50, 50), font=font_regular)
    y += 22
    draw.text((35, y), f"Items Count  : {len(items)} Items Sold", fill=(50, 50, 50), font=font_regular)
    y += 35

    # Simulated Barcode
    barcode_x = 90
    bar_h = 38
    for i in range(110):
        if (i * 7) % 3 != 0:
            draw.line([(barcode_x + i * 4, y), (barcode_x + i * 4, y + bar_h)], fill=(20, 20, 20), width=2 if (i % 2 == 0) else 1)
    y += bar_h + 10
    draw.text((width // 2, y), f"* {invoice_no} *", fill=(60, 60, 60), font=font_small, anchor="mm")
    y += 25

    # Footer
    draw.text((width // 2, y), "THANK YOU FOR SHOPPING WITH US!", fill=(60, 60, 60), font=font_bold, anchor="mm")
    y += 20
    draw.text((width // 2, y), "Please retain this receipt for return/exchange", fill=(100, 100, 100), font=font_small, anchor="mm")
    y += 18
    draw.text((width // 2, y), "www.homestock-groceries.com", fill=(120, 120, 120), font=font_small, anchor="mm")

    # Add light thermal paper border
    draw.rectangle([0, 0, width - 1, height - 1], outline=(210, 205, 195), width=2)

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    img.save(filename, "PNG", quality=95)
    print(f"Generated: {filename}")

out_dir = r"c:\Users\cnshr\OneDrive\Desktop\Voice Assistant\homestock\demo_receipts"

# 1. DMart Supermarket
generate_receipt(
    os.path.join(out_dir, "dmart_supermarket_receipt.png"),
    "DMart Supermarket",
    "Avenue Supermarts Ltd. • Bandra West, Mumbai",
    "27AABCA1234F1Z5",
    "DMART-2026-88412",
    "2026-11-20",
    "17:42:15",
    [
        ("Basmati Rice 5kg", "1 pk", 480.00, 480.00),
        ("Chakki Atta 10kg", "1 pk", 410.00, 410.00),
        ("Fortune Oil 1L", "2 pk", 145.00, 290.00),
        ("Toor Dal 1kg", "1 pk", 165.00, 165.00),
        ("Tata Salt 1kg", "2 pk", 28.00, 56.00),
        ("Red Onions 2kg", "2 kg", 35.00, 70.00),
    ],
    total=1471.00,
    tax=36.00,
    discount=50.00,
    payment_mode="UPI (Google Pay / PhonePe)"
)

# 2. Reliance Fresh / Smart Point
generate_receipt(
    os.path.join(out_dir, "reliance_fresh_receipt.png"),
    "Reliance Fresh",
    "Reliance Retail Ltd. • Indiranagar, Bengaluru",
    "29AAACR5532E1Z8",
    "REL-SMART-99104",
    "2026-11-21",
    "11:15:40",
    [
        ("Amul Taza Milk 1L", "2 pk", 64.00, 128.00),
        ("Amul Butter 500g", "1 pk", 275.00, 275.00),
        ("Fresh Paneer 200g", "2 pk", 110.00, 220.00),
        ("Organic Curd 400g", "1 pk", 45.00, 45.00),
        ("Brown Bread 400g", "1 pk", 55.00, 55.00),
    ],
    total=723.00,
    tax=18.00,
    discount=15.00,
    payment_mode="Credit Card (Visa - 8819)"
)

# 3. Sri Krishna Kirana & Provision Store
generate_receipt(
    os.path.join(out_dir, "sri_krishna_kirana_receipt.png"),
    "Sri Krishna Kirana Store",
    "Daily Provisions & Spices • MG Road, Pune",
    "27BBKPK9921D1Z1",
    "KK-RETAIL-00452",
    "2026-11-22",
    "19:05:12",
    [
        ("Tata Tea Gold 500g", "1 pk", 320.00, 320.00),
        ("Sugar Premium 2kg", "2 kg", 45.00, 90.00),
        ("Turmeric Powder 200g", "1 pk", 65.00, 65.00),
        ("Cumin Seeds 100g", "1 pk", 85.00, 85.00),
        ("Maggi Noodles 4pk", "1 pk", 60.00, 60.00),
    ],
    total=620.00,
    tax=15.00,
    discount=0.00,
    payment_mode="Cash / UPI QR"
)

# 4. Nature's Basket Gourmet
generate_receipt(
    os.path.join(out_dir, "natures_basket_receipt.png"),
    "Nature's Basket",
    "Artisanal & Gourmet Food Hall • Jubilee Hills, Hyderabad",
    "36AABCN4421G1ZX",
    "NB-HYD-77312",
    "2026-11-23",
    "14:28:30",
    [
        ("Greek Yogurt 400g", "1 pk", 180.00, 180.00),
        ("Rolled Oats 1kg", "1 pk", 295.00, 295.00),
        ("Extra Virgin Olive Oil", "1 btl", 750.00, 750.00),
        ("Organic Raw Honey 500g", "1 jar", 380.00, 380.00),
        ("Dark Chocolate 70%", "2 bar", 160.00, 320.00),
    ],
    total=1925.00,
    tax=45.00,
    discount=50.00,
    payment_mode="Debit Card (Mastercard - 4012)"
)

print("All 4 demo receipts generated successfully!")
