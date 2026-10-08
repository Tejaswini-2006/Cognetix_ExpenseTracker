# 💰 Expense Tracker

## 📌 Project Overview

This **Expense Tracker** application was developed as **Project 2** of the **Cognetix Technology Full Stack Developer Internship**.

The application is a polished, professional, and responsive web tool designed to help users track personal income and expenses, monitor current balance, review monthly financial breakdowns, and analyze spending patterns by category.

---

## ✨ Features

- **Transaction Management**: Add income or expense transactions with category, amount, description, and date.
- **Edit & Delete Functionality**: Modify existing transactions in place or delete with a confirmation modal.
- **Live Financial Summaries**: Real-time calculation of Total Income, Total Expenses, and Net Balance with clear status badges.
- **Monthly Breakdown**: Filter financial metrics (income, expense, net savings) by selected month with an interactive expense-to-income progress bar.
- **Expense Category Insights**: Visual CSS bar summaries showing expense distribution by category (Food, Housing, Shopping, Utilities, etc.).
- **Search & Filtering**: Search transactions by keyword, filter by transaction type (Income/Expense), filter by specific categories, and sort by date or amount.
- **Persistent Data**: Stores all transactions in browser `LocalStorage` (`expenseTrackerTransactions`) so data remains intact across page refreshes.
- **Form Validation**: Strict client-side form validation (rejects zero/negative amounts, empty descriptions, or missing dates) with user-friendly inline messages.
- **Toast Notifications**: Non-intrusive toast messages providing feedback for add, update, delete, and data reset operations.
- **Responsive & Accessible UI**: Responsive layout designed for Desktop, Tablet, and Mobile screens with full keyboard accessibility.

---

## 🛠️ Technologies Used

- **HTML5**: Semantic tags (`<header>`, `<main>`, `<section>`, `<article>`, `<form>`)
- **CSS3**: Vanilla CSS with custom properties (CSS variables), CSS Grid, Flexbox, smooth transitions, and custom UI components
- **JavaScript (ES6+)**: DOM manipulation, event listeners, array methods, local storage API, and `Intl.NumberFormat` for currency formatting
- **Browser LocalStorage**: Data persistence
- **Git & GitHub**: Version control and source code hosting
- **VS Code**: Code editor

---

## 📂 Project Structure

```
Cognetix_ExpenseTracker/
├── index.html
├── style.css
├── script.js
├── README.md
├── .gitignore
└── assets/
    └── favicon.svg
```

---

## 🚀 How to Run

1. **Clone or Download Repository**:
   ```bash
   git clone https://github.com/Tejaswini-2006/Cognetix_ExpenseTracker.git
   ```
2. **Open Project**:
   - Open the `Cognetix_ExpenseTracker` folder in VS Code or your preferred text editor.
3. **Launch Application**:
   - Open `index.html` directly in any standard web browser (Chrome, Firefox, Edge, Safari), or
   - Use the **Live Server** extension in VS Code.

---

## 💾 Data Storage

Transactions are stored in browser **LocalStorage** under the key `expenseTrackerTransactions`. Data persists across browser refreshes and sessions without requiring any backend server or database.

---

## 📱 Responsive Design

Tested and optimized for all viewport breakpoints:
- **Desktop**: 1920px, 1440px, 1366px
- **Tablet**: 820px, 768px
- **Mobile**: 430px, 390px, 375px, 320px

Layout automatically adjusts summary cards, form inputs, and transaction item views for seamless mobile usage without horizontal scrolling.

---

## 🧪 Testing

The following scenarios were verified:
1. Form submission with invalid inputs (empty fields, 0 amount, negative values)
2. Adding income and expense transactions
3. Real-time updates of Total Balance, Income, and Expense cards
4. Editing transactions and saving updates to LocalStorage
5. Deleting transactions with custom confirmation dialog
6. Data persistence after refreshing the browser page
7. Search by description and category filtering
8. Monthly summary calculations based on selected month
9. Clean empty state display when no transactions are present
10. Mobile responsiveness and accessibility checks

---

## 🎓 Internship

**Cognetix Technology**  
Full Stack Developer Internship  
**Project 2 – Expense Tracker**

---

## 👩‍💻 Author

**Tejaswini Rakhunde**  
GitHub Profile: [https://github.com/Tejaswini-2006](https://github.com/Tejaswini-2006)
