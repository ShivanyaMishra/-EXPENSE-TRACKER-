"""
AetherFinance - Professional Multi-Sheet Excel Export Engine (Python / openpyxl)
Preserves backwards compatibility with:
- export_to_excel(data, file_name)
While supporting the new 6-sheet comprehensive workbook:
Sheet 1: Transactions
Sheet 2: Monthly Summary
Sheet 3: Category Analysis
Sheet 4: Budgets
Sheet 5: Savings Goals
Sheet 6: AI Insights
"""

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side


def export_to_excel(data, file_name="expenses.xlsx"):
    """
    Preserves original single-sheet function signature from user's code snippet.
    """
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Transactions"
    ws.append(["Date", "Category", "Amount (₹)", "Description", "Payment Method", "Notes"])

    for record in data:
        # Map record fields gracefully
        ws.append(list(record))

    wb.save(file_name)
    return file_name


def export_comprehensive_excel(
    transactions,
    monthly_summary,
    category_analysis,
    budgets,
    savings_goals,
    ai_insights,
    file_name="AetherFinance_Comprehensive_Report.xlsx"
):
    """
    Generates a 6-sheet professional Excel workbook with distinct worksheets (Requirement 19).
    """
    wb = openpyxl.Workbook()

    # Sheet 1: Transactions
    ws1 = wb.active
    ws1.title = "Transactions"
    ws1.append(["ID", "Date", "Description / Product", "Category", "Amount (₹)", "Payment Method", "Notes", "Type"])
    for t in transactions:
        ws1.append([
            t.get("id", ""),
            t.get("date", ""),
            t.get("description", ""),
            t.get("category", ""),
            t.get("amount", 0.0),
            t.get("payment_method", "UPI"),
            t.get("notes", ""),
            "Income" if t.get("is_income") else "Expense",
        ])

    # Sheet 2: Monthly Summary
    ws2 = wb.create_sheet(title="Monthly Summary")
    ws2.append(["Metric", "Value"])
    for k, v in monthly_summary.items():
        ws2.append([str(k).replace("_", " ").title(), str(v)])

    # Sheet 3: Category Analysis
    ws3 = wb.create_sheet(title="Category Analysis")
    ws3.append(["Category", "Total Spent (₹)", "Percentage (%)", "Transaction Count", "MoM Trend (%)"])
    for c in category_analysis:
        ws3.append([
            c.get("category", ""),
            c.get("total", 0.0),
            f"{c.get('percentage', 0.0):.1f}%",
            c.get("count", 0),
            f"{c.get('trend_percentage', 0.0):+.1f}%"
        ])

    # Sheet 4: Budgets
    ws4 = wb.create_sheet(title="Budgets")
    ws4.append(["Budget Name", "Category", "Monthly Limit (₹)", "Spent (₹)", "Remaining (₹)", "Status"])
    for b in budgets:
        ws4.append([
            b.get("name", ""),
            b.get("category", ""),
            b.get("limit_amount", 0.0),
            b.get("spent", 0.0),
            b.get("remaining", 0.0),
            b.get("status", "Normal"),
        ])

    # Sheet 5: Savings Goals
    ws5 = wb.create_sheet(title="Savings Goals")
    ws5.append(["Goal Name", "Target Amount (₹)", "Current Saved (₹)", "Remaining (₹)", "Target Date", "Progress (%)"])
    for g in savings_goals:
        target = g.get("target_amount", 1)
        current = g.get("current_amount", 0)
        ws5.append([
            g.get("name", ""),
            target,
            current,
            max(0, target - current),
            g.get("target_date", ""),
            f"{(current / target * 100):.1f}%"
        ])

    # Sheet 6: AI Insights
    ws6 = wb.create_sheet(title="AI Insights")
    ws6.append(["Category / Section", "AI Advisor Strategic Assessment"])
    for insight in ai_insights:
        ws6.append([insight.get("title", "Insight"), insight.get("details", "")])

    wb.save(file_name)
    return file_name
