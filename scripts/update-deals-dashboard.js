const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Read CSV file
const csvPath = path.join(__dirname, '..', 'data', 'deals.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

console.log(`Parsed ${records.length} records from CSV`);

// Convert to deals dashboard format
const deals = records.map((row, index) => {
  const dealName = (row['Deal Name'] || '').trim();
  if (!dealName) return null;

  const stage = (row['GHB - Stage'] || 'Yet To Start').trim();
  const ghbOwner = (row['GHB Deal Owner'] || 'Unassigned').trim() || 'Unassigned';
  const researchPartner = (row['Research Partner'] || 'Unassigned').trim() || 'Unassigned';

  // Determine if converted (Booking Done or later stages)
  const convertedStages = [
    'Booking Done',
    'Invoice Raised',
    'Collection Done And Closed'
  ];
  const isConverted = convertedStages.includes(stage);

  // Define stages that count as "Live Deals"
  const liveStages = [
    'Yet To Start',
    'Discovery Call Scheduled',
    'Discovery Call Done',
    'LongList Call Scheduled',
    'Shortlisting Done',
    'Site Visit Scheduled',
    'Site Visit Done',
    'EOI Submitted',
    'Deep Dive Done',
    'POM Report Shared'
  ];
  const isLive = liveStages.includes(stage);

  // Generate a simple ID
  const id = `deal_${index}_${dealName.toLowerCase().replace(/\s+/g, '_')}`;

  // Determine priority (if you have this data, otherwise default)
  const priority = 'Priority 3'; // You can enhance this based on your data

  return {
    id,
    name: dealName,
    stage,
    ghb_owner: ghbOwner,
    market_advisor: researchPartner,
    priority,
    is_converted: isConverted,
    is_live: isLive
  };
}).filter(Boolean);

console.log(`Converted ${deals.length} deals`);

// Calculate expected bookings
const expectedBookings = {
  ghb_owner: {},
  market_advisor: {},
  total: 0
};

// Count deals by advisor and calculate expected bookings based on priority
const priorityWeights = {
  'Priority 0': 0.5,
  'Priority 1 (A)': 0.2,
  'Priority 1 (B)': 0.35,
  'Priority 2': 0.15,
  'Priority 3': 0.1
};

deals.forEach(deal => {
  // Only calculate expected bookings for live deals
  if (!deal.is_live) return;

  // Calculate weight for this deal
  let weight = 0;
  for (const [priorityKey, priorityWeight] of Object.entries(priorityWeights)) {
    if (deal.priority.includes(priorityKey)) {
      weight = priorityWeight;
      break;
    }
  }

  // Add to ghb_owner expected bookings
  if (deal.ghb_owner && deal.ghb_owner !== 'Unassigned') {
    expectedBookings.ghb_owner[deal.ghb_owner] =
      (expectedBookings.ghb_owner[deal.ghb_owner] || 0) + weight;
  }

  // Add to market_advisor expected bookings
  if (deal.market_advisor && deal.market_advisor !== 'Unassigned') {
    expectedBookings.market_advisor[deal.market_advisor] =
      (expectedBookings.market_advisor[deal.market_advisor] || 0) + weight;
  }

  expectedBookings.total += weight;
});

console.log(`Calculated expected bookings: ${expectedBookings.total.toFixed(2)} total`);

// Read the HTML file
const htmlPath = path.join(__dirname, '..', 'deals_dashboard.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Create the new dashboard data
const dashboardData = {
  deals,
  expected_bookings: expectedBookings
};

// Convert to formatted JSON string
const jsonString = JSON.stringify(dashboardData, null, 2);

// Find and replace the dashboardData section
const startMarker = 'const dashboardData = ';
const endMarker = '};';

const startIndex = htmlContent.indexOf(startMarker);
if (startIndex === -1) {
  console.error('Could not find dashboardData in HTML file');
  process.exit(1);
}

const endIndex = htmlContent.indexOf(endMarker, startIndex);
if (endIndex === -1) {
  console.error('Could not find end of dashboardData in HTML file');
  process.exit(1);
}

// Replace the data
const before = htmlContent.substring(0, startIndex + startMarker.length);
const after = htmlContent.substring(endIndex + endMarker.length);
const newHtmlContent = before + jsonString + after;

// Write the updated HTML file
fs.writeFileSync(htmlPath, newHtmlContent, 'utf-8');

console.log(`✅ Updated deals_dashboard.html with ${deals.length} deals`);

// Show some stats
const stageStats = {};
deals.forEach(deal => {
  stageStats[deal.stage] = (stageStats[deal.stage] || 0) + 1;
});

console.log('\nStage breakdown:');
Object.entries(stageStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([stage, count]) => {
    console.log(`  ${stage}: ${count}`);
  });

// Also update the JSON file for the Next.js deals dashboard route
const jsonPath = path.join(__dirname, '..', 'data', 'deals-dashboard.json');
fs.writeFileSync(jsonPath, JSON.stringify(dashboardData, null, 2), 'utf-8');
console.log(`\n✅ Also updated data/deals-dashboard.json for Next.js route`);
console.log(`   You can view this at: http://localhost:3000/deals-dashboard`);
