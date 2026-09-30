"""
AetherFinance - Database Engine (SQLite)
Preserves original database CRUD methods:
- add_expense
- get_expenses
- delete_expense
- update_expense
While adding support for new fields: payment_method, notes, is_income,
and relational tables for budgets and savings goals.
"""

import sqlite3
import os
from datetime import datetime

DB_PATH = os.environ.get("AETHER_DB_PATH", "expenses.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Core Expenses / Transactions Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            date TEXT NOT NULL,
            payment_method TEXT DEFAULT 'UPI',
            notes TEXT DEFAULT '',
            is_income INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Budgets Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            limit_amount REAL NOT NULL,
            warning_threshold REAL DEFAULT 0.80,
            start_date TEXT,
            end_date TEXT,
            rollover INTEGER DEFAULT 0
        )
    """)

    # Savings Goals Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS savings_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            target_amount REAL NOT NULL,
            current_amount REAL DEFAULT 0,
            target_date TEXT NOT NULL,
            monthly_target REAL DEFAULT 0
        )
    """)

    conn.commit()
    conn.close()


# Preserved Original CRUD signatures for backwards compatibility
def add_expense(amount, category, description, date, payment_method="UPI", notes="", is_income=0):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO expenses (amount, category, description, date, payment_method, notes, is_income)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (float(amount), category, description, date, payment_method, notes, int(is_income)))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return new_id


def get_expenses(month=None):
    conn = get_connection()
    cursor = conn.cursor()
    if month:
        cursor.execute("SELECT id, amount, category, description, date, payment_method, notes, is_income FROM expenses WHERE date LIKE ? ORDER BY date DESC", (f"{month}%",))
    else:
        cursor.execute("SELECT id, amount, category, description, date, payment_method, notes, is_income FROM expenses ORDER BY date DESC")
    rows = cursor.fetchall()
    conn.close()
    return [tuple(r) for r in rows]


def update_expense(expense_id, amount, category, description, date, payment_method="UPI", notes=""):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE expenses
        SET amount = ?, category = ?, description = ?, date = ?, payment_method = ?, notes = ?
        WHERE id = ?
    """, (float(amount), category, description, date, payment_method, notes, expense_id))
    conn.commit()
    conn.close()


def delete_expense(expense_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
    conn.commit()
    conn.close()


# Safe Database Migration (Requirement 18)
def migrate_existing_database():
    """Migrates any existing SQLite database schema safely without data loss."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check existing columns in expenses table
    cursor.execute("PRAGMA table_info(expenses)")
    columns = [row[1] for row in cursor.fetchall()]

    if "payment_method" not in columns:
        cursor.execute("ALTER TABLE expenses ADD COLUMN payment_method TEXT DEFAULT 'UPI'")
    if "notes" not in columns:
        cursor.execute("ALTER TABLE expenses ADD COLUMN notes TEXT DEFAULT ''")
    if "is_income" not in columns:
        cursor.execute("ALTER TABLE expenses ADD COLUMN is_income INTEGER DEFAULT 0")
    if "created_at" not in columns:
        cursor.execute("ALTER TABLE expenses ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")

    conn.commit()
    conn.close()
    print("✓ SQLite database migration verified. All user data preserved.")


if __name__ == "__main__":
    init_db()
    migrate_existing_database()
