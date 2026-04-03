import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import database, users_table
from auth import hash_password, verify_password, create_access_token, get_admin_user

router = APIRouter()

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# REGISTER
@router.post("/register")
async def register(user: UserRegister):
    existing = await database.fetch_one(
        users_table.select().where(users_table.c.email == user.email)
    )
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    query = users_table.insert().values(
        name=user.name, email=user.email,
        password=hash_password(user.password), role="user"
    )
    await database.execute(query)
    return {"message": "User registered successfully!"}

# LOGIN
@router.post("/login")
async def login(user: UserLogin):
    db_user = await database.fetch_one(
        users_table.select().where(users_table.c.email == user.email)
    )
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "id": str(db_user["id"]), "email": db_user["email"],
        "name": db_user["name"], "role": db_user["role"]
    })
    return {
        "access_token": token, "token_type": "bearer",
        "user": {
            "id": str(db_user["id"]), "name": db_user["name"],
            "email": db_user["email"], "role": db_user["role"]
        }
    }

# CREATE ADMIN
@router.post("/create-admin")
async def create_admin():
    existing = await database.fetch_one(
        users_table.select().where(users_table.c.role == "admin")
    )
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")
    query = users_table.insert().values(
        name="Admin", email="admin@ecommerce.com",
        password=hash_password("admin123"), role="admin"
    )
    await database.execute(query)
    return {"message": "Admin created!", "email": "admin@ecommerce.com", "password": "admin123"}

# GET ALL USERS
@router.get("/users")
async def get_users(current_user: dict = Depends(get_admin_user)):
    rows = await database.fetch_all(users_table.select())
    return [{"id": str(r["id"]), "name": r["name"], "email": r["email"], "role": r["role"]} for r in rows]