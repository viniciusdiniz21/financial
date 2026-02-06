from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()
# Verifica se já existe
if not db.query(User).filter(User.email == "admin@admin.com").first():
    user = User(
        email="admin@admin.com",
        hashed_password=get_password_hash("admin"),
        full_name="Admin",
        is_superuser=True,
        is_active=True
    )
    db.add(user)
    db.commit()
    print(">>> USER ADMIN CRIADO COM SUCESSO <<<")
else:
    print(">>> USER JÁ EXISTE <<<")
