import { strict as assert } from 'assert';
import { test } from 'node:test';
import { createRequire } from 'module';

// Load engine.js in Node context
const require = createRequire(import.meta.url);
const engine = require('../engine.js');

// Helper to generate random CSV rows
function generateRandomRow() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dates = [
    `2026-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/2026`,
    `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}-${months[Math.floor(Math.random() * 12)]}-2026`,
  ];
  const payees = ['Amazon', 'Whole Foods', 'Shell Gas', 'Netflix', 'Gym', 'Starbucks', 'Uber'];
  const amounts = [
    `$${(Math.random() * 200).toFixed(2)}`,
    `${(Math.random() * 200).toFixed(2)}`,
    `(${(Math.random() * 50).toFixed(2)})`,
  ];

  return [
    dates[Math.floor(Math.random() * dates.length)],
    payees[Math.floor(Math.random() * payees.length)],
    amounts[Math.floor(Math.random() * amounts.length)],
  ];
}

test('parseCSV: quoted commas', () => {
  const csv = 'Name,Description,Amount\n"Smith, John","Store, Inc.","$100.00"';
  const result = engine.parseCSV(csv);
  assert.strictEqual(result.rows.length, 2);
  assert.strictEqual(result.rows[1][0], 'Smith, John');
  assert.strictEqual(result.rows[1][1], 'Store, Inc.');
});

test('parseCSV: quoted newlines', () => {
  const csv = 'Name,Description\n"John","Line 1\nLine 2"';
  const result = engine.parseCSV(csv);
  assert.strictEqual(result.rows.length, 2);
  assert.strictEqual(result.rows[1][1], 'Line 1\nLine 2');
});

test('parseCSV: escaped quotes inside quoted field', () => {
  const csv = 'Name,Desc\n"John ""Johnny"" Doe","Normal"';
  const result = engine.parseCSV(csv);
  assert.strictEqual(result.rows[1][0], 'John "Johnny" Doe');
});

test('parseCSV: BOM handling', () => {
  const csv = '\uFEFFName,Amount\nJohn,100';
  const result = engine.parseCSV(csv);
  assert.strictEqual(result.rows.length, 2);
  assert.strictEqual(result.rows[0][0], 'Name');
});

test('parseCSV: CRLF line endings', () => {
  const csv = 'Name,Amount\r\nJohn,100\r\nJane,200';
  const result = engine.parseCSV(csv);
  assert.strictEqual(result.rows.length, 3);
  assert.strictEqual(result.rows[1][0], 'John');
  assert.strictEqual(result.rows[2][0], 'Jane');
});

test('parseCSV: LF line endings', () => {
  const csv = 'Name,Amount\nJohn,100\nJane,200';
  const result = engine.parseCSV(csv);
  assert.strictEqual(result.rows.length, 3);
  assert.strictEqual(result.rows[1][0], 'John');
});

test('parseCSV: skip fully-empty rows', () => {
  const csv = 'Name,Amount\nJohn,100\n\nJane,200';
  const result = engine.parseCSV(csv);
  assert.strictEqual(result.rows.length, 3); // Header, John, Jane (empty row skipped)
});

test('detectDelimiter: comma', () => {
  const line = 'Name,Description,Amount';
  assert.strictEqual(engine.detectDelimiter(line), ',');
});

test('detectDelimiter: semicolon', () => {
  const line = 'Name;Description;Amount';
  assert.strictEqual(engine.detectDelimiter(line), ';');
});

test('detectDelimiter: tab', () => {
  const line = 'Name\tDescription\tAmount';
  assert.strictEqual(engine.detectDelimiter(line), '\t');
});

test('detectDelimiter: ignore delimiters inside quotes', () => {
  const line = '"Smith, John",Description,"$100,000"';
  // Only the comma outside quotes counts: 2 commas between fields
  assert.strictEqual(engine.detectDelimiter(line), ',');
});

test('parseDate: YYYY-MM-DD', () => {
  assert.strictEqual(engine.parseDate('2026-06-15'), '2026-06-15');
  assert.strictEqual(engine.parseDate('2026-12-31'), '2026-12-31');
  assert.strictEqual(engine.parseDate('2026-01-01'), '2026-01-01');
});

test('parseDate: DD-Mon-YYYY', () => {
  assert.strictEqual(engine.parseDate('15-Jun-2026'), '2026-06-15');
  assert.strictEqual(engine.parseDate('31-Dec-2026'), '2026-12-31');
  assert.strictEqual(engine.parseDate('01-Jan-2026'), '2026-01-01');
});

test('parseDate: Mon DD YYYY', () => {
  assert.strictEqual(engine.parseDate('Jun 15 2026'), '2026-06-15');
  assert.strictEqual(engine.parseDate('Dec 31 2026'), '2026-12-31');
});

test('parseDate: slash dates with ambiguity rule (first > 12 = DD/MM)', () => {
  // 13/06/2026 => DD/MM (13 > 12)
  assert.strictEqual(engine.parseDate('13/06/2026'), '2026-06-13');
  // 06/13/2026 => impossible day in June, should fail
  assert.strictEqual(engine.parseDate('06/13/2026'), '2026-06-13');
});

test('parseDate: slash dates MM/DD when first <= 12', () => {
  // 06/15/2026 => MM/DD (6 <= 12)
  assert.strictEqual(engine.parseDate('06/15/2026'), '2026-06-15');
  // 01/15/2026 => MM/DD
  assert.strictEqual(engine.parseDate('01/15/2026'), '2026-01-15');
});

test('parseDate: invalid dates return null', () => {
  assert.strictEqual(engine.parseDate('2026-13-01'), null); // Invalid month
  assert.strictEqual(engine.parseDate('2026-02-30'), null); // Invalid day for February
  assert.strictEqual(engine.parseDate('not-a-date'), null);
});

test('parseAmount: dollar sign', () => {
  assert.strictEqual(engine.parseAmount('$100.00'), 10000);
  assert.strictEqual(engine.parseAmount('$1,234.56'), 123456);
});

test('parseAmount: rupee symbol', () => {
  assert.strictEqual(engine.parseAmount('₹1,000.00'), 100000);
});

test('parseAmount: euro symbol', () => {
  assert.strictEqual(engine.parseAmount('€50.99'), 5099);
});

test('parseAmount: pound symbol', () => {
  assert.strictEqual(engine.parseAmount('£25.50'), 2550);
});

test('parseAmount: parentheses negation', () => {
  assert.strictEqual(engine.parseAmount('(100.00)'), -10000);
  assert.strictEqual(engine.parseAmount('($50.99)'), -5099);
});

test('parseAmount: minus sign negation', () => {
  assert.strictEqual(engine.parseAmount('-100.00'), -10000);
  assert.strictEqual(engine.parseAmount('- $50.99'), -5099);
});

test('parseAmount: thousands commas', () => {
  assert.strictEqual(engine.parseAmount('1,234,567.89'), 123456789);
});

test('parseAmount: spaces ignored', () => {
  assert.strictEqual(engine.parseAmount('$ 100 . 00'), 10000);
});

test('parseAmount: invalid returns null', () => {
  assert.strictEqual(engine.parseAmount('not-a-number'), null);
  assert.strictEqual(engine.parseAmount(''), null);
});

test('detectColumns: by header name', () => {
  const header = ['Date', 'Description', 'Amount'];
  const rows = [];
  const cols = engine.detectColumns(header, rows);
  assert.strictEqual(cols.dateCol, 0);
  assert.strictEqual(cols.descCol, 1);
  assert.strictEqual(cols.amountCol, 2);
});

test('detectColumns: by cell shape', () => {
  const header = ['col1', 'col2', 'col3'];
  const rows = [
    ['2026-06-15', 'Amazon', '$50.00'],
    ['2026-06-16', 'Walmart', '$75.50'],
  ];
  const cols = engine.detectColumns(header, rows);
  assert.strictEqual(cols.dateCol, 0);
  assert.strictEqual(cols.descCol, 1);
  assert.strictEqual(cols.amountCol, 2);
});

test('detectColumns: debit/credit columns', () => {
  const header = ['Date', 'Description', 'Debit', 'Credit'];
  const rows = [
    ['2026-06-15', 'Salary', '', '$3000.00'],
    ['2026-06-16', 'Coffee', '$5.00', ''],
  ];
  const cols = engine.detectColumns(header, rows);
  assert(cols.debitCol !== null || cols.creditCol !== null);
});

test('importCSV: basic import', () => {
  const csv = 'Date,Description,Amount\n2026-06-15,Amazon,$50.00\n2026-06-16,Walmart,$75.50';
  const result = engine.importCSV(csv);
  assert.strictEqual(result.transactions.length, 2);
  assert.strictEqual(result.transactions[0].date, '2026-06-15');
  assert.strictEqual(result.transactions[0].amountCents, 5000);
  assert.strictEqual(result.transactions[1].amountCents, 7550);
});

test('importCSV: debit/credit columns', () => {
  const csv = 'Date,Description,Debit,Credit\n2026-06-15,Salary,,3200.00\n2026-06-16,Coffee,5.00,';
  const result = engine.importCSV(csv);
  assert.strictEqual(result.transactions.length, 2);
  assert.strictEqual(result.transactions[0].amountCents, 320000); // credit - debit
  assert.strictEqual(result.transactions[1].amountCents, -500); // credit - debit
});

test('importCSV: skip rows with no date or zero amount', () => {
  const csv = 'Date,Description,Amount\n2026-06-15,Amazon,$50.00\ninvalid,,0\n2026-06-16,Walmart,$75.50';
  const result = engine.importCSV(csv);
  assert.strictEqual(result.transactions.length, 2);
});

test('importCSV: dateInterpretation YYYY-MM-DD', () => {
  const csv = 'Date,Description,Amount\n2026-06-15,Amazon,$50.00';
  const result = engine.importCSV(csv);
  assert.strictEqual(result.dateInterpretation, 'YYYY-MM-DD');
});

test('importCSV: dateInterpretation DD/MM/YYYY', () => {
  const csv = 'Date,Description,Amount\n13/06/2026,Amazon,$50.00';
  const result = engine.importCSV(csv);
  assert.strictEqual(result.dateInterpretation, 'DD/MM/YYYY');
});

test('importCSV: dateInterpretation MM/DD/YYYY', () => {
  const csv = 'Date,Description,Amount\n06/15/2026,Amazon,$50.00';
  const result = engine.importCSV(csv);
  assert.strictEqual(result.dateInterpretation, 'MM/DD/YYYY');
});

test('importCSV: dateInterpretation DD-Mon-YYYY', () => {
  const csv = 'Date,Description,Amount\n15-Jun-2026,Amazon,$50.00';
  const result = engine.importCSV(csv);
  assert.strictEqual(result.dateInterpretation, 'DD-Mon-YYYY');
});

test('normalizePayee: lowercase', () => {
  assert.strictEqual(engine.normalizePayee('AMAZON'), 'amazon');
});

test('normalizePayee: strip card suffixes', () => {
  assert.strictEqual(engine.normalizePayee('Amazon •1234'), 'amazon');
  assert.strictEqual(engine.normalizePayee('Whole Foods *5678'), 'whole foods');
});

test('normalizePayee: strip reference numbers', () => {
  assert.strictEqual(engine.normalizePayee('Store #12345'), 'store');
});

test('normalizePayee: collapse spaces', () => {
  assert.strictEqual(engine.normalizePayee('Amazon   Store   Inc'), 'amazon store inc');
});

test('normalizePayee: trim', () => {
  assert.strictEqual(engine.normalizePayee('  Amazon  '), 'amazon');
});

// Property test: CSV round-trip
test('property test: CSV round-trip', () => {
  for (let trial = 0; trial < 10; trial++) {
    const header = ['Date', 'Payee', 'Amount'];
    const rows = [header];

    for (let i = 0; i < 5; i++) {
      rows.push(generateRandomRow());
    }

    // Serialize to CSV
    let csvText = rows
      .map(row =>
        row
          .map(cell => {
            // Quote if contains comma, newline, or quote
            if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
              return '"' + cell.replace(/"/g, '""') + '"';
            }
            return cell;
          })
          .join(',')
      )
      .join('\n');

    // Parse back
    const result = engine.parseCSV(csvText);

    // Verify structure matches (allowing for normalization)
    assert.strictEqual(result.rows.length, rows.length);
    for (let i = 0; i < result.rows.length; i++) {
      assert.strictEqual(result.rows[i].length, rows[i].length);
    }
  }
});

// Property test: amounts are always integer cents
test('property test: parseAmount always returns integer cents', () => {
  const testValues = [
    '$1.23',
    '(456.78)',
    '₹1,000.00',
    '€999.99',
    '-12.34',
    '$1,234,567.89',
  ];

  for (const val of testValues) {
    const cents = engine.parseAmount(val);
    if (cents !== null) {
      assert.strictEqual(cents, Math.floor(cents), `${val} should parse to integer cents`);
    }
  }
});

// Property test: all transactions have integer amountCents
test('property test: all transactions have integer amountCents', () => {
  const csv = `Date,Description,Amount
2026-06-15,Amazon,$50.00
2026-06-16,Walmart,$75.99
2026-06-17,Starbucks,$3.50`;

  const result = engine.importCSV(csv);
  for (const txn of result.transactions) {
    assert.strictEqual(txn.amountCents, Math.floor(txn.amountCents), 'amountCents must be integer');
  }
});

test('edge case: empty CSV', () => {
  const result = engine.parseCSV('');
  assert.strictEqual(result.rows.length, 0);
});

test('edge case: single row no data', () => {
  const result = engine.parseCSV('Date,Amount');
  assert.strictEqual(result.rows.length, 1);
});

test('edge case: quoted field at end of row', () => {
  const csv = 'Name,Desc\nJohn,"A quoted field"';
  const result = engine.parseCSV(csv);
  assert.strictEqual(result.rows[1][1], 'A quoted field');
});

test('edge case: consecutive delimiters create empty fields', () => {
  const csv = 'A,B,C\n1,,3';
  const result = engine.parseCSV(csv);
  assert.strictEqual(result.rows[1][1], '');
});

test('edge case: parseDate case-insensitive months', () => {
  assert.strictEqual(engine.parseDate('15-JUN-2026'), '2026-06-15');
  assert.strictEqual(engine.parseDate('JUN 15 2026'), '2026-06-15');
});

test('edge case: parseAmount leading/trailing spaces', () => {
  assert.strictEqual(engine.parseAmount('  $100.00  '), 10000);
});

// Property test: totals balance for random transactions
test('property test: totals balance for random transactions', () => {
  for (let trial = 0; trial < 10; trial++) {
    const txns = [];
    let expectedIncome = 0;
    let expectedSpending = 0;

    // Generate 20 random transactions
    for (let i = 0; i < 20; i++) {
      const date = `2026-06-${String(i + 1).padStart(2, '0')}`;
      const amountCents = Math.floor((Math.random() - 0.5) * 100000);
      const description = Math.random() > 0.5 ? 'Income' : 'Expense';
      const category = amountCents > 0 ? 'Income' : 'Other';

      if (amountCents > 0) {
        expectedIncome += amountCents;
      } else {
        expectedSpending += Math.abs(amountCents);
      }

      txns.push({
        id: `test-${i}`,
        date,
        payee: description,
        description,
        amountCents,
        category,
        confidence: 0.9,
      });
    }

    const summary = engine.summarize(txns);
    assert.strictEqual(summary.incomeCents, expectedIncome, `Trial ${trial}: income mismatch`);
    assert.strictEqual(summary.spendingCents, expectedSpending, `Trial ${trial}: spending mismatch`);
    assert.strictEqual(
      summary.netCents,
      expectedIncome - expectedSpending,
      `Trial ${trial}: net should be income - spending`
    );
  }
});

// Property test: subscription detector has 100% recall on generated monthly subscriptions
test('property test: subscription detector 100% recall on planted monthly subscriptions', () => {
  // Create a synthetic CSV with 5 planted monthly subscriptions
  const plantedSubs = [
    { payee: 'Netflix Streaming', amount: 1599, months: 6 },
    { payee: 'Spotify Music', amount: 1199, months: 6 },
    { payee: 'Gym Fitness', amount: 2999, months: 6 },
    { payee: 'Cloud Storage Pro', amount: 1999, months: 6 },
    { payee: 'Gaming Monthly', amount: 999, months: 6 },
  ];

  let csv = 'Date,Description,Amount\n';
  let date = new Date('2026-06-01');

  for (const sub of plantedSubs) {
    for (let month = 0; month < sub.months; month++) {
      const dateStr = date.toISOString().split('T')[0];
      const amountStr = (sub.amount / 100).toFixed(2);
      csv += `${dateStr},"${sub.payee}",-${amountStr}\n`;
      date.setMonth(date.getMonth() + 1);
    }
  }

  const result = engine.importCSV(csv);
  const subs = engine.detectSubscriptions(result.transactions);

  // Should find all 5 planted subscriptions
  assert.strictEqual(subs.length, 5, `Expected to find 5 planted subscriptions, found ${subs.length}`);

  // Verify each subscription has correct properties
  for (const sub of subs) {
    assert.strictEqual(sub.cadence, 'monthly', `${sub.displayName} should be monthly`);
    assert.strictEqual(sub.count, 6, `${sub.displayName} should have 6 charges`);
    assert.strictEqual(sub.yearlyCents, sub.monthlyCents * 12, `${sub.displayName} yearly should be monthly * 12`);
  }
});

