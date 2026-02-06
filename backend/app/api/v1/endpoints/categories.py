from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app import schemas, models
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Category])
def read_categories(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve categories (user's custom + system defaults).
    """
    categories = (
        db.query(models.Category)
        .filter(
            or_(
                models.Category.user_id == current_user.id,
                models.Category.user_id.is_(None)
            )
        )
        .offset(skip)
        .limit(limit)
        .all()
    )
    return categories

@router.post("/", response_model=schemas.Category)
def create_category(
    *,
    db: Session = Depends(deps.get_db),
    category_in: schemas.CategoryCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new category.
    """
    category = models.Category(
        **category_in.model_dump(),
        user_id=current_user.id
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/{id}", response_model=schemas.Category)
def update_category(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    category_in: schemas.CategoryUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a category.
    """
    category = db.query(models.Category).filter(models.Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # System categories (user_id is None) cannot be edited
    if category.user_id is None:
        raise HTTPException(status_code=403, detail="Cannot edit system categories")
        
    if category.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = category_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)

    db.add(category)
    db.commit()
    db.refresh(category)
    return category
