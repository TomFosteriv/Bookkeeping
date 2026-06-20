# Bookkeeping (minimal)

This is a minimal bookkeeping web app to manage multiple companies, import Chart of Accounts and QuickBooks CSV journal entries, and produce basic reports.

Quick start

1. Create a virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Run the app:

```bash
python app.py
```

3. Open http://127.0.0.1:5000 in your browser.

CSV formats

- Chart of Accounts: columns `Account name`, `Type`, `Detail type`, `Description`, `Balance`, `Account number`, `Subaccount structure`.
- Journal entries (QuickBooks export): columns `Date`, `Entry number`, `Account`, `Debit`, `Credit`, `Memo`, `Name`, `Class`, `Source/target flags`.

Notes

- This is intentionally minimal. Reports are simple SQL aggregations. Use the UI to create a company before importing files for it.
# Bookkeeping
Simply bookkeeping software to replace overpriced QB annual licensing costs
