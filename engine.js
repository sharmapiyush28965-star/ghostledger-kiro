(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.GhostLedgerEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * parseCSV(text) — RFC-4180 state machine parser
   * Handles quoted fields, embedded commas/newlines, CRLF, BOM.
   * Returns { rows: string[][], skipped: number, errors: {row, reason}[] }
   */
  function parseCSV(text) {
    if (typeof text !== 'string') return { rows: [], skipped: 0, errors: [] };

    // Remove UTF-8 BOM if present
    if (text.charCodeAt(0) === 0xFEFF) {
      text = text.slice(1);
    }

    const rows = [];
    const errors = [];
    let skipped = 0;
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;

    while (i < text.length) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (inQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            // Escaped quote
            currentField += '"';
            i += 2;
          } else {
            // End of quoted field
            inQuotes = false;
            i++;
          }
        } else if (char === '\r' && nextChar === '\n') {
          // CRLF inside quoted field
          currentField += '\n';
          i += 2;
        } else if (char === '\n' || char === '\r') {
          // LF inside quoted field
          currentField += '\n';
          i++;
        } else {
          currentField += char;
          i++;
        }
      } else {
        if (char === '"') {
          // Start of quoted field
          inQuotes = true;
          i++;
        } else if (char === ',') {
          // Field delimiter
          currentRow.push(currentField);
          currentField = '';
          i++;
        } else if (char === '\r' && nextChar === '\n') {
          // CRLF row delimiter
          currentRow.push(currentField);
          currentField = '';
          if (isNonEmptyRow(currentRow)) {
            rows.push(currentRow);
          } else if (currentRow.some(f => f.trim() !== '')) {
            skipped++;
          }
          currentRow = [];
          i += 2;
        } else if (char === '\n' || char === '\r') {
          // LF row delimiter
          currentRow.push(currentField);
          currentField = '';
          if (isNonEmptyRow(currentRow)) {
            rows.push(currentRow);
          } else if (currentRow.some(f => f.trim() !== '')) {
            skipped++;
          }
          currentRow = [];
          i++;
        } else {
          currentField += char;
          i++;
        }
      }
    }

    // Handle last field and row
    if (inQuotes) {
      errors.push({ row: rows.length, reason: 'Unclosed quoted field' });
      skipped++;
    } else {
      currentRow.push(currentField);
      if (isNonEmptyRow(currentRow)) {
        rows.push(currentRow);
      } else if (currentRow.some(f => f.trim() !== '')) {
        skipped++;
      }
    }

    return { rows, skipped, errors };
  }

  function isNonEmptyRow(row) {
    return row.some(field => field.trim() !== '');
  }

  /**
   * detectDelimiter(sampleLine) — Count `,`, `;`, `\t` outside quotes
   * Returns the delimiter character with highest count, default `,`
   */
  function detectDelimiter(sampleLine) {
    if (typeof sampleLine !== 'string') return ',';

    const counts = { ',': 0, ';': 0, '\t': 0 };
    let inQuotes = false;

    for (let i = 0; i < sampleLine.length; i++) {
      const char = sampleLine[i];

      if (char === '"') {
        if (inQuotes && sampleLine[i + 1] === '"') {
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (!inQuotes && (char === ',' || char === ';' || char === '\t')) {
        counts[char]++;
      }
    }

    let maxCount = 0;
    let delimiter = ',';
    for (const [delim, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        delimiter = delim;
      }
    }

    return maxCount > 0 ? delimiter : ',';
  }

  /**
   * parseDate(value) — Parse multiple date formats
   * Supports: YYYY-MM-DD, DD-Mon-YYYY, Mon DD YYYY, DD/MM/YYYY, MM/DD/YYYY
   * For slash dates: if first field > 12, treat as DD/MM, else MM/DD
   * Returns ISO YYYY-MM-DD string or null
   */
  function parseDate(value) {
    if (typeof value !== 'string' || !value.trim()) return null;

    value = value.trim();

    // YYYY-MM-DD
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      if (isValidDate(parseInt(year), parseInt(month), parseInt(day))) {
        return `${year}-${month}-${day}`;
      }
    }

    // DD-Mon-YYYY or Mon DD YYYY
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monMatch = value.match(/^(\d{1,2})-([a-z]{3})-(\d{4})$/i);
    if (monMatch) {
      const [, day, mon, year] = monMatch;
      const monthIdx = monthNames.indexOf(mon.toLowerCase());
      if (monthIdx >= 0 && isValidDate(parseInt(year), monthIdx + 1, parseInt(day))) {
        const monthStr = String(monthIdx + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${monthStr}-${dayStr}`;
      }
    }

    const monMatch2 = value.match(/^([a-z]{3})\s+(\d{1,2})\s+(\d{4})$/i);
    if (monMatch2) {
      const [, mon, day, year] = monMatch2;
      const monthIdx = monthNames.indexOf(mon.toLowerCase());
      if (monthIdx >= 0 && isValidDate(parseInt(year), monthIdx + 1, parseInt(day))) {
        const monthStr = String(monthIdx + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${monthStr}-${dayStr}`;
      }
    }

    // Slash dates: DD/MM/YYYY or MM/DD/YYYY with ambiguity rule
    const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      let [, field1, field2, year] = slashMatch;
      let day, month;
      const f1 = parseInt(field1);
      const f2 = parseInt(field2);

      // Rule: if first field > 12, treat as DD/MM, else MM/DD
      if (f1 > 12) {
        day = f1;
        month = f2;
      } else {
        month = f1;
        day = f2;
      }

      if (isValidDate(parseInt(year), month, day)) {
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${monthStr}-${dayStr}`;
      }
    }

    return null;
  }

  function isValidDate(year, month, day) {
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if ([4, 6, 9, 11].includes(month) && day > 30) return false;
    if (month === 2) {
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      if (day > (isLeap ? 29 : 28)) return false;
    }
    return true;
  }

  /**
   * parseAmount(value) — Parse currency amounts
   * Strips currency symbols ($, ₹, €, £), commas, spaces
   * Handles (123.45) as negative, minus sign
   * Returns integer cents or null
   *
   * Validates that after cleaning, the value has a valid number shape:
   * optional minus, digits with optional thousands commas, optional decimal point with 2 digits.
   * Rejects strings like "2026-06-15" (date-like) by ensuring no unexpected hyphens.
   */
  function parseAmount(value) {
    if (typeof value !== 'string' || !value.trim()) return null;

    value = value.trim();

    // Check for parentheses negation: (123.45) => -123.45
    let isNegative = false;
    if (value.startsWith('(') && value.endsWith(')')) {
      isNegative = true;
      value = value.slice(1, -1);
    }

    // Remove currency symbols and spaces
    value = value.replace(/[$₹€£\s]/g, '');

    // Check for leading minus sign
    if (value.startsWith('-')) {
      isNegative = true;
      value = value.slice(1);
    }

    // Now validate the shape of the remaining string:
    // Must be: digits, optional commas (thousands separators), optional decimal point with digits
    // Pattern: \d+(,\d{3})*(\.\d+)?
    // This rejects anything like "06-15" or other date fragments
    
    // First, check for any remaining hyphens or other invalid characters
    if (value.includes('-')) {
      // Hyphens are not valid in amounts (except the leading minus we already handled)
      return null;
    }

    // Remove commas (thousands separators) and validate
    const withoutCommas = value.replace(/,/g, '');
    
    // Now we should have: digits optionally followed by .digits
    // Use a strict regex to validate
    if (!/^\d+(\.\d+)?$/.test(withoutCommas)) {
      return null;
    }

    // Parse to float
    const floatValue = parseFloat(withoutCommas);
    if (isNaN(floatValue)) return null;

    // Convert to cents, rounding to nearest cent
    let cents = Math.round(floatValue * 100);
    if (isNegative) cents = -cents;

    return cents;
  }

  /**
   * detectColumns(header, rows) — Score columns to find date/description/amount/debit/credit
   * Returns { dateCol, descCol, amountCol, debitCol, creditCol }
   * Scores by: header name bonus + cell shape parsing success fraction
   */
  function detectColumns(header, rows) {
    if (!Array.isArray(header) || header.length === 0) {
      return { dateCol: null, descCol: null, amountCol: null, debitCol: null, creditCol: null };
    }

    if (!Array.isArray(rows)) {
      rows = [];
    }

    const scores = header.map((_, colIdx) => ({
      dateScore: 0,
      descScore: 0,
      amountScore: 0,
      debitScore: 0,
      creditScore: 0,
    }));

    // Header name bonuses
    for (let i = 0; i < header.length; i++) {
      const name = header[i].toLowerCase().trim();
      if (/^date/.test(name)) scores[i].dateScore += 50;
      if (/description|desc|memo/.test(name)) scores[i].descScore += 50;
      if (/^amount|total/.test(name)) scores[i].amountScore += 50;
      if (/debit|withdrawal|out/.test(name)) scores[i].debitScore += 50;
      if (/credit|deposit|in/.test(name)) scores[i].creditScore += 50;
      if (/merchant|payee/.test(name)) scores[i].descScore += 30;
    }

    // Cell shape scoring
    for (let rowIdx = 0; rowIdx < Math.min(rows.length, 10); rowIdx++) {
      const row = rows[rowIdx];
      if (!Array.isArray(row)) continue;
      
      for (let colIdx = 0; colIdx < Math.min(row.length, header.length); colIdx++) {
        const cell = row[colIdx];

        if (parseDate(cell)) scores[colIdx].dateScore += 20;
        if (parseAmount(cell)) scores[colIdx].amountScore += 20;

        // Description: non-empty, mostly text, not all digits
        if (cell.trim().length > 0) {
          const textFraction = cell.replace(/[0-9\s\-\/\.\,\$₹€£()]/g, '').length / cell.length;
          if (textFraction > 0.3) scores[colIdx].descScore += 10;
        }

        // Debit/credit: empty or a valid amount
        if (cell.trim() === '' || parseAmount(cell)) {
          scores[colIdx].debitScore += 5;
          scores[colIdx].creditScore += 5;
        }
      }
    }

    // Find best column for each field
    const best = {
      dateCol: findBestColumn(scores, 'dateScore'),
      descCol: findBestColumn(scores, 'descScore'),
      amountCol: findBestColumn(scores, 'amountScore'),
      debitCol: findBestColumn(scores, 'debitScore'),
      creditCol: findBestColumn(scores, 'creditScore'),
    };

    // If both debit and credit columns are detected and amountCol overlaps with one of them,
    // clear amountCol so that debit/credit takes precedence.
    // HAND-FIX (2026-11-06, by the rebuild agent, NOT by Kiro — see docs/KIRO_SESSION_LOG.md):
    // debitCol/creditCol must only count as detected when a header actually names them.
    // Shape scoring alone (+5 per amount-like cell) nominates a debit/credit column for
    // almost every file, including plain Date,Description,Amount files, which made
    // importCSV take the credit-minus-debit branch (or clear amountCol) and import 0 rows.
    const hasDebitHeader = header.some((h) => /debit|withdrawal|out/i.test(h));
    const hasCreditHeader = header.some((h) => /credit|deposit|in/i.test(h));
    if (!hasDebitHeader) best.debitCol = null;
    if (!hasCreditHeader) best.creditCol = null;
    if (best.debitCol !== null && best.creditCol !== null) {
      if (best.amountCol === best.debitCol || best.amountCol === best.creditCol) {
        best.amountCol = null;
      }
    }

    // Return without conflict resolution (first-match wins per field)
    return best;
  }

  function findBestColumn(scores, field) {
    let bestIdx = null;
    let bestScore = -1;
    for (let i = 0; i < scores.length; i++) {
      if (scores[i][field] > bestScore) {
        bestScore = scores[i][field];
        bestIdx = i;
      }
    }
    return bestScore > 0 ? bestIdx : null;
  }

  /**
   * importCSV(text) — Full pipeline: parse, detect columns, build transactions
   * Returns { transactions, skipped, dateInterpretation, errors }
   * Transactions: { id, date, payee, description, amountCents, category, confidence }
   */
  function importCSV(text) {
    const parsed = parseCSV(text);
    const { rows, skipped, errors } = parsed;

    if (rows.length === 0) {
      return { transactions: [], skipped, dateInterpretation: 'N/A', errors };
    }

    // Assume first row is header
    const header = rows[0];
    const dataRows = rows.slice(1);

    const columns = detectColumns(header, dataRows);
    const transactions = [];

    for (let idx = 0; idx < dataRows.length; idx++) {
      const row = dataRows[idx];

      let date = null;
      let description = '';
      let payee = '';
      let amountCents = 0;

      // Extract date
      if (columns.dateCol !== null && row[columns.dateCol]) {
        date = parseDate(row[columns.dateCol]);
      }

      // Extract description/payee
      if (columns.descCol !== null && row[columns.descCol]) {
        description = row[columns.descCol].trim();
        payee = normalizePayee(description);
      }

      // Extract amount: if both debit and credit columns exist, use them (credit - debit)
      // Otherwise prefer amountCol, else calculate from debit/credit
      if (columns.debitCol !== null && columns.creditCol !== null) {
        let debitAmt = 0;
        let creditAmt = 0;

        if (row[columns.debitCol]) {
          const amt = parseAmount(row[columns.debitCol]);
          debitAmt = amt !== null ? amt : 0;
        }

        if (row[columns.creditCol]) {
          const amt = parseAmount(row[columns.creditCol]);
          creditAmt = amt !== null ? amt : 0;
        }

        amountCents = creditAmt - debitAmt;
      } else if (columns.amountCol !== null && row[columns.amountCol]) {
        const amt = parseAmount(row[columns.amountCol]);
        if (amt !== null) amountCents = amt;
      } else if (columns.debitCol !== null || columns.creditCol !== null) {
        let debitAmt = 0;
        let creditAmt = 0;

        if (columns.debitCol !== null && row[columns.debitCol]) {
          const amt = parseAmount(row[columns.debitCol]);
          debitAmt = amt !== null ? amt : 0;
        }

        if (columns.creditCol !== null && row[columns.creditCol]) {
          const amt = parseAmount(row[columns.creditCol]);
          creditAmt = amt !== null ? amt : 0;
        }

        amountCents = creditAmt - debitAmt;
      }

      // Skip if no date or no amount
      if (!date || amountCents === 0) {
        continue;
      }

      // Categorize
      const { category, confidence } = categorize(description);

      const id = `${date}|${payee}|${amountCents}|${idx}`;
      transactions.push({
        id,
        date,
        payee,
        description,
        amountCents,
        category,
        confidence,
      });
    }

    // Determine date interpretation from first date
    let dateInterpretation = 'N/A';
    if (dataRows.length > 0 && columns.dateCol !== null) {
      const firstDateStr = dataRows[0][columns.dateCol];
      if (firstDateStr && firstDateStr.includes('/')) {
        const match = firstDateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
          const f1 = parseInt(match[1]);
          dateInterpretation = f1 > 12 ? 'DD/MM/YYYY' : 'MM/DD/YYYY';
        }
      } else if (firstDateStr && firstDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dateInterpretation = 'YYYY-MM-DD';
      } else if (firstDateStr && firstDateStr.match(/^(\d{1,2})-[a-z]{3}-(\d{4})$/i)) {
        dateInterpretation = 'DD-Mon-YYYY';
      }
    }

    return { transactions, skipped, dateInterpretation, errors };
  }

  /**
   * normalizePayee(description) — Lowercase, strip card suffixes, *, spaces
   */
  function normalizePayee(description) {
    if (typeof description !== 'string') return '';

    let normalized = description.toLowerCase();
    // Remove card suffixes (e.g., " •1234")
    normalized = normalized.replace(/\s*[•*]\s*\d+/g, '');
    // Remove reference numbers
    normalized = normalized.replace(/\s*#\d+/g, '');
    // Collapse multiple spaces
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
  }

  /**
   * CATEGORIES — Fixed 11-category set
   */
  const CATEGORIES = [
    'Income',
    'Subscriptions',
    'Groceries',
    'Dining',
    'Transport',
    'Shopping',
    'Entertainment',
    'Bills',
    'Health',
    'Transfer',
    'Other',
  ];

  /**
   * RULES — Deterministic keyword rules: [regex, category, confidence]
   */
  const RULES = [
    [/salary|payroll|direct dep|employer|interest paid|refund/, 'Income', 0.95],
    [/netflix|spotify|hulu|disney|hbo|prime video|apple tv|youtube premium|dropbox|icloud|saas|magazine|newsletter|subscription|audible|kindle unlimited/, 'Subscriptions', 0.95],
    [/whole foods|trader joe|safeway|kroger|aldi|supermarket|grocery|walmart grocery|food mart/, 'Groceries', 0.9],
    [/restaurant|cafe|coffee|starbucks|mcdonald|burger|pizza|doordash|uber eats|swiggy|zomato|bakery|sandwich/, 'Dining', 0.9],
    [/uber|lyft|taxi|fuel|shell|chevron|metro|bus fare|train ticket|airline|parking|toll/, 'Transport', 0.9],
    [/amazon|target|ikea|clothing|nike|best buy|apple store|walmart|costco|home depot/, 'Shopping', 0.85],
    [/cinema|movie|concert|ticketmaster|steam|playstation|xbox|game stop|bowling/, 'Entertainment', 0.9],
    [/electric|water bill|internet|verizon|rent|mortgage|insurance|utility|gas bill|phone bill/, 'Bills', 0.9],
    [/pharmacy|cvs|walgreens|doctor|hospital|clinic|dental|gym|fitness|yoga/, 'Health', 0.9],
    [/transfer|atm withdrawal|venmo|zelle|wire transfer/, 'Transfer', 0.9],
  ];

  /**
   * categorize(description) — Assign category and confidence based on rules
   * Returns { category, confidence }
   */
  function categorize(description) {
    if (typeof description !== 'string') {
      return { category: 'Other', confidence: 0.5 };
    }

    const lowerDesc = description.toLowerCase();

    for (const [regex, category, confidence] of RULES) {
      if (regex.test(lowerDesc)) {
        return { category, confidence };
      }
    }

    return { category: 'Other', confidence: 0.5 };
  }

  /**
   * formatCents(cents, currency) — Format integer cents as currency string
   * Returns e.g., "$1,234.56" or "-$45.00"
   */
  function formatCents(cents, currency) {
    if (typeof cents !== 'number' || typeof currency !== 'string') {
      return '$0.00';
    }

    const isNegative = cents < 0;
    const absCents = Math.abs(cents);
    const dollars = Math.floor(absCents / 100);
    const remainder = absCents % 100;
    const dollarsFormatted = dollars.toLocaleString('en-US');
    const centsStr = String(remainder).padStart(2, '0');
    const formatted = `${currency}${dollarsFormatted}.${centsStr}`;

    return isNegative ? `-${formatted}` : formatted;
  }

  /**
   * toCSV(txns) — Export transactions as CSV
   * Returns CSV string: Date,Description,Category,Amount
   */
  function toCSV(txns) {
    if (!Array.isArray(txns)) return 'Date,Description,Category,Amount\n';

    let csv = 'Date,Description,Category,Amount\n';
    for (const txn of txns) {
      const date = txn.date || '';
      const desc = (txn.description || '').replace(/"/g, '""');
      const cat = txn.category || '';
      const amt = formatCents(txn.amountCents || 0, '$').slice(1); // Remove leading $

      csv += `${date},"${desc}",${cat},${amt}\n`;
    }

    return csv;
  }

  /**
   * summarize(txns) — Compute income, spending, net, byCategory, byMonth
   * Returns { count, incomeCents, spendingCents, netCents, byCategory, byMonth }
   * All amounts in integer cents
   */
  function summarize(txns) {
    if (!Array.isArray(txns)) {
      return {
        count: 0,
        incomeCents: 0,
        spendingCents: 0,
        netCents: 0,
        byCategory: {},
        byMonth: {},
      };
    }

    let count = 0;
    let incomeCents = 0;
    let spendingCents = 0;
    const byCategory = {};
    const byMonth = {};

    for (const txn of txns) {
      const amt = txn.amountCents || 0;
      const cat = txn.category || 'Other';
      const date = txn.date || '';

      count++;

      // Split by sign
      if (amt > 0) {
        incomeCents += amt;
      } else if (amt < 0) {
        spendingCents += Math.abs(amt);
      }

      // By category
      byCategory[cat] = (byCategory[cat] || 0) + amt;

      // By month (YYYY-MM)
      const month = date.substring(0, 7); // e.g., "2026-06"
      if (month.match(/^\d{4}-\d{2}$/)) {
        byMonth[month] = (byMonth[month] || 0) + amt;
      }
    }

    const netCents = incomeCents - spendingCents;

    return {
      count,
      incomeCents,
      spendingCents,
      netCents,
      byCategory,
      byMonth,
    };
  }

  /**
   * detectSubscriptions(txns) — Find recurring charges with tight tolerance
   * Groups by normalized payee, detects cadence (monthly, weekly, fortnightly, yearly),
   * flags price hikes, returns sorted by monthlyCents descending.
   * Returns array of { payee, displayName, amountCents, cadence, count, firstDate, lastDate,
   *                    monthlyCents, yearlyCents, priceHike? { fromCents, toCents } }
   */
  function detectSubscriptions(txns) {
    if (!Array.isArray(txns) || txns.length === 0) {
      return [];
    }

    // Filter: only negative amounts (spending)
    const negTxns = txns.filter(t => t.amountCents < 0);

    // Group by normalized payee
    const groups = {};
    for (const txn of negTxns) {
      const normalized = normalizePayee(txn.payee || '');
      if (!normalized) continue;

      if (!groups[normalized]) {
        groups[normalized] = [];
      }
      groups[normalized].push(txn);
    }

    const subscriptions = [];

    for (const [normalizedPayee, charges] of Object.entries(groups)) {
      if (charges.length < 3) continue;

      // Sort by date
      charges.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

      // Get unique amounts (within tight tolerance: 2% or 100 cents)
      const uniqueAmounts = [];
      for (const charge of charges) {
        const amt = Math.abs(charge.amountCents);
        let found = false;

        for (const unique of uniqueAmounts) {
          const tolerance = Math.max(Math.abs(unique) * 0.02, 100);
          if (Math.abs(amt - unique) <= tolerance) {
            found = true;
            break;
          }
        }

        if (!found) {
          uniqueAmounts.push(amt);
        }
      }

      // If more than 2 distinct amounts, might be a price hike or multiple subscriptions
      // For now, handle the case of a single step-change price hike
      if (uniqueAmounts.length > 2) {
        continue; // Too much variation, skip
      }

      // Compute median amount for the cluster
      const amounts = charges.map(c => Math.abs(c.amountCents));
      amounts.sort((a, b) => a - b);
      const medianAmount = amounts[Math.floor(amounts.length / 2)];

      // Filter charges within tight tolerance of median
      const tightCharges = charges.filter(c => {
        const tolerance = Math.max(medianAmount * 0.02, 100);
        return Math.abs(Math.abs(c.amountCents) - medianAmount) <= tolerance;
      });

      if (tightCharges.length < 3) continue;

      // Compute gaps between dates
      const dates = tightCharges.map(c => c.date).sort();
      const gaps = [];
      for (let i = 1; i < dates.length; i++) {
        const d1 = new Date(dates[i - 1]);
        const d2 = new Date(dates[i]);
        const daysDiff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        gaps.push(daysDiff);
      }

      if (gaps.length === 0) continue;

      // Determine cadence by median gap
      gaps.sort((a, b) => a - b);
      const medianGap = gaps[Math.floor(gaps.length / 2)];

      let cadence = null;
      let cadeceMin = null;
      let cadenceMax = null;

      // For clusters with 4+ charges, use a wider monthly band (20-40) to catch irregular bills
      const isLargeCluster = tightCharges.length >= 4;
      const monthlyMin = isLargeCluster ? 20 : 25;
      const monthlyMax = isLargeCluster ? 40 : 35;

      if (medianGap >= monthlyMin && medianGap <= monthlyMax) {
        cadence = 'monthly';
        cadeceMin = monthlyMin;
        cadenceMax = monthlyMax;
      } else if (medianGap >= 6 && medianGap <= 8) {
        cadence = 'weekly';
        cadeceMin = 6;
        cadenceMax = 8;
      } else if (medianGap >= 13 && medianGap <= 15) {
        cadence = 'fortnightly';
        cadeceMin = 13;
        cadenceMax = 15;
      } else if (medianGap >= 360 && medianGap <= 370) {
        cadence = 'yearly';
        cadeceMin = 360;
        cadenceMax = 370;
      }

      if (!cadence) continue;

      // Require at least 2 gaps in the cadence band (allow one irregular gap)
      // EXCEPT: clusters of 4+ charges are kept even with fewer in-band gaps (irregular monthly bills)
      const gapsInBand = gaps.filter(g => g >= cadeceMin && g <= cadenceMax).length;
      if (gapsInBand < 2 && tightCharges.length < 4) continue;

      // Check for price hike: first vs last amount
      let priceHike = null;
      const firstAmt = Math.abs(tightCharges[0].amountCents);
      const lastAmt = Math.abs(tightCharges[tightCharges.length - 1].amountCents);

      if (lastAmt > firstAmt * 1.1 && lastAmt <= firstAmt * 1.25) {
        // 10-25% increase
        // Check both sides are tight (within 5% each)
        const firstHalf = tightCharges.slice(0, Math.ceil(tightCharges.length / 2));
        const secondHalf = tightCharges.slice(Math.ceil(tightCharges.length / 2));

        const firstMedian = median(firstHalf.map(c => Math.abs(c.amountCents)));
        const secondMedian = median(secondHalf.map(c => Math.abs(c.amountCents)));

        if (
          secondMedian > firstMedian * 1.1 &&
          secondMedian <= firstMedian * 1.25
        ) {
          priceHike = { fromCents: firstMedian, toCents: secondMedian };
        }
      }

      // Compute monthly-equivalent cost
      let monthlyCents = medianAmount;
      if (cadence === 'weekly') {
        monthlyCents = Math.round((medianAmount * 52) / 12);
      } else if (cadence === 'fortnightly') {
        monthlyCents = Math.round((medianAmount * 26) / 12);
      } else if (cadence === 'yearly') {
        monthlyCents = Math.round(medianAmount / 12);
      }

      const yearlyCents = monthlyCents * 12;

      const displayName = tightCharges[0].description || normalizedPayee;
      const firstDate = tightCharges[0].date;
      const lastDate = tightCharges[tightCharges.length - 1].date;

      const sub = {
        payee: normalizedPayee,
        displayName,
        amountCents: medianAmount,
        cadence,
        count: tightCharges.length,
        firstDate,
        lastDate,
        monthlyCents,
        yearlyCents,
      };

      if (priceHike) {
        sub.priceHike = priceHike;
      }

      subscriptions.push(sub);
    }

    // Sort by monthlyCents descending
    subscriptions.sort((a, b) => b.monthlyCents - a.monthlyCents);

    return subscriptions;
  }

  /**
   * Helper: compute median of an array of numbers
   */
  function median(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * detectAnomalies(txns) — Flag duplicates and unusually large transactions
   * Returns { duplicates, largeTxns } where each item has { txn, reason }
   */
  function detectAnomalies(txns) {
    if (!Array.isArray(txns)) {
      return { duplicates: [], largeTxns: [] };
    }

    const duplicates = [];
    const largeTxns = [];

    // Find duplicates: same payee + amount within 2 days
    for (let i = 0; i < txns.length; i++) {
      for (let j = i + 1; j < txns.length; j++) {
        const t1 = txns[i];
        const t2 = txns[j];

        if (
          (t1.payee === t2.payee || normalizePayee(t1.payee || '') === normalizePayee(t2.payee || '')) &&
          t1.amountCents === t2.amountCents
        ) {
          const d1 = new Date(t1.date);
          const d2 = new Date(t2.date);
          const daysDiff = Math.abs(Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));

          if (daysDiff <= 2) {
            duplicates.push({
              txn: t2,
              reason: `Duplicate of ${t1.description} on ${t1.date}`,
            });
          }
        }
      }
    }

    // Find unusually large transactions: > 3x category median AND > $100 (10000 cents)
    const summary = summarize(txns);
    for (const txn of txns) {
      const cat = txn.category || 'Other';
      const catAmount = summary.byCategory[cat] || 0;
      const catAvg = Math.abs(catAmount) / (txns.filter(t => (t.category || 'Other') === cat).length || 1);

      if (
        Math.abs(txn.amountCents) > catAvg * 3 &&
        Math.abs(txn.amountCents) > 10000
      ) {
        largeTxns.push({
          txn,
          reason: `Unusually large: ${formatCents(txn.amountCents, '$')} vs typical ${formatCents(Math.round(catAvg), '$')} in ${cat}`,
        });
      }
    }

    return { duplicates, largeTxns };
  }

  // Export all functions
  return {
    parseCSV,
    detectDelimiter,
    parseDate,
    parseAmount,
    detectColumns,
    importCSV,
    normalizePayee,
    CATEGORIES,
    RULES,
    categorize,
    formatCents,
    toCSV,
    summarize,
    detectSubscriptions,
    detectAnomalies,
  };
}));
