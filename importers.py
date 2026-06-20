import io
import pandas as pd
from datetime import datetime
from decimal import Decimal

from models import Account, Company, JournalEntry, EntryLine, db


def import_accounts(csv_file, company):
    """Import chart of accounts CSV into `Account` records for the company.

    Expected columns: Account name, Type, Detail type, Description, Balance, Account number, Subaccount structure
    """
    df = pd.read_csv(csv_file)
    created = 0
    for _, row in df.iterrows():
        name = str(row.get('Account name') or row.get('Name') or '')
        if not name:
            continue
        acc = Account(
            company_id=company.id,
            name=name.strip(),
            type=row.get('Type'),
            detail_type=row.get('Detail type'),
            description=row.get('Description'),
            balance=Decimal(str(row.get('Balance') or 0)),
            account_number=str(row.get('Account number') or ''),
        )
        # Handle Subaccount structure as parent separator using ':' or '/'
        sub = row.get('Subaccount structure')
        if pd.notna(sub):
            # If sub contains a parent like Parent:Child, attempt to find parent
            parts = str(sub).split(':') if ':' in str(sub) else str(sub).split('/')
            if len(parts) > 1:
                parent_name = parts[0].strip()
                parent = Account.query.filter_by(company_id=company.id, name=parent_name).first()
                if parent:
                    acc.parent = parent

        db.session.add(acc)
        created += 1
    db.session.commit()
    return created


def import_journal_entries(csv_file, company):
    """Import QuickBooks-style journal entries.

    Expected columns: Date, Entry number, Account, Debit, Credit, Memo, Name, Class, Source/target flags
    Groups rows by Entry number to build JournalEntry with multiple EntryLine items.
    """
    df = pd.read_csv(csv_file)
    created = 0
    # Normalize columns
    df_columns = {c.lower(): c for c in df.columns}
    # group by entry number
    group_col = None
    for key in ['Entry number', 'entry number', 'EntryNumber', 'Entry#']:
        if key in df.columns:
            group_col = key
            break
    if group_col is None:
        # fallback: group by consecutive rows using index
        df['_group'] = df.index
        groups = [(i, g) for i, g in df.groupby('_group')]
    else:
        groups = df.groupby(group_col)

    for entry_key, group in groups:
        first = group.iloc[0]
        date_str = first.get('Date') or first.get('date')
        try:
            when = datetime.strptime(str(date_str), '%Y-%m-%d').date()
        except Exception:
            try:
                when = pd.to_datetime(date_str).date()
            except Exception:
                when = None

        je = JournalEntry(
            company_id=company.id,
            date=when,
            entry_number=str(entry_key),
            memo=first.get('Memo') or first.get('memo'),
            name=first.get('Name') or first.get('name'),
            klass=first.get('Class') or first.get('class'),
            source_target_flags=first.get('Source/target flags') or first.get('Source/target') or '',
        )
        db.session.add(je)
        db.session.flush()

        for _, row in group.iterrows():
            acct_name = row.get('Account') or row.get('account')
            if not acct_name:
                continue
            acct = Account.query.filter_by(company_id=company.id, name=acct_name).first()
            if not acct:
                # create a basic account placeholder
                acct = Account(company_id=company.id, name=acct_name)
                db.session.add(acct)
                db.session.flush()

            debit = Decimal(str(row.get('Debit') or 0))
            credit = Decimal(str(row.get('Credit') or 0))
            line = EntryLine(journal_entry_id=je.id, account_id=acct.id, debit=debit, credit=credit)
            db.session.add(line)

        created += 1

    db.session.commit()
    return created
