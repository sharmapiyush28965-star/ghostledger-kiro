/* GhostLedger App — UI + state management, no external dependencies, no network calls */

// Sample CSV data embedded for offline loading
const SAMPLE_CSV = `Date,Description,Amount
2026-06-01,ACME Corp Salary,3200.00
2026-06-03,Internet - FiberNet,-59.99
2026-06-03,Whole Foods Market,-64.57
2026-06-03,McDonald's,-28.10
2026-06-03,Shell Fuel,-42.79
2026-06-03,Amazon,-45.41
2026-06-03,Local Cafe,-14.88
2026-06-04,FitZone Gym,-29.99
2026-06-04,Mobile - Verizon,-65.00
2026-06-05,Water Utility,-42.00
2026-06-06,Spotify,-11.99
2026-06-08,City Electric,-85.00
2026-06-11,Trader Joe's,-99.53
2026-06-11,DoorDash,-32.35
2026-06-11,Shell Fuel,-33.93
2026-06-11,Amazon,-57.73
2026-06-11,DoorDash,-21.38
2026-06-12,CloudVault Pro,-19.99
2026-06-15,Netflix,-15.49
2026-06-17,Safeway,-109.20
2026-06-17,Starbucks,-13.96
2026-06-17,Shell Fuel,-40.98
2026-06-17,Target,-36.42
2026-06-17,Local Cafe,-16.38
2026-06-18,Retro Gamer Monthly,-9.99
2026-06-22,iCloud Storage,-2.99
2026-06-22,StreamBox Plus,-18.99
2026-06-26,Kroger,-111.54
2026-06-26,DoorDash,-19.93
2026-06-26,Metro Transit,-17.03
2026-06-26,IKEA,-59.91
2026-06-26,Pizza Place,-36.93
2026-07-01,ACME Corp Salary,3200.00
2026-07-04,FitZone Gym,-29.99
2026-07-05,Safeway,-74.28
2026-07-05,McDonald's,-21.25
2026-07-05,Shell Fuel,-39.21
2026-07-05,Amazon,-27.23
2026-07-05,Pizza Place,-27.89
2026-07-06,Spotify,-11.99
2026-07-10,CloudVault Pro,-19.99
2026-07-12,Kroger,-95.37
2026-07-12,Local Cafe,-21.76
2026-07-12,Shell Fuel,-36.49
2026-07-12,Amazon,-69.54
2026-07-13,Netflix,-15.49
2026-07-13,Water Utility,-42.00
2026-07-17,Retro Gamer Monthly,-9.99
2026-07-18,Safeway,-68.25
2026-07-18,Local Cafe,-12.11
2026-07-18,Shell Fuel,-46.34
2026-07-18,IKEA,-36.07
2026-07-19,Mobile - Verizon,-65.00
2026-07-20,iCloud Storage,-2.99
2026-07-24,StreamBox Plus,-18.99
2026-07-24,Whole Foods Market,-110.75
2026-07-24,Chipotle,-29.88
2026-07-24,Uber,-17.50
2026-07-24,Amazon,-58.15
2026-07-25,Internet - FiberNet,-59.99
2026-07-26,City Electric,-85.00
2026-08-01,ACME Corp Salary,3200.00
2026-08-02,Safeway,-89.36
2026-08-02,Starbucks,-32.16
2026-08-02,Metro Transit,-20.62
2026-08-02,Amazon,-85.24
2026-08-04,FitZone Gym,-29.99
2026-08-08,Spotify,-11.99
2026-08-09,Kroger,-107.70
2026-08-09,Pizza Place,-27.91
2026-08-09,Uber,-35.75
2026-08-09,IKEA,-28.21
2026-08-11,Mobile - Verizon,-65.00
2026-08-12,CloudVault Pro,-19.99
2026-08-12,City Electric,-85.00
2026-08-13,Netflix,-15.49
2026-08-13,Water Utility,-42.00
2026-08-16,Internet - FiberNet,-59.99
2026-08-18,Retro Gamer Monthly,-9.99
2026-08-19,Trader Joe's,-114.02
2026-08-19,DoorDash,-25.94
2026-08-19,Metro Transit,-26.36
2026-08-19,IKEA,-66.99
2026-08-19,DoorDash,-13.63
2026-08-22,iCloud Storage,-2.99
2026-08-23,StreamBox Plus,-18.99
2026-08-24,Whole Foods Market,-80.93
2026-08-24,Pizza Place,-22.40
2026-08-24,Uber,-12.26
2026-08-24,IKEA,-65.49
2026-08-24,AMC Cinema,-35.79
2026-09-01,ACME Corp Salary,3200.00
2026-09-02,Trader Joe's,-77.59
2026-09-02,Local Cafe,-13.57
2026-09-02,Uber,-38.04
2026-09-02,IKEA,-61.10
2026-09-02,DoorDash,-34.22
2026-09-05,City Electric,-85.00
2026-09-06,Spotify,-11.99
2026-09-06,FitZone Gym,-29.99
2026-09-10,Whole Foods Market,-67.43
2026-09-10,Local Cafe,-17.21
2026-09-10,Chevron,-28.81
2026-09-10,IKEA,-19.33
2026-09-12,CloudVault Pro,-19.99
2026-09-15,Netflix,-15.49
2026-09-16,Whole Foods Market,-84.55
2026-09-16,Chipotle,-28.82
2026-09-16,Shell Fuel,-20.95
2026-09-16,Amazon,-57.90
2026-09-16,Starbucks,-18.36
2026-09-19,Retro Gamer Monthly,-9.99
2026-09-19,Internet - FiberNet,-59.99
2026-09-21,iCloud Storage,-2.99
2026-09-21,Water Utility,-42.00
2026-09-22,Mobile - Verizon,-65.00
2026-09-23,StreamBox Plus,-18.99
2026-09-24,Whole Foods Market,-86.82
2026-09-24,Pizza Place,-10.55
2026-09-24,Shell Fuel,-46.88
2026-09-24,Amazon,-28.30
2026-09-24,McDonald's,-35.94
2026-10-01,ACME Corp Salary,3200.00
2026-10-02,Trader Joe's,-83.22
2026-10-02,Local Cafe,-14.90
2026-10-02,Chevron,-22.27
2026-10-02,IKEA,-91.59
2026-10-04,City Electric,-85.00
2026-10-05,Internet - FiberNet,-59.99
2026-10-06,FitZone Gym,-29.99
2026-10-08,Spotify,-11.99
2026-10-10,Water Utility,-42.00
2026-10-12,CloudVault Pro,-19.99
2026-10-12,Trader Joe's,-72.63
2026-10-12,McDonald's,-33.19
2026-10-12,Shell Fuel,-38.93
2026-10-12,Amazon,-19.01
2026-10-12,Starbucks,-11.71
2026-10-14,Netflix,-15.49
2026-10-16,Trader Joe's,-65.84
2026-10-16,Starbucks,-25.56
2026-10-16,Uber,-26.54
2026-10-16,IKEA,-34.70
2026-10-18,Retro Gamer Monthly,-9.99
2026-10-20,iCloud Storage,-2.99
2026-10-21,Mobile - Verizon,-65.00
2026-10-23,StreamBox Plus,-18.99
2026-10-23,Kroger,-98.81
2026-10-23,Pizza Place,-21.59
2026-10-23,Metro Transit,-19.35
2026-10-23,IKEA,-40.13
2026-10-23,Starbucks,-30.15
2026-11-01,ACME Corp Salary,3200.00
2026-11-04,FitZone Gym,-29.99
2026-11-04,Kroger,-79.71
2026-11-04,Starbucks,-8.24
2026-11-04,Shell Fuel,-14.64
2026-11-04,Amazon,-55.47
2026-11-04,Local Cafe,-36.43
2026-11-08,Spotify,-11.99
2026-11-10,Safeway,-77.96
2026-11-10,Local Cafe,-29.68
2026-11-10,Metro Transit,-34.02
2026-11-10,IKEA,-57.32
2026-11-12,CloudVault Pro,-19.99
2026-11-13,Netflix,-15.49
2026-11-13,Mobile - Verizon,-65.00
2026-11-14,City Electric,-85.00
2026-11-14,Internet - FiberNet,-59.99
2026-11-17,Retro Gamer Monthly,-9.99
2026-11-18,Whole Foods Market,-114.58
2026-11-18,McDonald's,-14.88
2026-11-18,Shell Fuel,-38.73
2026-11-18,Amazon,-36.79
2026-11-20,iCloud Storage,-2.99
2026-11-22,StreamBox Plus,-18.99
2026-11-25,Trader Joe's,-100.50
2026-11-25,Chipotle,-21.14
2026-11-25,Metro Transit,-44.59
2026-11-25,Amazon,-22.38
`;

// Default budgets in cents
const DEFAULT_BUDGETS = {
  Groceries: 4000000,
  Dining: 1500000,
  Transport: 1200000,
  Shopping: 2000000,
  Entertainment: 800000,
  Bills: 3000000,
  Subscriptions: 600000,
  Health: 1000000,
};

// App state
const state = {
  transactions: [],
  overrides: {},
  exorcised: {},
  budgets: { ...DEFAULT_BUDGETS },
  currency: '$',
};

// Load state from localStorage
function loadState() {
  try {
    const saved = localStorage.getItem('ghostledger.v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(state, parsed);
    }
  } catch (err) {
    console.error('Failed to load state:', err);
  }
}

// Save state to localStorage
function saveState() {
  try {
    localStorage.setItem('ghostledger.v1', JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state:', err);
  }
}

// Escape HTML special characters
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (ch) => map[ch]);
}

// Import CSV
function importText(text) {
  const result = window.GhostLedgerEngine.importCSV(text);
  state.transactions = result.transactions;
  state.overrides = {};
  state.exorcised = {};
  saveState();

  const report = document.getElementById('import-report');
  const reportText = report.querySelector('.gl-import-success');
  reportText.textContent = `✓ Imported ${result.transactions.length} transactions (skipped ${result.skipped}). Date format: ${result.dateInterpretation}`;
  report.style.display = 'block';

  render();
}

// Render dashboard
function render() {
  const hasData = state.transactions.length > 0;

  // Apply overrides and compute summary (always, even if no data for proper clearing)
  const txnsWithOverrides = state.transactions.map((txn) => ({
    ...txn,
    category: state.overrides[txn.id] || txn.category,
  }));

  // Detect subscriptions on all transactions (before filtering exorcised)
  // This ensures exorcised subscriptions are still in the list
  const subscriptions = hasData ? window.GhostLedgerEngine.detectSubscriptions(txnsWithOverrides) : [];

  // Filter subscriptions for the recurring stat (only active/non-exorcised)
  const activeSubscriptions = subscriptions.filter((sub) => !state.exorcised[sub.payee]);

  const summary = hasData ? window.GhostLedgerEngine.summarize(txnsWithOverrides) : {
    incomeCents: 0,
    spendingCents: 0,
    netCents: 0,
    byMonth: {},
    byCategory: {},
  };
  const anomalies = hasData ? window.GhostLedgerEngine.detectAnomalies(txnsWithOverrides) : { duplicates: [], largeTxns: [] };

  // Show/hide sections
  document.querySelectorAll('.gl-section').forEach((el) => {
    el.style.display = '';
  });
  document.querySelector('.gl-stats-section').style.display = '';
  document.querySelector('.gl-data-section').style.display = '';
  document.getElementById('import-report').style.display = hasData ? 'block' : 'none';

  const monthCount = Object.keys(summary.byMonth).length;
  const incomeTxnCount = txnsWithOverrides.filter((t) => t.amountCents > 0).length;
  const spendingTxnCount = txnsWithOverrides.filter((t) => t.amountCents < 0).length;

  document.getElementById('stat-income').textContent = window.GhostLedgerEngine.formatCents(
    summary.incomeCents,
    state.currency
  );
  document.getElementById('stat-income-sub').textContent = `${incomeTxnCount} txns • ${monthCount} months`;

  document.getElementById('stat-spending').textContent = window.GhostLedgerEngine.formatCents(
    summary.spendingCents,
    state.currency
  );
  document.getElementById('stat-spending-sub').textContent = `${spendingTxnCount} txns • ${monthCount} months`;

  document.getElementById('stat-net').textContent = window.GhostLedgerEngine.formatCents(
    summary.netCents,
    state.currency
  );
  document.getElementById('stat-net-sub').textContent = summary.netCents >= 0 ? 'Surplus' : 'Deficit';

  const totalRecurringCents = activeSubscriptions.reduce((sum, sub) => sum + sub.monthlyCents, 0);
  document.getElementById('stat-ghosts').textContent = window.GhostLedgerEngine.formatCents(
    totalRecurringCents,
    state.currency
  );
  document.getElementById('stat-ghosts-sub').textContent = `${activeSubscriptions.length} recurring charges • per month`;

  // Savings banner (use ALL subscriptions to show total exorcised savings)
  const totalExorcisedCents = subscriptions
    .filter((sub) => state.exorcised[sub.payee])
    .reduce((sum, sub) => sum + sub.yearlyCents, 0);
  const savingsBanner = document.getElementById('savings-banner');
  if (totalExorcisedCents > 0) {
    document.getElementById('savings-amount').textContent = window.GhostLedgerEngine.formatCents(
      totalExorcisedCents,
      state.currency
    );
    savingsBanner.style.display = 'block';
  } else {
    savingsBanner.style.display = 'none';
  }

  // Ghost subscriptions
  renderGhosts(subscriptions);

  // Charts
  renderTrendChart(summary.byMonth);
  renderTrendTable(summary.byMonth);
  renderCategoryBars(summary.byCategory);

  // Budgets
  renderBudgets(summary.byMonth, txnsWithOverrides);

  // Anomalies
  renderAnomalies(anomalies);

  // Transactions
  renderTransactions(txnsWithOverrides);
}

// Render ghost subscriptions
function renderGhosts(subscriptions) {
  const list = document.getElementById('ghost-list');
  list.innerHTML = '';

  for (const sub of subscriptions) {
    const isExorcised = state.exorcised[sub.payee];
    const likelyGhost = ['gym', 'cloudvault', 'retro gamer', 'streambox'].some((key) =>
      sub.payee.includes(key)
    );

    const card = document.createElement('div');
    card.className = 'gl-ghost-card';
    card.innerHTML = `
      <h3>${escapeHtml(sub.displayName)}</h3>
      <div class="gl-ghost-tags">
        ${likelyGhost ? `<span class="gl-tag likely-ghost">Likely Ghost</span>` : ''}
        ${sub.priceHike ? `<span class="gl-tag price-hike">Price Hike</span>` : ''}
      </div>
      <div class="gl-ghost-details">
        <p><strong>Amount:</strong> ${window.GhostLedgerEngine.formatCents(sub.amountCents, state.currency)}</p>
        <p><strong>Cadence:</strong> ${escapeHtml(sub.cadence)}</p>
        <p><strong>Monthly:</strong> ${window.GhostLedgerEngine.formatCents(sub.monthlyCents, state.currency)}</p>
        <p><strong>Yearly:</strong> ${window.GhostLedgerEngine.formatCents(sub.yearlyCents, state.currency)}</p>
        <p><strong>Count:</strong> ${sub.count} charges (${escapeHtml(sub.firstDate)} to ${escapeHtml(sub.lastDate)})</p>
        ${sub.priceHike ? `<p><strong>Price Hike:</strong> ${window.GhostLedgerEngine.formatCents(sub.priceHike.fromCents, state.currency)} → ${window.GhostLedgerEngine.formatCents(sub.priceHike.toCents, state.currency)}</p>` : ''}
      </div>
      <div class="gl-ghost-actions">
        <button class="gl-exorcise-btn ${isExorcised ? 'active' : ''}" data-exorcise="${escapeHtml(sub.payee)}">
          ${isExorcised ? 'Restore' : 'Exorcise'}
        </button>
      </div>
    `;

    const btn = card.querySelector('[data-exorcise]');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const payee = btn.getAttribute('data-exorcise');
      if (state.exorcised[payee]) {
        delete state.exorcised[payee];
      } else {
        state.exorcised[payee] = true;
      }
      saveState();
      render();
    });

    list.appendChild(card);
  }
}

// Render trend chart (canvas) and ensure text table is always filled
function renderTrendChart(byMonth) {
  const canvas = document.getElementById('trend-chart');
  const ctx = canvas?.getContext('2d');

  const months = Object.keys(byMonth).sort();
  if (months.length === 0) {
    if (ctx) ctx.fillStyle = '#E8E6F0';
    if (ctx) ctx.font = '14px sans-serif';
    if (ctx) ctx.fillText('No data', 10, 20);
    return;
  }

  if (ctx) {
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Clear canvas
    ctx.fillStyle = '#12101A';
    ctx.fillRect(0, 0, width, height);

    // Find max value for scaling
    let maxValue = 0;
    for (const month of months) {
      const amt = Math.abs(byMonth[month]);
      if (amt > maxValue) maxValue = amt;
    }
    if (maxValue === 0) maxValue = 1;

    const barWidth = chartWidth / (months.length * 2.5);
    const barGap = barWidth * 0.5;

    // Draw bars
    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      const amt = byMonth[month];
      const income = amt > 0 ? amt : 0;
      const spending = amt < 0 ? Math.abs(amt) : 0;

      const x = padding + i * (barWidth * 2.5);
      const incomeHeight = (income / maxValue) * chartHeight;
      const spendingHeight = (spending / maxValue) * chartHeight;

      // Income bar (green)
      if (income > 0) {
        ctx.fillStyle = '#2DD4BF';
        ctx.fillRect(x, height - padding - incomeHeight, barWidth, incomeHeight);
      }

      // Spending bar (red)
      if (spending > 0) {
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(x + barWidth + barGap, height - padding - spendingHeight, barWidth, spendingHeight);
      }
    }

    // Draw axes
    ctx.strokeStyle = '#3A3844';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw month labels
    ctx.fillStyle = '#B0ACBC';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < months.length; i++) {
      const x = padding + i * (barWidth * 2.5) + barWidth;
      ctx.fillText(months[i], x, height - 10);
    }
  }
}

// Render trend table (always filled, even if canvas fails)
function renderTrendTable(byMonth) {
  const tbody = document.querySelector('#trend-table tbody');
  tbody.innerHTML = '';

  const months = Object.keys(byMonth).sort();
  for (const month of months) {
    const amt = byMonth[month];
    const income = amt > 0 ? amt : 0;
    const spending = amt < 0 ? Math.abs(amt) : 0;
    const net = income - spending;

    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${escapeHtml(month)}</td>
      <td>${window.GhostLedgerEngine.formatCents(income, state.currency)}</td>
      <td>${window.GhostLedgerEngine.formatCents(spending, state.currency)}</td>
      <td>${window.GhostLedgerEngine.formatCents(net, state.currency)}</td>
    `;
  }
}

// Render category bars
function renderCategoryBars(byCategory) {
  const container = document.getElementById('category-bars');
  container.innerHTML = '';

  const sorted = Object.entries(byCategory)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 8);

  if (sorted.length === 0) return;

  const maxAmt = Math.max(...sorted.map((e) => Math.abs(e[1]))) || 1;

  for (const [cat, amt] of sorted) {
    const pct = (Math.abs(amt) / maxAmt) * 100;
    const div = document.createElement('div');
    div.className = 'gl-category-bar';
    div.innerHTML = `
      <div class="gl-category-bar-label">
        <span class="gl-category-bar-name">${escapeHtml(cat)}</span>
        <span class="gl-category-bar-amount">${window.GhostLedgerEngine.formatCents(Math.abs(amt), state.currency)}</span>
      </div>
      <div class="gl-bar">
        <div class="gl-bar-fill" style="width: ${pct}%"></div>
      </div>
    `;
    container.appendChild(div);
  }
}

// Render budgets (only for categories with default budgets)
function renderBudgets(byMonth, txns) {
  const container = document.getElementById('budget-list');
  container.innerHTML = '';

  const latestMonth = Object.keys(byMonth).sort().pop();
  if (!latestMonth) return;

  const monthTxns = txns.filter((t) => t.date.startsWith(latestMonth));

  // Only render budgets for categories with default budgets (8 spend categories)
  const budgetCategories = Object.keys(DEFAULT_BUDGETS);

  for (const cat of budgetCategories) {
    const budgetCents = state.budgets[cat] || 0;
    const spent = Math.abs(
      (monthTxns.filter((t) => t.category === cat).reduce((sum, t) => sum + t.amountCents, 0) || 0)
    );
    const pct = budgetCents > 0 ? (spent / budgetCents) * 100 : 0;
    const isOver = spent > budgetCents;

    const div = document.createElement('div');
    div.className = 'gl-budget-item';
    div.innerHTML = `
      <div class="gl-budget-header">
        <span class="gl-budget-category">${escapeHtml(cat)}</span>
      </div>
      <div class="gl-budget-amount">
        <span>Spent: ${window.GhostLedgerEngine.formatCents(spent, state.currency)}</span>
        <span>/</span>
        <input type="number" class="gl-budget-amount-input" data-budget="${escapeHtml(cat)}" value="${(budgetCents / 100).toFixed(0)}" step="1">
      </div>
      <div class="gl-budget-progress">
        <div class="gl-budget-progress-bar ${isOver ? 'over' : ''}" style="width: ${Math.min(pct, 100)}%"></div>
      </div>
      <div class="gl-budget-status ${isOver ? 'over' : ''}">
        ${isOver ? `Over budget by ${window.GhostLedgerEngine.formatCents(spent - budgetCents, state.currency)}` : `${Math.round(100 - pct)}% remaining`}
      </div>
    `;

    const input = div.querySelector('[data-budget]');
    input.addEventListener('change', (e) => {
      const cat = e.target.getAttribute('data-budget');
      const dollars = parseFloat(e.target.value) || 0;
      state.budgets[cat] = Math.round(dollars * 100);
      saveState();
      render();
    });

    container.appendChild(div);
  }
}

// Render anomalies (first 20)
function renderAnomalies(anomalies) {
  const container = document.getElementById('anomaly-list');
  container.innerHTML = '';

  const allAnomalies = [...anomalies.duplicates, ...anomalies.largeTxns].slice(0, 20);

  if (allAnomalies.length === 0) {
    container.innerHTML = '<p style="color: #2DD4BF;">No anomalies detected</p>';
    return;
  }

  for (const anom of allAnomalies) {
    const txn = anom.txn;
    const div = document.createElement('div');
    div.className = 'gl-anomaly-item';
    div.innerHTML = `
      <div class="gl-anomaly-date">${escapeHtml(txn.date)}</div>
      <div class="gl-anomaly-description">${escapeHtml(txn.description)}</div>
      <div class="gl-anomaly-reason">⚠ ${escapeHtml(anom.reason)}</div>
    `;
    container.appendChild(div);
  }
}

// Render transactions table with search, filter, sort, and override
function renderTransactions(txns) {
  const searchVal = document.getElementById('txn-search').value.toLowerCase();
  const categoryVal = document.getElementById('txn-category').value;
  const sortVal = document.getElementById('txn-sort').value;

  let filtered = txns;

  // Search
  if (searchVal) {
    filtered = filtered.filter(
      (t) =>
        t.description.toLowerCase().includes(searchVal) ||
        t.category.toLowerCase().includes(searchVal)
    );
  }

  // Category filter
  if (categoryVal) {
    filtered = filtered.filter((t) => t.category === categoryVal);
  }

  // Sort
  if (sortVal === 'date-desc') {
    filtered.sort((a, b) => b.date.localeCompare(a.date));
  } else if (sortVal === 'date-asc') {
    filtered.sort((a, b) => a.date.localeCompare(b.date));
  } else if (sortVal === 'amount-desc') {
    filtered.sort((a, b) => b.amountCents - a.amountCents);
  } else if (sortVal === 'amount-asc') {
    filtered.sort((a, b) => a.amountCents - b.amountCents);
  }

  // Populate category filter options
  const categorySelect = document.getElementById('txn-category');
  const categories = [...new Set(txns.map((t) => t.category))].sort();
  if (categorySelect.children.length === 1) {
    // Only populate once
    for (const cat of categories) {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
    }
  }

  // Render
  document.getElementById('txn-count').textContent = filtered.length;
  const tbody = document.getElementById('txn-body');
  tbody.innerHTML = '';

  for (const txn of filtered) {
    const row = tbody.insertRow();
    const category = state.overrides[txn.id] || txn.category;

    row.innerHTML = `
      <td class="gl-txn-date">${escapeHtml(txn.date)}</td>
      <td class="gl-txn-description">${escapeHtml(txn.description)}</td>
      <td class="gl-txn-category">
        <select class="gl-txn-category-select" data-override="${escapeHtml(txn.id)}">
          ${window.GhostLedgerEngine.CATEGORIES.map((cat) => `<option value="${cat}" ${cat === category ? 'selected' : ''}>${escapeHtml(cat)}</option>`).join('')}
        </select>
      </td>
      <td class="gl-txn-amount ${txn.amountCents > 0 ? 'gl-txn-income' : 'gl-txn-spending'}">
        ${window.GhostLedgerEngine.formatCents(txn.amountCents, state.currency)}
      </td>
    `;

    const select = row.querySelector('[data-override]');
    select.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-override');
      const newCat = e.target.value;
      state.overrides[id] = newCat;
      saveState();
      render();
    });
  }
}

// Event listeners
function setupEventListeners() {
  // File input
  const fileInput = document.getElementById('file-input');
  const chooseBtn = document.getElementById('choose-file');
  const dropzone = document.getElementById('dropzone');

  chooseBtn.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (evt) => importText(evt.target.result);
      reader.readAsText(file);
    }
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => importText(evt.target.result);
      reader.readAsText(file);
    }
  });

  // Sample data
  document.getElementById('load-sample').addEventListener('click', () => {
    importText(SAMPLE_CSV);
  });

  // Currency
  document.getElementById('currency').addEventListener('change', (e) => {
    state.currency = e.target.value;
    saveState();
    render();
  });

  // Search and filter
  document.getElementById('txn-search').addEventListener('input', () => {
    renderTransactions(state.transactions);
  });

  document.getElementById('txn-category').addEventListener('change', () => {
    renderTransactions(state.transactions);
  });

  document.getElementById('txn-sort').addEventListener('change', () => {
    renderTransactions(state.transactions);
  });

  // Export
  document.getElementById('export-csv').addEventListener('click', () => {
    const csv = window.GhostLedgerEngine.toCSV(state.transactions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ghostledger-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('export-json').addEventListener('click', () => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ghostledger-export.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Clear data
  document.getElementById('clear-data').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      state.transactions = [];
      state.overrides = {};
      state.exorcised = {};
      state.budgets = { ...DEFAULT_BUDGETS };
      localStorage.removeItem('ghostledger.v1');
      const report = document.getElementById('import-report');
      const reportText = report.querySelector('.gl-import-success');
      reportText.textContent = '✓ All data cleared';
      report.style.display = 'block';
      render();
    }
  });
}

// Initialize
function setup() {
  loadState();
  setupEventListeners();
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setup);
} else {
  setup();
}
