from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Investment])
def read_investments(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve investments portfolio.
    """
    investments = (
        db.query(models.Investment)
        .filter(models.Investment.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    results = []
    for inv in investments:
        # Use Simple Mode (cached fields)
        quantity = float(inv.current_quantity or 0.0)
        avg_price = float(inv.average_price or 0.0)
        current_total = quantity * avg_price

        results.append({
            "id": inv.id,
            "name": inv.name,
            "type": inv.type,
            "asset_name": inv.name, 
            "quantity": quantity,
            "average_price": avg_price,
            "current_total": current_total
        })

    return results

@router.post("/", response_model=schemas.Investment)
def create_investment(
    *,
    db: Session = Depends(deps.get_db),
    investment_in: schemas.InvestmentCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new investment asset.
    """
    investment = models.Investment(
        name=investment_in.name,
        type=investment_in.type,
        user_id=current_user.id,
        current_quantity=investment_in.quantity,
        average_price=investment_in.average_price
    )
    db.add(investment)
    db.commit()
    db.refresh(investment)
    
    # Map for response
    investment.asset_name = investment.name 
    investment.quantity = investment.current_quantity
    investment.current_total = float(investment.current_quantity) * float(investment.average_price) # Simplified valuation
    
    return investment

@router.put("/{id}", response_model=schemas.Investment)
def update_investment(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    investment_in: schemas.InvestmentUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update investment details (quantity/price).
    """
    investment = db.query(models.Investment).filter(models.Investment.id == id).first()
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
        
    if investment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = investment_in.model_dump(exclude_unset=True)
    
    # Directly update fields including quantity/avg_price
    if 'quantity' in update_data:
        investment.current_quantity = update_data['quantity']
    if 'average_price' in update_data:
        investment.average_price = update_data['average_price']
    if 'name' in update_data:
        investment.name = update_data['name']
    if 'type' in update_data:
        investment.type = update_data['type']

    db.add(investment)
    db.commit()
    db.refresh(investment)

    # Map for response
    investment.asset_name = investment.name
    investment.quantity = investment.current_quantity
    investment.current_total = float(investment.current_quantity) * float(investment.average_price)
    
    return investment
