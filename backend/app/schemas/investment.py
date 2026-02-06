from typing import Optional
from pydantic import BaseModel

class InvestmentBase(BaseModel):
    name: str
    type: str
    quantity: Optional[float] = 0.0
    average_price: Optional[float] = 0.0

class InvestmentCreate(InvestmentBase):
    pass

class InvestmentUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    quantity: Optional[float] = None
    average_price: Optional[float] = None

class Investment(InvestmentBase):
    id: int
    asset_name: str # Mapped from name
    current_total: float # Computed

    class Config:
        from_attributes = True
