from flask import Flask, render_template, request, redirect, url_for, flash
from models import db, Company, Account, JournalEntry, EntryLine
import importers
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'bookkeeping.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'dev'
    db.init_app(app)

    with app.app_context():
        db.create_all()

    @app.route('/')
    def index():
        companies = Company.query.all()
        return render_template('index.html', companies=companies)

    @app.route('/companies/create', methods=['POST'])
    def create_company():
        name = request.form.get('name')
        if not name:
            flash('Name required')
            return redirect(url_for('index'))
        c = Company(name=name)
        db.session.add(c)
        db.session.commit()
        return redirect(url_for('index'))

    @app.route('/companies/<int:company_id>/import/accounts', methods=['GET', 'POST'])
    def import_accounts(company_id):
        company = Company.query.get_or_404(company_id)
        if request.method == 'POST':
            f = request.files.get('file')
            if not f:
                flash('File required')
                return redirect(request.url)
            count = importers.import_accounts(f, company)
            flash(f'Imported {count} accounts')
            return redirect(url_for('index'))
        return render_template('import_accounts.html', company=company)

    @app.route('/companies/<int:company_id>/import/journal', methods=['GET', 'POST'])
    def import_journal(company_id):
        company = Company.query.get_or_404(company_id)
        if request.method == 'POST':
            f = request.files.get('file')
            if not f:
                flash('File required')
                return redirect(request.url)
            count = importers.import_journal_entries(f, company)
            flash(f'Imported {count} journal entries')
            return redirect(url_for('index'))
        return render_template('import_journal.html', company=company)

    @app.route('/companies/<int:company_id>/reports/trial_balance')
    def trial_balance(company_id):
        company = Company.query.get_or_404(company_id)
        # Sum debits and credits per account
        accounts = []
        for a in Account.query.filter_by(company_id=company.id).all():
            debit = 0
            credit = 0
            for line in a.children:  # placeholder to avoid unused
                pass
            # compute from EntryLine table
            totals = db.session.query(
                db.func.coalesce(db.func.sum(EntryLine.debit), 0),
                db.func.coalesce(db.func.sum(EntryLine.credit), 0),
            ).filter(EntryLine.account_id == a.id).one()
            accounts.append({'account': a, 'debit': totals[0], 'credit': totals[1]})
        return render_template('trial_balance.html', company=company, accounts=accounts)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
