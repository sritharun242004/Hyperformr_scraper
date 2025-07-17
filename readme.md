# Hyperformr Scraper

**Hyperformr Scraper** is a business intelligence tool that extracts and analyzes data from company websites to build rich profiles. It scrapes key details from homepage and internal pages—enabling admins and users to derive actionable insights without the use of large language models.

---

## 🚀 How It Works

1. User submits a company or business website URL.
2. Scraper fetches the homepage and top internal pages.
3. Extracts key information using regex and rule-based parsing.
4. Stores structured results in a database.
5. Frontend dashboard displays the business intelligence insights.

---

## 🔍 Key Features

- Extracts over 20 structured data points, including:
  - ✅ Company Name
  - 📍 Location
  - 👥 Company Size (Employees)
  - 💰 Revenue Estimates
  - 📊 Net Worth (if available)
  - 🏭 Industry Classification
  - 🔄 Business Model (B2B, B2C, SaaS, etc.)
  - 📆 Founding Year
  - 👤 Leadership (CEO, CTO, Founders, etc.)
  - 🔑 Strategic Keywords / Focus Areas
- Deep website crawling across key internal pages.
- Stores all findings in a structured database (SQL/NoSQL compatible).
- Displays results via a responsive and filterable dashboard.
- Summarizes raw HTML content (up to 2000 characters).
- Timestamped business entries for tracking freshness.
- Modular scraper + backend architecture for scaling and customization.

---

## 🖥️ UI Overview

- 📊 **Minimalist Dashboard**  
  - Total Businesses Count  
  - Recently Added Companies  
  - Quick filters and keyword highlights

---

## 🔐 Admin Features

- Full admin access to all scraped businesses
- Filter/search by:
  - Date Added
  - Industry
  - Company Size
  - Revenue Range
  - Keywords
- Scalable system design for multi-component deployments

---

## 📂 Project Structure

