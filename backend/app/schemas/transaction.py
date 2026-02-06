from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class TransactionBase(BaseModel):
    description: str
    amount: float
    type: str  # 'income', 'expense'
    category_id: int
    date: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(TransactionBase):
    # All fields optional for update
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category_id: Optional[int] = None
    date: Optional[datetime] = None

class Transaction(TransactionBase):
    id: int
    user_id: int
    
    # User requested 'title' but DB has 'description'. 
    # We can use a property or Field alias, but computed property is safer for Pydantic v2/v1 compat
    @property
    def title(self) -> str:
        return self.description

    class Config:
        from_attributes = True
