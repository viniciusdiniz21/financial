from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class Investment(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # 'stocks', 'bonds', 'crypto', etc.
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    
    # Caching/Simple Mode fields to support direct "Update"
    current_quantity = Column(Numeric(18, 8), default=0.0)
    average_price = Column(Numeric(10, 2), default=0.0)

    user = relationship("User", back_populates="investments")
    transactions = relationship("InvestmentTransaction", back_populates="investment")

class InvestmentTransaction(Base):
    __tablename__ = "investment_transaction"
    
    id = Column(Integer, primary_key=True, index=True)
    investment_id = Column(Integer, ForeignKey("investment.id"), nullable=False)
    
    type = Column(String, nullable=False) # 'buy' or 'sell'
    quantity = Column(Numeric(18, 8), nullable=False) # Support fractional shares/crypto
    price_per_unit = Column(Numeric(10, 2), nullable=False) 
    total_value = Column(Numeric(10, 2), nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())

    investment = relationship("Investment", back_populates="transactions")
