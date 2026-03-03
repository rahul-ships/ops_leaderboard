import csv
import json
from datetime import datetime, timedelta
from pathlib import Path

# Read CSV file - need to skip first 7 lines
csv_data = []
try:
    # Read raw file
    with open("user_read_only_context/text_attachments/Banaglore-GHB-Deals-7RAZV.csv", 'r', encoding='utf-8') as f:
        all_lines = f.readlines()
    
    # Skip first 7 lines, use DictReader on remaining
    from io import StringIO
    csv_string = ''.join(all_lines[7:])  # Skip metadata lines
    csv_reader = csv.DictReader(StringIO(csv_string))
    csv_data = list(csv_reader)
    print(f"[v0] Read {len(csv_data)} records from CSV")
except Exception as e:
    print(f"[v0] Error reading CSV: {e}")
    exit(1)

# Extract unique advisors from all three columns
advisors_set = set()
for row in csv_data:
    for field in ['GHB Deal Owner', 'Research Partner', 'Txn. Partner']:
        name = row.get(field, '').strip()
        if name:
            advisors_set.add(name)

NM = sorted(list(advisors_set))
print(f"[v0] Found {len(NM)} unique advisors")

# Base date
base_date = datetime(2025, 4, 1)

# Stage to status mapping
stage_map = {
    'Yet To Start': 'L',
    'LongList Call Scheduled': 'D',
    'Shortlisting Done': 'D',
    'Site Visit Scheduled': 'H',
    'Site Visit Done': 'H',
    'Deep Dive Done': 'H',
    'Booking Done': 'B',
    'Closure Done': 'C',
    'Collection Done': 'C',
}

def parse_date(date_str):
    """Parse date string in format 'DD/MM/YYYY HH:MM AM/PM'"""
    if not date_str or not date_str.strip():
        return None
    try:
        # Take only the date part
        date_part = date_str.strip().split()[0]
        return datetime.strptime(date_part, "%d/%m/%Y")
    except:
        return None

def days_since(date_obj):
    """Calculate days since base date"""
    if not date_obj:
        return 0
    delta = (date_obj - base_date).days
    return max(0, delta)

# Convert CSV to RW format
RW = []
for idx, row in enumerate(csv_data):
    try:
        deal_name = row.get('Deal Name', '').strip()
        if not deal_name:
            continue
        
        stage = row.get('GHB - Stage', 'Yet To Start').strip()
        status = stage_map.get(stage, 'L')
        
        # Get advisor indices
        go_name = row.get('GHB Deal Owner', '').strip()
        rp_name = row.get('Research Partner', '').strip()
        tp_name = row.get('Txn. Partner', '').strip()
        
        go_idx = NM.index(go_name) if go_name in NM else -1
        rp_idx = NM.index(rp_name) if rp_name in NM else -1
        tp_idx = NM.index(tp_name) if tp_name in NM else -1
        
        # Parse dates
        created_date = parse_date(row.get('Created On', ''))
        discovery_date = parse_date(row.get('Discovery Call Done', ''))
        shortlist_date = parse_date(row.get('Shortlisting Done', ''))
        site_visit_date = parse_date(row.get('Site Visit Done', ''))
        deep_dive_date = parse_date(row.get('Deep Dive Done', ''))
        closure_date = parse_date(row.get('Closure Done', ''))
        collection_date = parse_date(row.get('Collection Done', ''))
        
        # Calculate days from base
        cd = days_since(created_date)
        dd = days_since(discovery_date)
        sd = days_since(shortlist_date)
        svd = days_since(site_visit_date)
        bd = days_since(closure_date)
        dvd = days_since(deep_dive_date)
        
        # Amount
        amount_str = row.get('GHB Amount Paid', '₹ 2,499.00').strip()
        amount = 2499
        try:
            clean = amount_str.replace('₹', '').replace(',', '').replace('.00', '').strip()
            if clean and clean != '0':
                amount = int(clean)
        except:
            pass
        
        # Booking month (from closure or collection date)
        booking_month = ""
        book_date = closure_date or collection_date
        if book_date:
            booking_month = book_date.strftime("%Y-%m")
        
        # Add to RW
        RW.append([
            deal_name, status, go_idx, rp_idx, tp_idx,
            cd, dd, sd, svd, bd, booking_month, dvd, amount
        ])
    except Exception as e:
        print(f"[v0] Error processing row {idx}: {e}")

print(f"[v0] Converted {len(RW)} deals")

# Write output file
output = "const NM = " + json.dumps(NM) + ";\n\n"
output += "const RW = [\n"
for row in RW:
    output += "  " + json.dumps(row) + ",\n"
output += "];\n\n"
output += "export { NM, RW };"

output_path = Path("/vercel/share/v0-project/app/leaderboard-data.js")
output_path.write_text(output)

print(f"[v0] Successfully generated leaderboard-data.js")
