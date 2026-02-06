from typing import Optional
from pydantic import BaseModel

class CategoryBase(BaseModel):
    name: str
    type: str # 'income' or 'expense'

class CategoryCreate(CategoryBase):
    # Icon is optional on create, defaults to "circle" via base or logic
    icon: Optional[str] = "circle"

class CategoryUpdate(CategoryBase):
    name: Optional[str] = None
    type: Optional[str] = None
    icon: Optional[str] = None

class Category(CategoryBase):
    id: int
    user_id: Optional[int] = None
    icon: Optional[str] = "circle" # Default icon if not in DB
    
    class Config:
        from_attributes = True
