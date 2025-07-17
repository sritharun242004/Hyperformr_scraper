# 

**Hyperformr Scraper** is a comprehensive business intelligence tool that scrapes and analyzes any business website to extract over 20 structured data points. It enables users and admins to profile companies, understand key metrics, and compare across industries — all without using any language models.

---

## Features

- Extracts structured data from business websites including:
  - Company name
  - Location
  - Size (number of employees)
  - Revenue estimates
  - Net worth (if found)
  - Industry classification
  - Business model (B2B, B2C, SaaS, etc.)
  - Founding year
  - Leadership team (CEO, CTO, Founders, etc.)
  - Keywords and strategic focus areas
- Deep website crawling across internal pages
- Stores all findings in a structured database
- Displays results in a searchable, filterable dashboard
- Summarizes raw page content up to 2000 characters
- Timestamped entries for tracking updates
- Fully modular scraper and backend structure
- Designed for admin-controlled systems

---

### UI Changes
- Minimalist dashboard showing only:
  - Total Businesses
  - Recently Added Companies

---

## Admin Features

- Admin can view and manage all scraped businesses
- Support for multi-component system scaling
- Filter by date, industry, size, and keywords

---

## Screenshots

### Dashboard Overview
![Dashboard Screenshot]("Hyperformr_scraper/output/sc.png)

### Scraped Company Profile
![Company Detail Screenshot]("Hyperformr_scraper/output/sc2.png)

---

## Tech Stack

- Python (BeautifulSoup, Requests)
- Flask API
- Supabase for database

---

## How It Works

1. User submits a business website URL
2. Scraper fetches the homepage and top internal pages
3. Extracts visible content and relevant patterns using regex
4. Stores results in the database
5. Frontend displays structured data in a dashboard

---

