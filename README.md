# ManokTrack - Poultry Farm Management System

> **Repository:** [https://github.com/tubalrr/ManokTrack---Poultry-Management](https://github.com/tubalrr/ManokTrack---Poultry-Management)

A complete, production-grade Poultry Farm Management Web Application built with **React 19**, **Tailwind CSS v4**, **Firebase Firestore**, and **Recharts**. Designed for bio-secure commercial poultry growers, layers, and free-range native operations with native support for the Philippine Peso (₱ / PHP).

---

## 🌟 Key Features

### 1. Real-Time Operations Dashboard
- **Livestock Vital Metrics**: Total birds alive across active commercial flocks, today's graded egg harvest, warehouse feed stocks (kg), weekly mortality incidence, and monthly net profit.
- **Visual Analytics (Recharts)**:
  - 7-Day Graded Egg Production vs. 900+ target threshold
  - Feed Consumption Trends (Broiler grower ration vs. steady Layer ration)
  - Daily Flock Mortality Trend
- **Automated Alerts**: Low feed alerts (< 50kg), vaccination due notifications, and high mortality warnings.

### 2. Flock & Batch Management
- Lifecycle tracking from Day-Old Chick (DOC) placement to market harvest or layer culling.
- Auto-computed flock age in days.
- Realtime metrics: Initial headcount, current live count, mortality count, livability percentage, average weight, and calculated FCR.
- Instant actions: **Log Mortality**, **Sell Flock Harvest**, and **Transfer Housing**.

### 3. Daily Production Logs
- Daily logs per batch: Feed consumed (kg), Water consumed (L), Mortality count & veterinary cause, Eggs collected (pcs), and Sample average weight.
- **Automated Inventory Deduction**: Consumed feed is instantly deducted from the warehouse inventory upon log submission.
- Filterable history table with date ranges and CSV export.

### 4. Feed Inventory & FCR Calculator
- Stock tracking across Starter Crumble, Grower Pellet, Layer Mash, and Chick Booster.
- Automated low-stock flags when inventory dips below 50 kg.
- **Interactive Feed Conversion Ratio (FCR) Calculator**:
  $$\text{FCR} = \frac{\text{Total Feed Consumed (kg)}}{\text{Total Weight Gain (kg)} + \text{Egg Mass (kg)}}$$

### 5. Egg Production & Quality Grading (Layers)
- Graded sorting according to Philippine Bureau of Agriculture and Fisheries Standards (BAFS):
  - **Small (Peewee / 45-50g)**
  - **Medium (50-55g)**
  - **Large (55-60g)**
  - **Extra Large (XL / 60g+)**
- Wholesale egg sales ledger with tray pricing (30 eggs/tray) and revenue calculations.

### 6. Health & Biosecurity Protocols
- Philippine Standard Poultry Immunization schedule:
  - Day 1: Marek's Disease (HVT)
  - Day 7: Newcastle (ND B1) + Infectious Bronchitis (IB)
  - Day 14: Infectious Bursal Disease (Gumboro / IBD)
  - Day 21: Newcastle Disease (LaSota Strain)
  - Day 28: Fowl Pox
  - Day 35: Infectious Coryza
  - Day 70: ND + Egg Drop Syndrome (EDS '76)
- Treatment ledger with costs automatically charged to farm operating expenses.

### 7. Financial Ledger & Profit / Loss (P&L)
- **Categorized Expenses**: Feed, Vaccines/Meds, Day-Old Chicks, Caretaker Labor, Electricity/Utilities, and Bedding.
- **Revenue Channels**: Wholesale egg crates, Live bird harvests, and Organic manure sacks.
- Monthly P&L statements and per-flock net margin matrices in Philippine Peso (PHP ₱).

### 8. Official Batch Reports & CSV Audit Dumps
- Printable **Official Batch Performance Dossier** formatted for clean PDF export (`window.print()`).
- One-click CSV exports for Batch dossiers, Daily Logs, and complete Farm Master Data.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React
- **Charts**: Recharts
- **Database & Sync**: Google Cloud Firestore & Firebase Auth
- **Build Tooling**: Vite 8

---

## 🚀 Quick Start

1. **Clone repository**:
   ```bash
   git clone https://github.com/tubalrr/ManokTrack---Poultry-Management.git
   cd ManokTrack---Poultry-Management
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📄 License

Apache-2.0 License.
