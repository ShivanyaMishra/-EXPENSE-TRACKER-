"""
AetherFinance - Dedicated AI Financial Intelligence Layer (Python)
Responsibilities:
- analyze_transactions()
- detect_top_expenses()
- detect_spending_patterns()
- detect_anomalies()
- generate_budget_advice()
- generate_savings_advice()
- generate_monthly_summary()

Uses deterministic calculations for all numerical facts.
Optionally passes calculated facts to Google GenAI for natural language narrative synthesis.
"""

from collections import defaultdict
import statistics
import os

try:
    from google import genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


def analyze_transactions(transactions):
    """
    Computes deterministic statistical metrics across all transactions.
    Expects records formatted as: (id, amount, category, description, date, payment_method, notes, is_income)
    """
    total_income = sum(t[1] for t in transactions if len(t) > 7 and t[7] == 1)
    expenses = [t for t in transactions if len(t) <= 7 or t[7] == 0]
    total_expenses = sum(t[1] for t in expenses)
    balance = total_income - total_expenses
    savings = max(0.0, balance)
    savings_rate = (savings / total_income * 100) if total_income > 0 else 0.0

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "balance": balance,
        "total_saved": savings,
        "savings_rate": savings_rate,
        "transaction_count": len(expenses),
    }


def detect_top_expenses(transactions, limit=5):
    """
    Identifies which products or individual descriptions are costing the most.
    Calculates total, count, average value, and percentage of spending.
    """
    expenses = [t for t in transactions if len(t) <= 7 or t[7] == 0]
    total_spent = sum(t[1] for t in expenses)

    product_groups = defaultdict(lambda: {"total": 0.0, "count": 0, "category": ""})
    for t in expenses:
        # t[1] is amount, t[2] is category, t[3] is description
        amount = float(t[1])
        cat = t[2]
        desc = t[3].strip()
        product_groups[desc]["total"] += amount
        product_groups[desc]["count"] += 1
        product_groups[desc]["category"] = cat

    items = []
    for desc, data in product_groups.items():
        avg = data["total"] / data["count"] if data["count"] > 0 else data["total"]
        pct = (data["total"] / total_spent * 100) if total_spent > 0 else 0.0
        items.append({
            "description": desc,
            "category": data["category"],
            "total_amount": round(data["total"], 2),
            "transaction_count": data["count"],
            "average_amount": round(avg, 2),
            "percentage_of_total": round(pct, 2),
            "savings_tip": f"Reducing this by 30% could save approximately ₹{round(data['total'] * 0.3, 2)}."
        })

    items.sort(key=lambda x: x["total_amount"], reverse=True)
    return items[:limit]


def detect_spending_patterns(current_transactions, previous_transactions):
    """
    Compares Month-over-Month category shifts to identify increasing and decreasing patterns.
    """
    curr_cat = defaultdict(float)
    for t in [x for x in current_transactions if len(x) <= 7 or x[7] == 0]:
        curr_cat[t[2]] += float(t[1])

    prev_cat = defaultdict(float)
    for t in [x for x in previous_transactions if len(x) <= 7 or x[7] == 0]:
        prev_cat[t[2]] += float(t[1])

    increasing = []
    decreasing = []

    for cat, curr_val in curr_cat.items():
        prev_val = prev_cat.get(cat, 0.0)
        if prev_val > 0:
            diff_pct = ((curr_val - prev_val) / prev_val) * 100
            if diff_pct > 5:
                increasing.append({"category": cat, "increase_pct": round(diff_pct, 1), "diff": round(curr_val - prev_val, 2)})
            elif diff_pct < -5:
                decreasing.append({"category": cat, "decrease_pct": round(abs(diff_pct), 1), "diff": round(prev_val - curr_val, 2)})

    return {"increasing": increasing, "decreasing": decreasing}


def detect_anomalies(all_transactions, target_transactions):
    """
    Statistical anomaly detection based on category distribution standard deviations.
    Flags transactions significantly higher than historical category baseline.
    """
    category_amounts = defaultdict(list)
    for t in [x for x in all_transactions if len(x) <= 7 or x[7] == 0]:
        category_amounts[t[2]].append(float(t[1]))

    anomalies = []
    for t in [x for x in target_transactions if len(x) <= 7 or x[7] == 0]:
        amount = float(t[1])
        cat = t[2]
        history = category_amounts.get(cat, [])
        if len(history) >= 3:
            mean = statistics.mean(history)
            stdev = statistics.stdev(history) if len(history) > 1 else 0
            if amount > 1000 and amount >= mean * 2.2 and amount > (mean + 1.8 * stdev):
                factor = round(amount / (mean or 1), 1)
                anomalies.append({
                    "id": t[0],
                    "description": t[3],
                    "amount": amount,
                    "category": cat,
                    "date": t[4],
                    "factor": factor,
                    "message": f"₹{amount:,.2f} is significantly higher ({factor}x) than your typical {cat} transactions (historical avg: ₹{mean:,.2f})."
                })

    return anomalies


def generate_budget_advice(budgets_status):
    """
    Deterministic budget guidance based on utilization percentages.
    """
    warnings = []
    for b in budgets_status:
        pct = b.get("percentage", 0)
        cat = b.get("category", "")
        limit = b.get("limit", 0)
        spent = b.get("spent", 0)

        if pct >= 100:
            warnings.append(f"🚨 Budget Exceeded: You have pushed {cat} spending ₹{spent - limit:,.2f} above your monthly limit of ₹{limit:,.2f}.")
        elif pct >= 80:
            warnings.append(f"⚠️ Warning: You have reached {pct:.1f}% of your {cat} budget (₹{spent:,.2f} / ₹{limit:,.2f}).")

    return warnings


def generate_savings_advice(savings_goals):
    """
    Computes required monthly run-rate for active capital targets.
    """
    advice = []
    for g in savings_goals:
        name = g.get("name", "")
        remaining = max(0.0, g.get("target_amount", 0) - g.get("current_amount", 0))
        monthly_target = g.get("monthly_target", 0) or round(remaining / 6, 2)
        advice.append(f"To reach '{name}' on schedule, allocate ₹{monthly_target:,.2f}/month toward the remaining gap of ₹{remaining:,.2f}.")

    return advice


def generate_monthly_summary(income, expenses, top_category, top_product, anomalies, patterns):
    """
    Compiles deterministic monthly review facts.
    """
    savings = max(0.0, income - expenses)
    savings_rate = (savings / income * 100) if income > 0 else 0.0

    summary = {
        "income": round(income, 2),
        "expenses": round(expenses, 2),
        "savings": round(savings, 2),
        "savings_rate_pct": round(savings_rate, 1),
        "top_category": top_category,
        "top_spending_item": top_product,
        "anomalies_detected": len(anomalies),
        "increasing_categories": [c["category"] for c in patterns.get("increasing", [])],
        "decreasing_categories": [c["category"] for c in patterns.get("decreasing", [])],
    }

    return summary
