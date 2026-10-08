/**
 * Cognetix Expense Tracker - Core Application Logic
 * Developer: Tejaswini Rakhunde
 * Project: Cognetix Technology Full Stack Developer Internship - Project 2
 */

(function () {
    'use strict';

    // ==========================================
    // 1. CONSTANTS & INITIAL STATE
    // ==========================================
    const STORAGE_KEY = 'expenseTrackerTransactions';

    // Demo Data for quick testing & preview
    const DEMO_TRANSACTIONS = [
        {
            id: 'tx_demo_1',
            type: 'income',
            description: 'Monthly Salary',
            amount: 45000,
            category: 'Salary',
            date: '2026-10-01'
        },
        {
            id: 'tx_demo_2',
            type: 'expense',
            description: 'Apartment Rent',
            amount: 15000,
            category: 'Housing & Rent',
            date: '2026-10-02'
        },
        {
            id: 'tx_demo_3',
            type: 'expense',
            description: 'Supermarket Groceries',
            amount: 3200,
            category: 'Food & Dining',
            date: '2026-10-04'
        },
        {
            id: 'tx_demo_4',
            type: 'income',
            description: 'Freelance Web Design',
            amount: 12500,
            category: 'Freelance',
            date: '2026-10-05'
        },
        {
            id: 'tx_demo_5',
            type: 'expense',
            description: 'Electricity & Wifi Bill',
            amount: 2400,
            category: 'Utilities & Bills',
            date: '2026-10-06'
        }
    ];

    let transactions = [];
    let editingId = null;
    let pendingConfirmAction = null;

    // ==========================================
    // 2. DOM ELEMENT REFERENCES
    // ==========================================
    const form = document.getElementById('transaction-form');
    const transactionIdInput = document.getElementById('transaction-id');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const categorySelect = document.getElementById('category');
    const dateInput = document.getElementById('date');
    const submitBtn = document.getElementById('submit-btn');
    const submitBtnText = document.getElementById('submit-btn-text');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editBadge = document.getElementById('edit-badge');

    // Error Message Elements
    const descriptionError = document.getElementById('description-error');
    const amountError = document.getElementById('amount-error');
    const categoryError = document.getElementById('category-error');
    const dateError = document.getElementById('date-error');

    // Summary Card Elements
    const totalBalanceEl = document.getElementById('total-balance');
    const balanceStatusEl = document.getElementById('balance-status');
    const balanceStatusTextEl = document.getElementById('balance-status-text');
    const totalIncomeEl = document.getElementById('total-income');
    const incomeCountEl = document.getElementById('income-count');
    const totalExpensesEl = document.getElementById('total-expenses');
    const expenseCountEl = document.getElementById('expense-count');

    // Monthly Summary Elements
    const monthPicker = document.getElementById('month-picker');
    const monthlyIncomeEl = document.getElementById('monthly-income');
    const monthlyExpensesEl = document.getElementById('monthly-expenses');
    const monthlyBalanceEl = document.getElementById('monthly-balance');
    const savingsRatioText = document.getElementById('savings-ratio-text');
    const savingsProgressBar = document.getElementById('savings-progress-bar');

    // Category Breakdown Container
    const categoryBarsContainer = document.getElementById('category-bars-container');

    // Transactions List & Filters
    const transactionsList = document.getElementById('transactions-list');
    const emptyState = document.getElementById('empty-state');
    const emptyAddBtn = document.getElementById('empty-add-btn');
    const filterCountBadge = document.getElementById('filter-count-badge');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const typeFilter = document.getElementById('type-filter');
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');

    // Action Header Buttons
    const demoDataBtn = document.getElementById('demo-data-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');

    // Modal Elements
    const confirmModal = document.getElementById('confirm-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const toastContainer = document.getElementById('toast-container');

    // ==========================================
    // 3. UTILITY FUNCTIONS
    // ==========================================

    /**
     * Format number as Indian Rupee currency
     */
    function formatCurrency(amount) {
        if (isNaN(amount) || amount === null) amount = 0;
        try {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            }).format(amount);
        } catch (e) {
            return '₹' + Number(amount).toFixed(2);
        }
    }

    /**
     * Format date string (YYYY-MM-DD) to friendly format (e.g. Oct 08, 2026)
     */
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;

        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        if (isNaN(dateObj.getTime())) return dateStr;

        return dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
    }

    /**
     * Generate unique ID for transactions
     */
    function generateUniqueId() {
        return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    /**
     * Display toast notifications
     */
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconSvg = '';
        if (type === 'success') {
            iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        } else if (type === 'danger') {
            iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
        } else {
            iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        }

        toast.innerHTML = `${iconSvg} <span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Custom confirmation modal popup
     */
    function showConfirmModal(title, message, onConfirm) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        pendingConfirmAction = onConfirm;
        confirmModal.classList.remove('hidden');
    }

    function closeConfirmModal() {
        confirmModal.classList.add('hidden');
        pendingConfirmAction = null;
    }

    // ==========================================
    // 4. STORAGE FUNCTIONS
    // ==========================================

    function loadTransactions() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    transactions = parsed;
                } else {
                    transactions = [];
                }
            } else {
                transactions = [];
            }
        } catch (error) {
            console.error('Error parsing LocalStorage transactions:', error);
            transactions = [];
            showToast('Failed to load stored data. Resetting list.', 'danger');
        }
    }

    function saveTransactions() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
        } catch (error) {
            console.error('Error saving to LocalStorage:', error);
            showToast('Storage space limit reached or LocalStorage unavailable.', 'danger');
        }
    }

    // ==========================================
    // 5. CALCULATION & RENDERING LOGIC
    // ==========================================

    /**
     * Calculate and render overall summary (Total Balance, Income, Expense)
     */
    function calculateSummary() {
        let totalIncome = 0;
        let totalExpenses = 0;
        let incomeCount = 0;
        let expenseCount = 0;

        transactions.forEach(tx => {
            const amt = parseFloat(tx.amount) || 0;
            if (tx.type === 'income') {
                totalIncome += amt;
                incomeCount++;
            } else if (tx.type === 'expense') {
                totalExpenses += amt;
                expenseCount++;
            }
        });

        const totalBalance = totalIncome - totalExpenses;

        // Render Values
        totalIncomeEl.textContent = formatCurrency(totalIncome);
        totalExpensesEl.textContent = formatCurrency(totalExpenses);
        totalBalanceEl.textContent = formatCurrency(totalBalance);

        incomeCountEl.textContent = `${incomeCount} ${incomeCount === 1 ? 'transaction' : 'transactions'}`;
        expenseCountEl.textContent = `${expenseCount} ${expenseCount === 1 ? 'transaction' : 'transactions'}`;

        // Status indicator update
        balanceStatusEl.className = 'status-pill';
        if (totalBalance > 0) {
            balanceStatusEl.classList.add('status-positive');
            balanceStatusTextEl.textContent = 'Net Surplus';
        } else if (totalBalance < 0) {
            balanceStatusEl.classList.add('status-negative');
            balanceStatusTextEl.textContent = 'Net Deficit';
        } else {
            balanceStatusEl.classList.add('status-neutral');
            balanceStatusTextEl.textContent = 'Net Zero';
        }
    }

    /**
     * Calculate and render monthly summary for selected month
     */
    function renderMonthlySummary() {
        const selectedMonth = monthPicker.value; // Format: "YYYY-MM"
        if (!selectedMonth) return;

        let mIncome = 0;
        let mExpenses = 0;

        transactions.forEach(tx => {
            if (tx.date && tx.date.startsWith(selectedMonth)) {
                const amt = parseFloat(tx.amount) || 0;
                if (tx.type === 'income') {
                    mIncome += amt;
                } else if (tx.type === 'expense') {
                    mExpenses += amt;
                }
            }
        });

        const mBalance = mIncome - mExpenses;

        monthlyIncomeEl.textContent = formatCurrency(mIncome);
        monthlyExpensesEl.textContent = formatCurrency(mExpenses);
        monthlyBalanceEl.textContent = formatCurrency(mBalance);

        // Savings percentage ratio
        let expenseRatio = 0;
        if (mIncome > 0) {
            expenseRatio = Math.min(100, Math.round((mExpenses / mIncome) * 100));
        } else if (mExpenses > 0) {
            expenseRatio = 100;
        }

        savingsRatioText.textContent = `${expenseRatio}% spent`;
        savingsProgressBar.style.width = `${expenseRatio}%`;

        if (expenseRatio > 85) {
            savingsProgressBar.className = 'progress-bar-fill high-expense';
        } else {
            savingsProgressBar.className = 'progress-bar-fill';
        }
    }

    /**
     * Render expense category visual bars
     */
    function renderCategorySummary() {
        categoryBarsContainer.innerHTML = '';

        const categoryTotals = {};
        let totalExpenseSum = 0;

        transactions.forEach(tx => {
            if (tx.type === 'expense') {
                const amt = parseFloat(tx.amount) || 0;
                categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;
                totalExpenseSum += amt;
            }
        });

        const categories = Object.keys(categoryTotals);

        if (categories.length === 0 || totalExpenseSum === 0) {
            categoryBarsContainer.innerHTML = `
                <p class="card-meta" style="text-align: center; padding: 1rem 0;">No expenses recorded yet.</p>
            `;
            return;
        }

        // Sort categories by highest expense
        categories.sort((a, b) => categoryTotals[b] - categoryTotals[a]);

        categories.slice(0, 5).forEach(cat => {
            const amount = categoryTotals[cat];
            const percentage = Math.round((amount / totalExpenseSum) * 100);

            const catItemHtml = `
                <div class="cat-bar-item">
                    <div class="cat-bar-info">
                        <span>${cat}</span>
                        <span>${formatCurrency(amount)} (${percentage}%)</span>
                    </div>
                    <div class="cat-bar-track">
                        <div class="cat-bar-fill" style="width: ${percentage}%;"></div>
                    </div>
                </div>
            `;
            categoryBarsContainer.insertAdjacentHTML('beforeend', catItemHtml);
        });
    }

    /**
     * Populate Category Filter dropdown options dynamically
     */
    function updateCategoryFilterOptions() {
        const currentSelected = categoryFilter.value;
        const categoriesSet = new Set();

        transactions.forEach(tx => {
            if (tx.category) categoriesSet.add(tx.category);
        });

        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        Array.from(categoriesSet).sort().forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            categoryFilter.appendChild(opt);
        });

        if (categoriesSet.has(currentSelected)) {
            categoryFilter.value = currentSelected;
        } else {
            categoryFilter.value = 'all';
        }
    }

    /**
     * Filter & Render Transaction List
     */
    function renderTransactions() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const typeVal = typeFilter.value;
        const catVal = categoryFilter.value;
        const sortVal = sortSelect.value;

        // Toggle clear search button
        if (searchTerm) {
            clearSearchBtn.classList.remove('hidden');
        } else {
            clearSearchBtn.classList.add('hidden');
        }

        // Apply Filters
        let filtered = transactions.filter(tx => {
            // Search term match
            const matchSearch = !searchTerm || 
                tx.description.toLowerCase().includes(searchTerm) || 
                tx.category.toLowerCase().includes(searchTerm);

            // Type match
            const matchType = typeVal === 'all' || tx.type === typeVal;

            // Category match
            const matchCategory = catVal === 'all' || tx.category === catVal;

            return matchSearch && matchType && matchCategory;
        });

        // Apply Sorting
        filtered.sort((a, b) => {
            if (sortVal === 'date-desc') {
                return new Date(b.date) - new Date(a.date);
            } else if (sortVal === 'date-asc') {
                return new Date(a.date) - new Date(b.date);
            } else if (sortVal === 'amount-desc') {
                return b.amount - a.amount;
            } else if (sortVal === 'amount-asc') {
                return a.amount - b.amount;
            }
            return 0;
        });

        // Update badge count
        filterCountBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'item' : 'items'}`;

        // Render Empty state if no items
        if (filtered.length === 0) {
            transactionsList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        } else {
            emptyState.classList.add('hidden');
        }

        // Render List items
        transactionsList.innerHTML = filtered.map(tx => {
            const isIncome = tx.type === 'income';
            const iconSvg = isIncome
                ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>'
                : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>';

            const amountPrefix = isIncome ? '+' : '-';
            const typeClass = isIncome ? 'income' : 'expense';

            return `
                <div class="tx-item" data-id="${tx.id}">
                    <div class="tx-left">
                        <div class="tx-icon-badge ${typeClass}">
                            ${iconSvg}
                        </div>
                        <div class="tx-details">
                            <span class="tx-description" title="${escapeHtml(tx.description)}">${escapeHtml(tx.description)}</span>
                            <div class="tx-meta">
                                <span class="tx-category-badge">${escapeHtml(tx.category)}</span>
                                <span class="tx-date">&bull; ${formatDate(tx.date)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="tx-right">
                        <div class="tx-amount ${typeClass}">
                            ${amountPrefix}${formatCurrency(tx.amount)}
                        </div>
                        <div class="tx-actions">
                            <button class="icon-btn edit-btn" data-action="edit" data-id="${tx.id}" title="Edit transaction" aria-label="Edit transaction ${escapeHtml(tx.description)}">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="icon-btn delete-btn" data-action="delete" data-id="${tx.id}" title="Delete transaction" aria-label="Delete transaction ${escapeHtml(tx.description)}">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ==========================================
    // 6. FORM VALIDATION & HANDLING
    // ==========================================

    function clearErrors() {
        descriptionError.textContent = '';
        amountError.textContent = '';
        categoryError.textContent = '';
        dateError.textContent = '';

        descriptionInput.classList.remove('invalid');
        amountInput.classList.remove('invalid');
        categorySelect.classList.remove('invalid');
        dateInput.classList.remove('invalid');
    }

    function validateForm() {
        clearErrors();
        let isValid = true;

        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const category = categorySelect.value;
        const date = dateInput.value;

        // Validate Description
        if (!description) {
            descriptionError.textContent = 'Please enter a description.';
            descriptionInput.classList.add('invalid');
            isValid = false;
        } else if (description.length < 2) {
            descriptionError.textContent = 'Description must be at least 2 characters.';
            descriptionInput.classList.add('invalid');
            isValid = false;
        }

        // Validate Amount
        if (isNaN(amount) || amountInput.value.trim() === '') {
            amountError.textContent = 'Please enter an amount.';
            amountInput.classList.add('invalid');
            isValid = false;
        } else if (amount <= 0) {
            amountError.textContent = 'Amount must be greater than ₹0.';
            amountInput.classList.add('invalid');
            isValid = false;
        }

        // Validate Category
        if (!category) {
            categoryError.textContent = 'Please select a category.';
            categorySelect.classList.add('invalid');
            isValid = false;
        }

        // Validate Date
        if (!date) {
            dateError.textContent = 'Please select a valid date.';
            dateInput.classList.add('invalid');
            isValid = false;
        }

        return isValid;
    }

    function getSelectedType() {
        const activeRadio = form.querySelector('input[name="type"]:checked');
        return activeRadio ? activeRadio.value : 'expense';
    }

    function setSelectedType(typeVal) {
        const targetRadio = form.querySelector(`input[name="type"][value="${typeVal}"]`);
        if (targetRadio) {
            targetRadio.checked = true;
            updateTypeButtonClasses();
        }
    }

    function updateTypeButtonClasses() {
        const typeBtns = form.querySelectorAll('.type-btn');
        typeBtns.forEach(btn => {
            const radio = btn.querySelector('input[type="radio"]');
            if (radio && radio.checked) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function resetFormState() {
        form.reset();
        transactionIdInput.value = '';
        editingId = null;
        clearErrors();

        // Default type to income or expense
        setSelectedType('income');

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;

        // Reset edit UI states
        submitBtnText.textContent = 'Add Transaction';
        cancelEditBtn.classList.add('hidden');
        editBadge.classList.add('hidden');
    }

    function handleAddEditSubmit(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const type = getSelectedType();
        const description = descriptionInput.value.trim();
        const amount = Math.round(parseFloat(amountInput.value) * 100) / 100;
        const category = categorySelect.value;
        const date = dateInput.value;

        if (editingId) {
            // Update existing transaction
            const index = transactions.findIndex(t => t.id === editingId);
            if (index !== -1) {
                transactions[index] = {
                    id: editingId,
                    type,
                    description,
                    amount,
                    category,
                    date
                };
                showToast('Transaction updated successfully!', 'success');
            }
        } else {
            // Create new transaction
            const newTransaction = {
                id: generateUniqueId(),
                type,
                description,
                amount,
                category,
                date
            };
            transactions.unshift(newTransaction);
            showToast('Transaction added successfully!', 'success');
        }

        // Save & Refresh UI
        saveTransactions();
        resetFormState();
        updateCategoryFilterOptions();
        refreshAllUI();
    }

    function editTransaction(id) {
        const tx = transactions.find(t => t.id === id);
        if (!tx) return;

        editingId = tx.id;
        transactionIdInput.value = tx.id;
        descriptionInput.value = tx.description;
        amountInput.value = tx.amount;
        categorySelect.value = tx.category;
        dateInput.value = tx.date;
        setSelectedType(tx.type);

        clearErrors();

        // UI state change to editing mode
        submitBtnText.textContent = 'Update Transaction';
        cancelEditBtn.classList.remove('hidden');
        editBadge.classList.remove('hidden');

        // Scroll form smoothly into view on mobile
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        descriptionInput.focus();
    }

    function deleteTransaction(id) {
        const tx = transactions.find(t => t.id === id);
        if (!tx) return;

        showConfirmModal(
            'Delete Transaction',
            `Are you sure you want to delete "${tx.description}" (${formatCurrency(tx.amount)})?`,
            () => {
                transactions = transactions.filter(t => t.id !== id);
                saveTransactions();

                if (editingId === id) {
                    resetFormState();
                }

                updateCategoryFilterOptions();
                refreshAllUI();
                showToast('Transaction deleted.', 'danger');
            }
        );
    }

    /**
     * Refresh all UI components synchronously
     */
    function refreshAllUI() {
        calculateSummary();
        renderMonthlySummary();
        renderCategorySummary();
        renderTransactions();
    }

    // ==========================================
    // 7. EVENT LISTENERS
    // ==========================================

    function initEventListeners() {
        // Form submit
        form.addEventListener('submit', handleAddEditSubmit);

        // Form reset / cancel edit
        cancelEditBtn.addEventListener('click', resetFormState);

        // Type Segmented radio change
        form.querySelectorAll('input[name="type"]').forEach(radio => {
            radio.addEventListener('change', updateTypeButtonClasses);
        });

        // Transaction List Action Delegation (Edit / Delete)
        transactionsList.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.getAttribute('data-action');
            const id = btn.getAttribute('data-id');

            if (action === 'edit') {
                editTransaction(id);
            } else if (action === 'delete') {
                deleteTransaction(id);
            }
        });

        // Filter & Search input handlers
        searchInput.addEventListener('input', renderTransactions);
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            renderTransactions();
            searchInput.focus();
        });

        typeFilter.addEventListener('change', renderTransactions);
        categoryFilter.addEventListener('change', renderTransactions);
        sortSelect.addEventListener('change', renderTransactions);

        // Month Picker Change
        monthPicker.addEventListener('change', renderMonthlySummary);

        // Empty state quick add button
        emptyAddBtn.addEventListener('click', () => {
            descriptionInput.focus();
        });

        // Demo Data Button
        demoDataBtn.addEventListener('click', () => {
            showConfirmModal(
                'Load Demo Data',
                'This will add 5 sample transactions to your tracker. Continue?',
                () => {
                    transactions = [...DEMO_TRANSACTIONS, ...transactions];
                    saveTransactions();
                    updateCategoryFilterOptions();
                    refreshAllUI();
                    showToast('Demo transactions loaded!', 'success');
                }
            );
        });

        // Clear All Data Button
        clearAllBtn.addEventListener('click', () => {
            if (transactions.length === 0) {
                showToast('No transactions to reset.', 'info');
                return;
            }
            showConfirmModal(
                'Reset All Data',
                'Are you sure you want to permanently clear all transactions from LocalStorage?',
                () => {
                    transactions = [];
                    saveTransactions();
                    resetFormState();
                    updateCategoryFilterOptions();
                    refreshAllUI();
                    showToast('All local data cleared.', 'danger');
                }
            );
        });

        // Modal Action Listeners
        modalConfirmBtn.addEventListener('click', () => {
            if (typeof pendingConfirmAction === 'function') {
                pendingConfirmAction();
            }
            closeConfirmModal();
        });

        modalCancelBtn.addEventListener('click', closeConfirmModal);

        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                closeConfirmModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !confirmModal.classList.contains('hidden')) {
                closeConfirmModal();
            }
        });
    }

    // ==========================================
    // 8. APP INITIALIZATION
    // ==========================================

    function initApp() {
        // Set default date in month picker to current year-month
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        monthPicker.value = `${year}-${month}`;

        // Set form default date
        dateInput.value = `${year}-${month}-${String(today.getDate()).padStart(2, '0')}`;

        // Load data from LocalStorage
        loadTransactions();

        // Initialize event listeners
        initEventListeners();

        // Populate category dropdown filters & render UI
        updateCategoryFilterOptions();
        refreshAllUI();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

})();
