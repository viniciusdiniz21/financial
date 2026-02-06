from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from pydantic.networks import EmailStr
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.models import User
from app.schemas import User as UserSchema, UserCreate

router = APIRouter()

@router.post("/", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    # Hash password
    hashed_password = security.get_password_hash(user_in.password)
    
    # Create user object
    db_obj = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        is_active=True,
    )
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    return db_obj


@router.get("/", response_model=list[UserSchema])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve users.
    """
    # Option A (Optimized): Use joinedload to prevent N+1/Lazy Loading errors
    # if the schema expects these relationships.
    # Even if UserSchema is currently simple, this is safer for future extensions.
    users = (
        db.query(User)
        # .options(joinedload(User.transactions)) # Uncomment if schema includes transactions
        .offset(skip)
        .limit(limit)
        .all()
    )
    return users


@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    password: str = Body(None),
    full_name: str = Body(None),
    base_salary: float = Body(None),
    monthly_fixed_expenses: float = Body(None),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own user.
    """
    current_user_data = jsonable_encoder(current_user)
    user_in = UserSchema(**current_user_data)
    
    if password is not None:
        current_user.hashed_password = security.get_password_hash(password)
    if full_name is not None:
        current_user.full_name = full_name
    if base_salary is not None:
        current_user.base_salary = base_salary
    if monthly_fixed_expenses is not None:
        current_user.monthly_fixed_expenses = monthly_fixed_expenses
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
