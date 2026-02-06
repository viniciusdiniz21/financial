from sqlalchemy.orm import Session
from app.models.category import Category
from app.db.session import SessionLocal

def init_db(db: Session = SessionLocal()):
    # Create default categories if they don't exist
    default_categories = [
        {"name": "Alimentação", "type": "expense", "icon": "Utensils"}, # circle default in schema but we want Utensils
        {"name": "Moradia", "type": "expense", "icon": "Home"},
        {"name": "Salário", "type": "income", "icon": "DollarSign"},
        {"name": "Lazer", "type": "expense", "icon": "Gamepad"},
        {"name": "Transporte", "type": "expense", "icon": "Car"},
    ]

    for cat_data in default_categories:
        # Check if exists by name (system category)
        # We assume system categories have user_id=None
        existing = db.query(Category).filter(
            Category.name == cat_data["name"], 
            Category.user_id == None
        ).first()
        
        if not existing:
            category = Category(
                name=cat_data["name"],
                type=cat_data["type"],
                icon=cat_data["icon"],
                user_id=None # System category
            )
            db.add(category)
            print(f"Creating default category: {cat_data['name']}")
    
    db.commit()
    print(">>> Categories seeded <<<")

if __name__ == "__main__":
    init_db()
