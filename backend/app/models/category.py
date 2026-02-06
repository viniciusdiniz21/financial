from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class Category(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    icon = Column(String, nullable=True) # New field
    type = Column(String, nullable=False) # 'income' or 'expense'
    
    # Optional: if null, it's a system default category. If set, it's user-custom.
    user_id = Column(Integer, ForeignKey("user.id"), nullable=True) 
    
    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
