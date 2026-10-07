export const clients = [
  { id: 1, code: 'CL-001', name: 'Philippine Army – 1st Infantry Division', branch: 'Army', type: 'government', tin: '000-123-456-000', contact: 'Maj. R. Dela Cruz', phone: '0917 555 0101', email: 'supply@1id.example', address: 'Fort Gen. Mateo Capinpin, Tanay, Rizal', contracts: 3 },
  { id: 2, code: 'CL-002', name: 'PNP Region IV-A Logistics Office', branch: 'PNP', type: 'government', tin: '000-222-333-000', contact: 'PMaj. L. Santos', phone: '0918 555 0102', email: 'logistics@pnp4a.example', address: 'Camp Vicente Lim, Calamba, Laguna', contracts: 2 },
  { id: 3, code: 'CL-003', name: 'Philippine Air Force – 505th Wing', branch: 'Air Force', type: 'government', tin: '000-333-444-000', contact: 'Capt. M. Reyes', phone: '0919 555 0103', email: 'supply@505w.example', address: 'Villamor Air Base, Pasay City', contracts: 1 },
  { id: 4, code: 'CL-004', name: 'Sentinel Security Services Inc.', branch: 'Private', type: 'private', tin: '009-444-555-000', contact: 'A. Villanueva', phone: '0920 555 0104', email: 'ops@sentinel.example', address: 'Makati City', contracts: 1 },
]

export const suppliers = [
  { id: 1, code: 'SP-001', name: 'Propper USA (PH distributor)', type: 'brand_partner', status: 'Approved', terms: 30, lead: 21, contact: 'J. Tan', email: 'orders@propper-ph.example', agreements: 3 },
  { id: 2, code: 'SP-002', name: 'Rudy Project Philippines', type: 'brand_partner', status: 'Approved', terms: 30, lead: 14, contact: 'M. Lim', email: 'b2b@rudyproject-ph.example', agreements: 2 },
  { id: 3, code: 'SP-003', name: 'Under Armour Philippines', type: 'brand_partner', status: 'Approved', terms: 45, lead: 28, contact: 'K. Cruz', email: 'govsales@ua-ph.example', agreements: 2 },
  { id: 4, code: 'SP-004', name: '361 Degrees Philippines', type: 'brand_partner', status: 'Approved', terms: 30, lead: 21, contact: 'R. Go', email: 'sales@361ph.example', agreements: 1 },
  { id: 5, code: 'SP-005', name: 'Luzon Thread & Fabrics', type: 'local', status: 'Approved', terms: 15, lead: 5, contact: 'E. Bautista', email: 'sales@luzonthread.example', agreements: 0 },
  { id: 6, code: 'SP-006', name: 'Cavite Tailoring Subcontract', type: 'subcontractor', status: 'Pending', terms: 15, lead: 10, contact: 'N. Aquino', email: 'cavite.tailor@example.com', agreements: 0 },
]

export const categories = ['Patches', 'Uniforms', 'Footwear', 'Eyewear', 'Body Armor', 'PPE', 'Bags', 'Accessories']

export const products = [
  { id: 1, slug: 'embroidered-unit-patch', code: 'PT-001', name: 'Embroidered Unit Patch', category: 'Patches', sourcing: 'In-house', uom: 'pc', sizes: ['3 in', '4 in'], spec: 'Multi-head embroidery on twill, merrow edge, hook-and-loop backing.' },
  { id: 2, slug: 'tactical-boots', code: 'FW-001', name: 'Tactical Boots', category: 'Footwear', sourcing: 'Purchased', uom: 'pair', sizes: ['6', '7', '8', '9', '10', '11'], spec: '8-inch leather and nylon upper, slip-resistant outsole, zippered side.' },
  { id: 3, slug: 'ballistic-eyewear', code: 'EY-001', name: 'Ballistic Eyewear', category: 'Eyewear', sourcing: 'Purchased', uom: 'pc', sizes: ['One size'], spec: 'ANSI Z87.1 rated polycarbonate lens, anti-fog coating.' },
  { id: 4, slug: 'service-blouse', code: 'UN-001', name: 'Service Blouse', category: 'Uniforms', sourcing: 'In-house', uom: 'pc', sizes: ['S', 'M', 'L', 'XL'], spec: 'Tailored-fit, made from the unit size and measurement list.' },
  { id: 5, slug: 'tactical-backpack', code: 'BG-001', name: 'Tactical Backpack 35L', category: 'Bags', sourcing: 'Purchased', uom: 'pc', sizes: ['One size'], spec: 'MOLLE webbing, water-resistant 600D fabric.' },
  { id: 6, slug: 'ballistic-vest', code: 'BA-001', name: 'Ballistic Vest Level IIIA', category: 'Body Armor', sourcing: 'Purchased', uom: 'pc', sizes: ['M', 'L', 'XL'], spec: 'NIJ Level IIIA soft armor with removable carrier.' },
  { id: 7, slug: 'flight-suit', code: 'PP-001', name: 'Flight Suit', category: 'PPE', sourcing: 'Purchased', uom: 'pc', sizes: ['S', 'M', 'L', 'XL'], spec: 'Flame-resistant fabric, multiple utility pockets.' },
  { id: 8, slug: 'tactical-watch', code: 'AC-001', name: 'Tactical Watch', category: 'Accessories', sourcing: 'Purchased', uom: 'pc', sizes: ['One size'], spec: 'Shock-resistant, 100 m water resistance.' },
]

export const priceAgreements = [
  { id: 1, ref: 'PA-2026-001', supplier: 'Propper USA (PH distributor)', product: 'Tactical Boots (all sizes)', cost: 5600, moq: 50, lead: 21, from: '2026-01-01', to: '2026-12-31', preferred: 'Yes', status: 'Active', days: 89 },
  { id: 2, ref: 'PA-2026-004', supplier: 'Rudy Project Philippines', product: 'Ballistic Eyewear', cost: 4150, moq: 20, lead: 14, from: '2026-02-01', to: '2026-10-25', preferred: 'Yes', status: 'Expiring', days: 22 },
  { id: 3, ref: 'PA-2026-006', supplier: 'Under Armour Philippines', product: 'Tactical Backpack 35L', cost: 3200, moq: 30, lead: 28, from: '2026-03-01', to: '2027-02-28', preferred: 'Yes', status: 'Active', days: 148 },
  { id: 4, ref: 'PA-2025-019', supplier: '361 Degrees Philippines', product: 'Tactical Boots (all sizes)', cost: 5900, moq: 50, lead: 21, from: '2025-06-01', to: '2026-05-31', preferred: 'No', status: 'Expired', days: -125 },
]

export const contracts = [
  { id: 12, no: 'CT-2026-0012', client: 'Philippine Army – 1st Infantry Division', clientId: 1, title: 'Supply of patches, tactical boots and ballistic eyewear', noa: 'NOA-2026-0345', ntp: 'Oct 5, 2026', days: 60, deadline: 'Dec 4, 2026', amount: 2885000, status: 'In progress', deadlineStatus: 'At risk', pct: 80, left: 62 },
  { id: 11, no: 'CT-2026-0011', client: 'PNP Region IV-A Logistics Office', clientId: 2, title: 'Supply of service blouses', noa: 'NOA-2026-0310', ntp: 'Sep 1, 2026', days: 90, deadline: 'Nov 30, 2026', amount: 1240000, status: 'In progress', deadlineStatus: 'On track', pct: 45, left: 58 },
  { id: 10, no: 'CT-2026-0010', client: 'Philippine Air Force – 505th Wing', clientId: 3, title: 'Supply of flight suits', noa: 'NOA-2026-0288', ntp: 'Jul 20, 2026', days: 60, deadline: 'Sep 18, 2026', amount: 960000, status: 'In progress', deadlineStatus: 'Delayed', pct: 70, left: -15 },
  { id: 9, no: 'CT-2026-0009', client: 'Sentinel Security Services Inc.', clientId: 4, title: 'Supply of tactical backpacks', noa: 'PO-SENT-882', ntp: 'Jun 2, 2026', days: 30, deadline: 'Jul 2, 2026', amount: 480000, status: 'Accepted', deadlineStatus: 'On track', pct: 100, left: 0 },
  { id: 8, no: 'CT-2026-0008', client: 'Philippine Army – 1st Infantry Division', clientId: 1, title: 'Unit insignia patches', noa: 'NOA-2026-0201', ntp: 'Mar 3, 2026', days: 45, deadline: 'Apr 17, 2026', amount: 310000, status: 'Closed', deadlineStatus: 'On track', pct: 100, left: 0 },
]

// b = quantity buckets per contract line (blueprint "Inventory model"). Sum of b = qty.
export const contractItems = [
  { line: 1, item: 'Embroidered unit patch, 3 in', qty: 2000, price: 85, cost: 28, source: 'In-house (JO-2026-0018)', b: { awaiting: 0, forQa: 0, ready: 0, delivered: 0, accepted: 2000 } },
  { line: 2, item: 'Tactical boots, sizes 6–11', qty: 300, price: 6800, cost: 5600, source: 'Propper USA via PO-2026-0031', b: { awaiting: 4, forQa: 0, ready: 0, delivered: 0, accepted: 296 }, returned: 4 },
  { line: 3, item: 'Ballistic eyewear', qty: 150, price: 4500, cost: 4150, source: 'Rudy Project via PO-2026-0032', b: { awaiting: 150, forQa: 0, ready: 0, delivered: 0, accepted: 0 } },
]

export const bids = [
  { id: 1, ref: 'PHILGEPS-8841230', client: 'Philippine Army – 1st Infantry Division', title: 'Combat boots and eyewear 2026', abc: 3100000, bid: 2885000, due: 'Sep 12, 2026', status: 'Won' },
  { id: 2, ref: 'PHILGEPS-8852011', client: 'PNP Region IV-A Logistics Office', title: 'Service uniforms CY2026', abc: 1400000, bid: 1240000, due: 'Aug 10, 2026', status: 'Won' },
  { id: 3, ref: 'PHILGEPS-8870442', client: 'Philippine Navy Supply Center', title: 'Utility uniforms', abc: 2200000, bid: 2050000, due: 'Oct 20, 2026', status: 'Submitted' },
  { id: 4, ref: 'PHILGEPS-8873910', client: 'Philippine Air Force – 505th Wing', title: 'Safety gear', abc: 800000, bid: 0, due: 'Nov 2, 2026', status: 'Preparing' },
  { id: 5, ref: 'PHILGEPS-8790015', client: 'BuCor Procurement', title: 'Inmate-escort vests', abc: 950000, bid: 905000, due: 'Jul 3, 2026', status: 'Lost' },
]

export const inquiries = [
  { id: 1, name: 'Lt. Dominic Ramos', org: 'PA 2nd Infantry Division', items: 'Name tapes ×1,200; unit patches ×800', date: 'Oct 1, 2026', status: 'New' },
  { id: 2, name: 'A. Villanueva', org: 'Sentinel Security Services Inc.', items: 'Tactical boots ×120 (size 7–10)', date: 'Sep 29, 2026', status: 'Quoted' },
  { id: 3, name: 'Insp. P. Garcia', org: 'PNP Laguna PPO', items: 'Service blouse ×250', date: 'Sep 24, 2026', status: 'Closed' },
]

export const purchaseOrders = [
  { id: 31, no: 'PO-2026-0031', supplier: 'Propper USA (PH distributor)', contract: 'CT-2026-0012', date: 'Oct 6, 2026', eta: 'Oct 27, 2026', total: 1680000, status: 'Partially received', approver: 'Gen. Manager' },
  { id: 32, no: 'PO-2026-0032', supplier: 'Rudy Project Philippines', contract: 'CT-2026-0012', date: 'Oct 6, 2026', eta: 'Oct 20, 2026', total: 622500, status: 'Sent', approver: 'Gen. Manager' },
  { id: 33, no: 'PO-2026-0033', supplier: 'Under Armour Philippines', contract: 'CT-2026-0011', date: 'Oct 2, 2026', eta: 'Oct 30, 2026', total: 320000, status: 'For approval', approver: '—' },
  { id: 34, no: 'PO-2026-0034', supplier: '361 Degrees Philippines', contract: 'CT-2026-0010', date: 'Oct 3, 2026', eta: 'Nov 5, 2026', total: 54000, status: 'Draft', approver: '—' },
  { id: 30, no: 'PO-2026-0030', supplier: 'Propper USA (PH distributor)', contract: 'CT-2026-0009', date: 'Jun 4, 2026', eta: 'Jun 25, 2026', total: 480000, status: 'Received', approver: 'Gen. Manager' },
  { id: 29, no: 'PO-2026-0029', supplier: 'Rudy Project Philippines', contract: 'CT-2026-0008', date: 'May 4, 2026', eta: 'May 20, 2026', total: 90000, status: 'Cancelled', approver: 'Gen. Manager' },
]

export const poLines = [
  { sku: 'FW-001-6', desc: 'Tactical Boots', size: '6', qty: 30, cost: 5600 },
  { sku: 'FW-001-7', desc: 'Tactical Boots', size: '7', qty: 50, cost: 5600 },
  { sku: 'FW-001-8', desc: 'Tactical Boots', size: '8', qty: 70, cost: 5600 },
  { sku: 'FW-001-9', desc: 'Tactical Boots', size: '9', qty: 80, cost: 5600 },
  { sku: 'FW-001-10', desc: 'Tactical Boots', size: '10', qty: 50, cost: 5600 },
  { sku: 'FW-001-11', desc: 'Tactical Boots', size: '11', qty: 20, cost: 5600 },
]

export const goodsReceipts = [
  { id: 1, no: 'GR-2026-0044', source: 'PO-2026-0031', contract: 'CT-2026-0012', date: 'Oct 20, 2026', qty: 300, supplierDr: 'PRP-88231', by: 'W. Mendoza', status: 'Posted' },
  { id: 2, no: 'GR-2026-0043', source: 'JO-2026-0018', contract: 'CT-2026-0012', date: 'Oct 18, 2026', qty: 2000, supplierDr: '—', by: 'W. Mendoza', status: 'Posted' },
]

export const qaQueue = [
  { id: 1, gr: 'GR-2026-0044', item: 'Tactical boots, size 9', contract: 'CT-2026-0012', received: 80, passed: 0, failed: 0, status: 'For QA' },
  { id: 2, gr: 'GR-2026-0044', item: 'Tactical boots, size 8', contract: 'CT-2026-0012', received: 70, passed: 68, failed: 2, status: 'Done' },
  { id: 3, gr: 'GR-2026-0041', item: 'Tactical backpack 35L', contract: 'CT-2026-0009', received: 150, passed: 150, failed: 0, status: 'Done' },
]

export const returns = [
  { id: 1, no: 'RTS-2026-0003', supplier: 'Propper USA (PH distributor)', po: 'PO-2026-0031', qty: 4, reason: 'Stitching defect on sole', date: 'Oct 22, 2026', status: 'Posted' },
  { id: 2, no: 'RTS-2026-0002', supplier: 'Under Armour Philippines', po: 'PO-2026-0022', qty: 6, reason: 'Wrong colour', date: 'Aug 14, 2026', status: 'Posted' },
]

export const movements = [
  { when: 'Oct 22, 2026 09:12', type: 'RETURN_TO_SUPPLIER', item: 'Tactical boots', contract: 'CT-2026-0012', qty: -4, ref: 'RTS-2026-0003', user: 'W. Mendoza' },
  { when: 'Oct 21, 2026 15:40', type: 'QA_REJECT', item: 'Tactical boots', contract: 'CT-2026-0012', qty: -4, ref: 'GR-2026-0044', user: 'C. Ramos' },
  { when: 'Oct 21, 2026 15:40', type: 'QA_PASS', item: 'Tactical boots', contract: 'CT-2026-0012', qty: 296, ref: 'GR-2026-0044', user: 'C. Ramos' },
  { when: 'Oct 20, 2026 10:05', type: 'RECEIVE', item: 'Tactical boots', contract: 'CT-2026-0012', qty: 300, ref: 'GR-2026-0044', user: 'W. Mendoza' },
  { when: 'Oct 18, 2026 16:30', type: 'PRODUCE', item: 'Embroidered unit patch 3 in', contract: 'CT-2026-0012', qty: 2000, ref: 'JO-2026-0018', user: 'P. Dizon' },
]

export const materials = [
  { code: 'MT-001', name: 'Embroidery thread, navy (cone)', uom: 'cone', onHand: 42, reorder: 20, cost: 185.5, supplier: 'Luzon Thread & Fabrics' },
  { code: 'MT-002', name: 'Embroidery thread, gold (cone)', uom: 'cone', onHand: 18, reorder: 20, cost: 192, supplier: 'Luzon Thread & Fabrics' },
  { code: 'MT-003', name: 'Twill fabric, olive (meter)', uom: 'meter', onHand: 310, reorder: 150, cost: 96.25, supplier: 'Luzon Thread & Fabrics' },
  { code: 'MT-004', name: 'Backing, hook-and-loop (meter)', uom: 'meter', onHand: 95, reorder: 100, cost: 58, supplier: 'Luzon Thread & Fabrics' },
]

export const designs = [
  { id: 1, name: '1ID Shoulder Patch', client: 'Philippine Army – 1st Infantry Division', size: '3 in', stitches: 14200, approved: 'Sep 20, 2026', status: 'Approved' },
  { id: 2, name: 'PNP-4A Name Tape', client: 'PNP Region IV-A Logistics Office', size: '5×1 in', stitches: 3800, approved: 'Aug 30, 2026', status: 'Approved' },
  { id: 3, name: '505th Wing Crest', client: 'Philippine Air Force – 505th Wing', size: '4 in', stitches: 21500, approved: '—', status: 'Pending' },
]

export const jobOrders = [
  { id: 18, no: 'JO-2026-0018', contract: 'CT-2026-0012', design: '1ID Shoulder Patch', qty: 2000, due: 'Oct 20, 2026', machine: 'M-03', status: 'Done' },
  { id: 19, no: 'JO-2026-0019', contract: 'CT-2026-0013', design: 'PNP-4A Name Tape', qty: 1200, due: 'Oct 28, 2026', machine: 'M-01', status: 'In production' },
  { id: 20, no: 'JO-2026-0020', contract: 'CT-2026-0013', design: '1ID Shoulder Patch', qty: 600, due: 'Nov 2, 2026', machine: '—', status: 'Queued' },
  { id: 17, no: 'JO-2026-0017', contract: 'CT-2026-0011', design: 'PNP-4A Name Tape', qty: 900, due: 'Oct 10, 2026', machine: 'M-02', status: 'For QA' },
]

export const deliveries = [
  { id: 27, no: 'DR-2026-0027', contract: 'CT-2026-0012', client: 'Philippine Army – 1st Infantry Division', date: 'Oct 25, 2026', qty: 2296, vehicle: 'Isuzu NPR · ABC 1234', status: 'Accepted' },
  { id: 28, no: 'DR-2026-0028', contract: 'CT-2026-0011', client: 'PNP Region IV-A Logistics Office', date: 'Nov 5, 2026', qty: 400, vehicle: 'Isuzu NPR · ABC 1234', status: 'Scheduled' },
  { id: 26, no: 'DR-2026-0026', contract: 'CT-2026-0010', client: 'Philippine Air Force – 505th Wing', date: 'Sep 10, 2026', qty: 300, vehicle: 'L300 · XYZ 7788', status: 'Delivered' },
]

export const WITHHOLDING = { vat: 0.12, wvat: 0.05, ewt: 0.01 } // stored in Settings (BR-25)
export function billing(gross, gov = true) {
  const base = gross / (1 + WITHHOLDING.vat)
  const vat = gross - base
  const wvat = gov ? base * WITHHOLDING.wvat : 0
  const ewt = gov ? base * WITHHOLDING.ewt : 0
  return { base, vat, wvat, ewt, net: gross - wvat - ewt }
}

export const invoices = [
  { id: 20, bs: 'BS-2026-0020', oi: 'OR-001245', contract: 'CT-2026-0012', client: 'Philippine Army – 1st Infantry Division', date: 'Oct 28, 2026', gross: 2182800, due: 'Nov 27, 2026', status: 'Unpaid', age: 5 },
  { id: 19, bs: 'BS-2026-0019', oi: 'OR-001230', contract: 'CT-2026-0009', client: 'Sentinel Security Services Inc.', date: 'Jul 10, 2026', gross: 480000, due: 'Aug 9, 2026', status: 'Overdue', age: 85 },
  { id: 18, bs: 'BS-2026-0018', oi: 'OR-001221', contract: 'CT-2026-0010', client: 'Philippine Air Force – 505th Wing', date: 'Sep 15, 2026', gross: 336000, due: 'Oct 15, 2026', status: 'Partially paid', age: 45 },
  { id: 17, bs: 'BS-2026-0017', oi: 'OR-001180', contract: 'CT-2026-0008', client: 'Philippine Army – 1st Infantry Division', date: 'Apr 25, 2026', gross: 310000, due: 'May 25, 2026', status: 'Paid', age: 0 },
]

export const payments = [
  { date: 'Oct 12, 2026', bs: 'BS-2026-0018', amount: 150000, mode: 'LDDAP-ADA', ref: 'ADA-77412', f2307: 'Received' },
  { date: 'Jun 6, 2026', bs: 'BS-2026-0017', amount: 297000, mode: 'LDDAP-ADA', ref: 'ADA-66120', f2307: 'Received' },
  { date: 'May 30, 2026', bs: 'BS-2026-0016', amount: 120000, mode: 'Bank transfer', ref: 'BT-5590', f2307: 'Pending' },
]

export const supplierBills = [
  { bill: 'SB-1180', supplier: 'Propper USA (PH distributor)', po: 'PO-2026-0031', date: 'Oct 21, 2026', amount: 1657600, due: 'Nov 20, 2026', status: 'Unpaid' },
  { bill: 'SB-1175', supplier: 'Rudy Project Philippines', po: 'PO-2026-0025', date: 'Sep 2, 2026', amount: 215000, due: 'Oct 2, 2026', status: 'Overdue' },
  { bill: 'SB-1160', supplier: 'Under Armour Philippines', po: 'PO-2026-0022', date: 'Aug 12, 2026', amount: 188000, due: 'Sep 26, 2026', status: 'Paid' },
]

export const users = [
  { id: 1, name: 'Ana Reyes', email: 'admin@aimforce.example', role: 'admin', status: 'Active', last: 'Today 08:02' },
  { id: 2, name: 'Gen. Manager', email: 'gm@aimforce.example', role: 'gm', status: 'Active', last: 'Today 07:55' },
  { id: 3, name: 'Bea Navarro', email: 'bidding@aimforce.example', role: 'bidding', status: 'Active', last: 'Yesterday' },
  { id: 4, name: 'Paolo Lim', email: 'purchasing@aimforce.example', role: 'purchasing', status: 'Active', last: 'Today 08:30' },
  { id: 5, name: 'Wilma Mendoza', email: 'warehouse@aimforce.example', role: 'warehouse', status: 'Active', last: 'Today 09:10' },
  { id: 6, name: 'Pedro Dizon', email: 'production@aimforce.example', role: 'production', status: 'Active', last: 'Yesterday' },
  { id: 7, name: 'Carla Ramos', email: 'qa@aimforce.example', role: 'qa', status: 'Active', last: 'Today 08:45' },
  { id: 8, name: 'Ria Santos', email: 'accounting@aimforce.example', role: 'accounting', status: 'Active', last: 'Today 08:12' },
  { id: 9, name: 'Maj. R. Dela Cruz', email: 'client@1id.example', role: 'client', status: 'Active', last: '3 days ago' },
  { id: 10, name: 'Old Intern Account', email: 'intern@aimforce.example', role: 'purchasing', status: 'Inactive', last: 'Aug 1' },
]

export const audit = [
  { when: 'Oct 28, 2026 10:21', user: 'Ria Santos', action: 'created', subject: 'Invoice BS-2026-0020', change: 'status: — → Unpaid' },
  { when: 'Oct 22, 2026 09:12', user: 'Wilma Mendoza', action: 'created', subject: 'RTS-2026-0003', change: 'quantity: 4' },
  { when: 'Oct 6, 2026 14:02', user: 'Gen. Manager', action: 'approved', subject: 'PO-2026-0031', change: 'status: For approval → Approved' },
  { when: 'Oct 6, 2026 09:30', user: 'Paolo Lim', action: 'created', subject: 'PO-2026-0031', change: 'total: 1,680,000.00' },
  { when: 'Oct 5, 2026 11:00', user: 'Bea Navarro', action: 'updated', subject: 'CT-2026-0012', change: 'ntp_date: — → 2026-10-05' },
]

export const notifications = [
  { id: 1, tone: 'amber', text: 'CT-2026-0012 is At risk: 4 boots and 150 eyewear undelivered, 7 days left.', time: '2 h ago', link: '#/contracts/12' },
  { id: 2, tone: 'amber', text: 'Price agreement PA-2026-004 (Rudy Project) expires in 22 days.', time: '5 h ago', link: '#/price-agreements' },
  { id: 3, tone: 'amber', text: 'Raw material MT-002 (gold thread) is at its reorder point.', time: 'Yesterday', link: '#/materials' },
  { id: 4, tone: 'red', text: 'CT-2026-0010 passed its deadline. Penalty exposure is building.', time: 'Yesterday', link: '#/contracts/10' },
  { id: 5, tone: 'teal', text: 'PO-2026-0033 needs GM approval.', time: '2 days ago', link: '#/approvals' },
]

export const approvals = [
  { id: 1, kind: 'Purchase order', ref: 'PO-2026-0033', by: 'Paolo Lim', amount: 320000, date: 'Oct 2, 2026' },
  { id: 2, kind: 'Stock adjustment', ref: 'ADJ-0007 · Tactical boots size 9', by: 'Wilma Mendoza', amount: 0, date: 'Oct 1, 2026' },
  { id: 3, kind: 'Reallocation', ref: 'CT-2026-0010 → CT-2026-0011 · 20 flight suits', by: 'Paolo Lim', amount: 0, date: 'Sep 30, 2026' },
]

export const portalDocs = [
  { type: 'Delivery Receipt', no: 'DR-2026-0027', contract: 'CT-2026-0012', date: 'Oct 25, 2026' },
  { type: 'Billing Statement', no: 'BS-2026-0020', contract: 'CT-2026-0012', date: 'Oct 28, 2026' },
  { type: 'Delivery Receipt', no: 'DR-2026-0014', contract: 'CT-2026-0008', date: 'Apr 10, 2026' },
]