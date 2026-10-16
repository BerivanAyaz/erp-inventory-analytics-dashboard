# 📊 Enterprise ERP & Multi-Period Sales/Inventory Management Dashboard

## 📌 Overview
This application is an intelligent decision-support dashboard that processes enterprise ERP data to provide comprehensive sales, inventory, and profitability analysis across multi-period intervals (monthly and cumulative 6-month views). The user interface consolidates product-based risk matrices, warehouse shipment trends, and revenue shifts into a single executive screen. It delivers clear insights to management regarding stock turnover, capital efficiency, and strategic action plans.

---

## 📸 Screenshots

### 1. Executive Dashboard & Multi-Period KPI View
<img width="1883" height="708" alt="image" src="https://github.com/user-attachments/assets/9e991e72-4f8f-4cf5-b480-3ce8540d1fa4" />

### 2. Profit Margin, Inventory Efficiency & Risk Matrix Table
<img width="1877" height="440" alt="image" src="https://github.com/user-attachments/assets/4d3a5e9f-d6b9-4c36-b6ab-bc7f589044b7" />
<img width="1883" height="473" alt="image" src="https://github.com/user-attachments/assets/bd5b97db-f55e-4a87-99df-4163c0f8ab31" />

### 3. AI-Powered Executive Strategy Summary & Action Plan
<img width="1886" height="857" alt="image" src="https://github.com/user-attachments/assets/10ac9700-7edf-462e-af68-8e15522305f7" />
<img width="1887" height="852" alt="image" src="https://github.com/user-attachments/assets/f8ef45f4-37e1-49b2-aa4f-eb66dacc485e" />
<img width="1888" height="847" alt="image" src="https://github.com/user-attachments/assets/50150780-4d50-44e0-a16c-b43e25cb4a51" />

### 4. Interactive ERP Data Assistant (Chatbot) 🤖
The floating assistant interface in the bottom right corner is a **fully interface-based static simulation** designed for managers to query insights. It dynamically injects the selected period (`selectedPeriod`) into pre-defined structured context templates.

<img width="491" height="527" alt="image" src="https://github.com/user-attachments/assets/4ed85907-6d5b-47bd-8f36-75272ef79283" />

---

## 🛠️ Tech Stack & AI Integration

- **Frontend & Framework:** Next.js (React), TypeScript, Tailwind CSS. Chosen for rapid component development, strict type safety, and flexible state management. Charts are rendered using Recharts.
- **AI Integration:** **Google Gemini API**. Chosen for its capacity to handle analytical context quickly, cost-efficiency, and natural language structured reporting capabilities.

---

## 🔄 Dynamic Multi-Period Filtering
The application dynamically parses the period (`donem`) column to populate filter options (e.g., individual months or "All Periods / 6-Month Cumulative"). Based on the selected filter:
- KPI cards, time-series charts, and warehouse shipment trends update instantaneously.
- The AI Executive Strategy Summary recalculates metrics tailored to that specific timeframe.

---

## 🚀 Production Considerations
If scaling this dashboard for a real-world enterprise production environment:
- **Scalability:** Migrate from static CSV processing to an MSSQL / MongoDB backend with server-side pagination using Prisma or Drizzle ORM.
- **Security:** Implement Role-Based Access Control (RBAC) via NextAuth / Auth.js for C-Level executives and warehouse supervisors.
- **Caching & Cost Optimization:** Implement a centralized server-side caching layer (such as Redis) to prevent redundant LLM API calls for identical period requests.

---

## 📦 Installation & Getting Started

To run this project locally:

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/BerivanAyaz/sonart-dashboard.git](https://github.com/BerivanAyaz/sonart-dashboard.git)
   cd sonart-dashboard
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a .env.local file in the root directory and add your Gemini API key:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
