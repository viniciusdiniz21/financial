from typing import Any, Dict
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models
from app.api import deps

router = APIRouter()

@router.get("/")
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    start_date: date | None = Query(None),
    end_date: date | None = Query(None)
) -> Dict[str, Any]:
    """
    Get dashboard statistics with updated logic:
    Total Income = Transaction Income + Base Salary
    Balance = Total Income - Total Expenses
    """
    # 1. Base Salary (If filtering by custom date, maybe we shouldn't include full base salary or prorate it? 
    # For simplicity/MVP, keeping base salary as is or maybe only if it falls in range. 
    # Usually Dashboard Summary is for a "Current View". 
    # Let's assume Base Salary is monthly. If range is < 1 month, it's weird. 
    # If range is arbitrary, maybe just show transactions?
    # Request says: "User switches views... balance... should update".
    # Standard behavior: Base Salary is a "recurring" thing, usually added as a transaction or just a setting.
    # Here it is a setting. For specific date ranges, arguably base salary shouldn't be blindly added unless we generate virtual transactions.
    # However, to avoid complexity, I will leave Base Salary as a constant "Monthly Potential" or just include it if no filter or full month.
    # BUT, to match "Calculated Balance", usually we only sum REAL TRANSACTIONS in a filtered view.
    # If filtering by specific date, showing "Base Salary" might be misleading if it's not a real transaction.
    # Let's stick to: If filter is present, maybe we just sum transactions. 
    # OR, better: The logic previously was Base Salary + Income Transactions.
    # I will apply filters to transitions. Base Salary logic I will leave as is for "Overview", or maybe ignore it?
    # Let's keep it simple: Base Salary is added to Total Income. 
    # If the user filters "Last Month", they expect to see Last Month's Salary.
    # Since we don't have "Salary Transactions", we can't filter them.
    # PROPOSAL: For now, I will NOT filter Base Salary (it's a static profile config). 
    # Ideally, Salary should be generated as transactions.
    base_salary = float(current_user.base_salary or 0.0)

    # 2. Transaction Totals
    income_query = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.type == 'income'
    )
    
    expense_query = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.type == 'expense'
    )

    # Apply Filters
    if start_date:
        income_query = income_query.filter(models.Transaction.date >= start_date)
        expense_query = expense_query.filter(models.Transaction.date >= start_date)
    if end_date:
        income_query = income_query.filter(models.Transaction.date <= end_date)
        expense_query = expense_query.filter(models.Transaction.date <= end_date)

    transaction_income = income_query.scalar() or 0.0
    transaction_expenses = expense_query.scalar() or 0.0

    # 3. Final Calculations
    # If filtering, Base Salary might be inaccurate if not checking date. 
    # But let's assume 'base_salary' is always present for now.
    total_income = base_salary + float(transaction_income)
    total_expense = float(transaction_expenses)
    current_balance = total_income - total_expense

    # 4. Expenses by Category
    expenses_cat_query = db.query(models.Category.name, func.sum(models.Transaction.amount)).join(models.Transaction).filter(
        models.Transaction.user_id == current_user.id, 
        models.Transaction.type == 'expense'
    )

    if start_date:
        expenses_cat_query = expenses_cat_query.filter(models.Transaction.date >= start_date)
    if end_date:
        expenses_cat_query = expenses_cat_query.filter(models.Transaction.date <= end_date)

    expenses_by_category = expenses_cat_query.group_by(models.Category.name).all()
    
    formatted_expenses = [{"category": name, "amount": float(amount)} for name, amount in expenses_by_category]

    return {
        "current_balance": current_balance,
        "total_income": total_income,
        "total_expense": total_expense,
        "expenses_by_category": formatted_expenses,
    }

@router.get("/charts")
def get_dashboard_charts(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    start_date: date | None = Query(None),
    end_date: date | None = Query(None)
) -> Dict[str, Any]:
    """
    Get data for dashboard charts (History & Categories).
    """
    # 1. Finances History
    history_base_query = db.query(
        func.to_char(models.Transaction.date, 'MM/YYYY').label('month'),
        models.Transaction.type,
        func.sum(models.Transaction.amount)
    ).filter(models.Transaction.user_id == current_user.id)

    if start_date:
        history_base_query = history_base_query.filter(models.Transaction.date >= start_date)
    if end_date:
        history_base_query = history_base_query.filter(models.Transaction.date <= end_date)

    history_query = history_base_query.group_by(func.to_char(models.Transaction.date, 'MM/YYYY'), models.Transaction.type).all()
    
    history_map = {}
    for month, trans_type, amount in history_query:
        if month not in history_map:
            history_map[month] = {"month": month, "income": 0.0, "expense": 0.0}
        
        if trans_type == 'income':
            history_map[month]["income"] = float(amount)
        elif trans_type == 'expense':
            history_map[month]["expense"] = float(amount)
            
    # Sort
    history_list = list(history_map.values())
    def month_sort_key(item):
        m, y = item['month'].split('/')
        return f"{y}{m}"
    history_list.sort(key=month_sort_key)

    # 2. Expenses by Category (Pie Chart)
    category_base_query = db.query(models.Category.name, func.sum(models.Transaction.amount)).join(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.type == 'expense'
    )
    
    if start_date:
        category_base_query = category_base_query.filter(models.Transaction.date >= start_date)
    if end_date:
        category_base_query = category_base_query.filter(models.Transaction.date <= end_date)

    category_query = category_base_query.group_by(models.Category.name).all()
    
    colors = ['#10b981', '#6366f1', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899']
    
    categories_list = []
    for i, (name, amount) in enumerate(category_query):
        categories_list.append({
            "name": name,
            "value": float(amount),
            "color": colors[i % len(colors)]
        })

    return {
        "history": history_list,
        "categories": categories_list
    }
