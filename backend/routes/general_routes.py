import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter
from database import database
from models.product_models import Inquiry, Newsletter
from datetime import datetime

router = APIRouter()

inquiries_collection  = database["inquiries"]
newsletter_collection = database["newsletter"]

# ===== SEND INQUIRY =====
@router.post("/inquiry")
async def send_inquiry(inquiry: Inquiry):
    data = {
        "item":       inquiry.item,
        "details":    inquiry.details,
        "quantity":   inquiry.quantity,
        "unit":       inquiry.unit,
        "user_email": inquiry.user_email,
        "created_at": datetime.utcnow().isoformat(),
        "status":     "pending"
    }
    await inquiries_collection.insert_one(data)
    return {"message": "Inquiry sent successfully!"}

# ===== GET ALL INQUIRIES (Admin) =====
@router.get("/inquiries")
async def get_inquiries():
    inquiries = []
    async for inq in inquiries_collection.find():
        inq["_id"] = str(inq["_id"])
        inquiries.append(inq)
    return inquiries

# ===== NEWSLETTER SUBSCRIBE =====
@router.post("/newsletter")
async def subscribe_newsletter(data: Newsletter):
    # Already subscribed?
    existing = await newsletter_collection.find_one({"email": data.email})
    if existing:
        return {"message": "Already subscribed!"}

    await newsletter_collection.insert_one({
        "email":      data.email,
        "created_at": datetime.utcnow().isoformat()
    })
    return {"message": "Subscribed successfully!"}

# ===== GET ALL SUBSCRIBERS (Admin) =====
@router.get("/subscribers")
async def get_subscribers():
    subscribers = []
    async for sub in newsletter_collection.find():
        sub["_id"] = str(sub["_id"])
        subscribers.append(sub)
    return subscribers