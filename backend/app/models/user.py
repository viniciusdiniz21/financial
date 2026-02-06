from sqlalchemy import Boolean, Column, Integer, String, Numeric
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    base_salary = Column(Numeric(10, 2), default=0.0)
    monthly_fixed_expenses = Column(Numeric(10, 2), default=0.0)
    
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)

    transactions = relationship("Transaction", back_populates="user")
    investments = relationship("Investment", back_populates="user")
    categories = relationship("Category", back_populates="user")
