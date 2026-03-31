import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, HTTPException,Depends
from pydantic import BaseModel
from database import database
from auth import hash_password, verify_password, create_access_token,get_admin_user

router = APIRouter()
users_collection = database["users"]

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# ===== REGISTER =====
@router.post("/register")
async def register(user: UserRegister):
    # Email already exists?
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed,
        "role": "user"  # default role
    }
    await users_collection.insert_one(new_user)
    return {"message": "User registered successfully!"}

# ===== LOGIN =====
@router.post("/login")
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "id":    str(db_user["_id"]),
        "email": db_user["email"],
        "name":  db_user["name"],
        "role":  db_user["role"]
    })

    return {
        "access_token": token,
        "token_type":   "bearer",
        "user": {
            "id":    str(db_user["_id"]),
            "name":  db_user["name"],
            "email": db_user["email"],
            "role":  db_user["role"]
        }
    }

# ===== CREATE ADMIN (one time) =====
@router.post("/create-admin")
async def create_admin():
    existing = await users_collection.find_one({"role": "admin"})
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")

    admin = {
        "name":     "Admin",
        "email":    "admin@ecommerce.com",
        "password": hash_password("admin123"),
        "role":     "admin"
    }
    await users_collection.insert_one(admin)
    return {"message": "Admin created!", "email": "admin@ecommerce.com", "password": "admin123"}


# ===== GET ALL USERS (Admin only) =====
@router.get("/users")
async def get_users(current_user: dict = Depends(get_admin_user)):
    users = []
    async for user in users_collection.find():
        users.append({
            "id":    str(user["_id"]),
            "name":  user["name"],
            "email": user["email"],
            "role":  user["role"]
        })
    return users