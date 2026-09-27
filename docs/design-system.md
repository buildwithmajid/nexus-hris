# Design System: Nexus HRIS (Enterprise HR & Payroll Platform)

## 1. Visual Theme & Atmosphere
Nexus HRIS is an enterprise-grade Human Resource Information & Statutory Payroll Management System designed specifically for Indonesian mid-market businesses and compliant with PP 58/2023, PMK 168/2023 (PPh 21 TER), BPJS Kesehatan & Ketenagakerjaan regulations.

The visual atmosphere is **authoritative, trustworthy, and utilitarian-modern** — evoking the operational rigor of Workday and Deel combined with the clean typographic discipline of Linear and Gusto. It strictly departs from generic "AI dashboard templates":
- **Dashboard & Tables Density (Cockpit / High-Density - 8/10):** High information density for HR Admin and Finance workflows, allowing simultaneous comparison of attendance logs, payroll components, and employee master records without excessive scrolling. Numbers are formatted with monospace fonts and strict tabular alignments.
- **Self-Service & Approval Density (Balanced - 5/10):** Calibrated breathing room for Staff attendance clock-in, leave requests, and Manager multi-level approval sheets to minimize friction and prevent decision fatigue.
- **Variance & Structure (5/10):** Purposeful asymmetric split views (e.g., summary metrics panel paired with comprehensive data table; master-detail approval drawer).

---

## 2. Color Palette & Roles

Nexus uses a restrained, corporate high-contrast palette anchored by deep marine navy and precise enterprise teal, eliminating decorative gradients and neon hues.

| Token Name | Hex Code | Functional Role |
|---|---|---|
| **Nexus Marine Navy (Primary)** | `#0A2540` | Global brand anchor, primary buttons, active sidebar navigation, high-contrast headings |
| **Precision Teal (Accent)** | `#0D9488` | High-priority interactive actions, clock-in CTA, active tabs, focus rings |
| **Canvas Slate (Background)** | `#F8FAFC` | Primary application canvas background (Slate-50) |
| **Surface Pure (Card/Modal)** | `#FFFFFF` | Container panels, data cards, input backgrounds, modal surfaces |
| **Slate Charcoal (Text Primary)**| `#0F172A` | Primary typography, headers, high-importance data metrics (Slate-900) |
| **Steel Slate (Text Secondary)** | `#64748B` | Secondary labels, timestamps, metadata, helper texts (Slate-500) |
| **Subtle Border (Divider)** | `#E2E8F0` | Structural dividers, 1px card boundaries, table grid lines (Slate-200) |
| **Approved / Success** | `#059669` | Approved requests, on-time attendance, net disbursement verified (Emerald-600) |
| **Approved Surface** | `#ECFDF5` | Emerald tint badge container |
| **Pending / Review** | `#D97706` | Awaiting manager/finance approval, draft payroll runs (Amber-600) |
| **Pending Surface** | `#FFFBEB` | Amber tint badge container |
| **Rejected / Critical Alert** | `#DC2626` | Rejected claims, late/alpha infractions, tax discrepancy warnings (Rose-600) |
| **Rejected Surface** | `#FEF2F2` | Rose tint badge container |

### Strict Color Bans
- **BANNED:** Purple-to-blue neon gradients, glowing button halos, rainbow status chips.
- **BANNED:** Pure pitch black (`#000000`) for text or backgrounds.

---

## 3. Typography Architecture

- **Primary Display & Headings:** `Geist Sans`
  - Scale: `text-2xl` to `text-3xl` for page headers, `text-lg` for section headers.
  - Tracking: `-0.02em` (tight, crisp, non-shouting).
- **Body & UI Elements:** `Geist Sans`
  - Scale: `13px` / `14px` (`text-xs` / `text-sm`) with relaxed `1.45` line-height for dense corporate readability.
  - Weights: `400` (Regular), `500` (Medium) for labels, `600` (Semibold) for table headers and titles.
- **Tabular & Financial Monospace:** `JetBrains Mono`
  - Mandatory for: Currency amounts (`Rp 18.500.000`), Tax calculations (TER PPh 21 rate `1.25%`), Employee NIK (`3171020904900001`), Clock-in timestamps (`08:42:15 WIB`), Geolocation coordinates (`-6.2088, 106.8456`).
- **Typography Bans:**
  - `Inter` is banned to avoid generic boilerplate appearance.
  - Serif fonts are strictly banned across all dashboard and data screens.

---

## 4. Component Stylings & Interaction Rules

### Buttons
- **Shape & Border:** Subtle 4px radius (`rounded-md`), flat elevation, 1px structural stroke.
- **Primary:** Background `#0A2540`, text `#FFFFFF`, hover `#1E3A8A`.
- **Accent Primary:** Background `#0D9488`, text `#FFFFFF`, hover `#0F766E`.
- **Secondary / Outline:** Background `#FFFFFF`, border `#CBD5E1`, text `#0F172A`, hover `#F1F5F9`.
- **Ghost:** No border, transparent background, text `#64748B`, hover `#F1F5F9`.
- **Feedback:** Tactile `translate-y-[1px]` on active press. Never use neon box-shadows.

### Data Tables & Cockpit Grids
- **Header:** Background `#F8FAFC`, uppercase label tracking `0.05em`, text `11px font-semibold text-slate-500`, border-b `1px solid #E2E8F0`.
- **Rows:** Alternating subtle hover `#F8FAFC`, 1px hairline row separators. No heavy card wrappers inside tables.
- **Alignment:** Strings and employee profiles left-aligned; status chips centered; monetary sums and hours right-aligned in monospace.

### Status Pills & Chips
- Rounded-full pill container (`px-2.5 py-0.5 text-xs font-medium`), with a 1px matching border.
- Never use solid bright red or saturated green boxes; use tinted backgrounds (`bg-emerald-50 text-emerald-700 border-emerald-200`).

### Forms & Input Architecture
- Clear vertical stack: Field label above input (`text-xs font-semibold text-slate-700 mb-1`), optional helper text (`text-slate-400 text-xs`), 1px Slate border `#CBD5E1`, focus ring `2px solid #0D9488`.
- Form inputs have distinct background `#FFFFFF`, rounded 4px.

---

## 5. Layout & Persona Architecture

### Global Enterprise Layout
- **Sidebar Navigation:** 240px fixed width, structured by role permissions:
  - Global brand mark "Nexus HRIS" with company switcher (`PT Nusantara Digital Solusi`).
  - Active navigation indicator in `#0D9488` with subtle background tint.
  - Persona Switcher / Profile drawer at the bottom allowing instant review as *HR Admin*, *Karyawan (Staff)*, *Manager*, or *Finance*.
- **Top Bar:** 60px height, breadcrumb trail, global search (karyawan, NIK, payroll period), status indicator ("Periode Aktif: September 2026"), and notification bell.
- **Main View:** Fluid container with max-width `1440px`, padding `p-6` to `p-8`.

---

## 6. Motion Philosophy & Micro-Interactions
- **Physics:** Subtle, fast spring transitions (`stiffness: 120, damping: 20`).
- **Tab & Filter switches:** Instant zero-jank cross-fade (`duration: 150ms`).
- **Modal & Drawer Entries:** Slide-in from right for master-detail approval drawer with backdrop opacity transition.
- **No unnecessary animations:** No bouncing buttons, rotating cards, or whimsical floaters.

---

## 7. Anti-Patterns & AI-Tells Banned
- ❌ No emojis in UI buttons, tables, or navigation items.
- ❌ No generic placeholder names ("John Doe", "Jane Smith", "Acme Inc"). Use realistic Indonesian corporate names ("Ahmad Fauzi", "Dewi Sartika", "Bambang Pamungkas", "PT Solusi Bahtera Nusantara").
- ❌ No rounded pill buttons on square card containers.
- ❌ No fake round numbers (`50%`, `100%`). Use real operational metrics (`96.4% Kehadiran`, `Rp 248.550.000 Biaya Payroll`).
- ❌ No marketing fluff phrases ("Elevate your workforce"). Use direct enterprise operational verbs ("Jalankan Payroll", "Setujui Cuti", "Ekspor Slip Gaji").
