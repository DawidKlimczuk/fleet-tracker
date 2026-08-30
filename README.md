# 🚛 FleetMaster — Fleet Management & Live TCO Analytics System

A production-ready, full-stack fleet management platform engineered to monitor commercial vehicle lifecycles, log operational expenses, and calculate Total Cost of Ownership (TCO) metrics in real time.

<img width="1919" height="905" alt="image" src="https://github.com/user-attachments/assets/81e31594-3af7-4a45-8466-d1395b1dc2c4" />


## 🌐 Live Application
- **Production URL:** [https://fleet-tracker-delta.vercel.app](https://fleet-tracker-delta.vercel.app)
- **Source Code:** [https://github.com/DawidKlimczuk/fleet-tracker](https://github.com/DawidKlimczuk/fleet-tracker)

---

## ⚡ Key Highlights & Architecture

- **Live Fleet Registry:** Full lifecycle management (mileage logging, vehicle metadata, dynamic status switching: *Active / In Service / Inactive*).
- **Expense & Cost Engine:** Relational cost logging categorized into fuel, servicing, and repairs with automatic vehicle attribution.
- **Automated TCO & KPI Tracking:** Real-time calculation of fleet expenditure, aggregate mileage, and cost-per-kilometer ($PLN/km$) efficiency.
- **Data Visualizations:** Interactive TCO comparison charts powered by Recharts.
- **Server-Side Mutations:** Next.js Server Actions with immediate cache revalidation (`revalidatePath`).
- **Cloud Persistence:** Managed PostgreSQL on Supabase accessed through Prisma ORM singleton pooling.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 / 15 (App Router, Server Actions) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Hosted on Supabase) |
| **ORM** | Prisma 5 |
| **Styling** | Tailwind CSS (Dark Mode UI) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone [https://github.com/DawidKlimczuk/fleet-tracker.git](https://github.com/DawidKlimczuk/fleet-tracker.git)
cd fleet-tracker
npm install
2. Configure Environment Variables  
Create a .env file in the root directory:  

Fragment kodu
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT]:[PASSWORD]@aws-0-[REGION][.pooler.supabase.com:6543/postgres?pgbouncer=true](https://.pooler.supabase.com:6543/postgres?pgbouncer=true)"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT]:[PASSWORD]@aws-0-[REGION][.pooler.supabase.com:5432/postgres](https://.pooler.supabase.com:5432/postgres)"
3. Sync Database Schema & Run
Bash
npx prisma db push
npm run dev
Open http://localhost:3000 to view the application.
