from datetime import date
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Company(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)


class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)
    name = db.Column(db.String, nullable=False)
    type = db.Column(db.String)
    detail_type = db.Column(db.String)
    description = db.Column(db.String)
    balance = db.Column(db.Numeric, default=0)
    account_number = db.Column(db.String)
    parent_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=True)

    parent = db.relationship('Account', remote_side=[id], backref='children')


class JournalEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)
    date = db.Column(db.Date, default=date.today)
    entry_number = db.Column(db.String)
    memo = db.Column(db.String)
    name = db.Column(db.String)
    klass = db.Column(db.String)
    source_target_flags = db.Column(db.String)


class EntryLine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    journal_entry_id = db.Column(db.Integer, db.ForeignKey('journal_entry.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    debit = db.Column(db.Numeric, default=0)
    credit = db.Column(db.Numeric, default=0)

    journal_entry = db.relationship('JournalEntry', backref='lines')
    account = db.relationship('Account')
