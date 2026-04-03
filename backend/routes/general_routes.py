import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter
from database import database, inquiries_table, newsletter_table, orders_table
from models.product_models import Inquiry, Newsletter, Order,OrderItem
from datetime import datetime

router = APIRouter()

COUPONS = {"SAVE10": 10, "SAVE20": 20, "FLAT50": 50, "WELCOME": 15}

# SEND INQUIRY
@router.post("/inquiry")
async def send_inquiry(inquiry: Inquiry):
    query = inquiries_table.insert().values(
        item=inquiry.item, details=inquiry.details,
        quantity=inquiry.quantity, unit=inquiry.unit,
        user_email=inquiry.user_email, status="pending",
        created_at=datetime.utcnow().isoformat()
    )
    await database.execute(query)
    return {"message": "Inquiry sent successfully!"}

# NEWSLETTER
@router.post("/newsletter")
async def subscribe_newsletter(data: Newsletter):
    existing = await database.fetch_one(
        newsletter_table.select().where(newsletter_table.c.email == data.email)
    )
    if existing:
        return {"message": "Already subscribed!"}
    query = newsletter_table.insert().values(
        email=data.email, created_at=datetime.utcnow().isoformat()
    )
    await database.execute(query)
    return {"message": "Subscribed successfully!"}

# VALIDATE COUPON
@router.post("/coupon")
async def validate_coupon(data: dict):
    code = data.get("code", "").upper()
    if code in COUPONS:
        return {"valid": True, "discount": COUPONS[code], "message": f"Coupon applied! ${COUPONS[code]} off"}
    return {"valid": False, "message": "Invalid coupon code"}

# PLACE ORDER
@router.post("/order")
async def place_order(order: Order):
    query = orders_table.insert().values(
        items=json.dumps(order.items),
        subtotal=order.subtotal, discount=order.discount,
        tax=order.tax, total=order.total,
        coupon=order.coupon, user_email=order.user_email,
        user_name=order.user_name, status="pending",
        created_at=datetime.utcnow().isoformat()
    )
    oid = await database.execute(query)
    return {"message": "Order placed successfully!", "order_id": str(oid)}

# GET USER ORDERS
@router.get("/orders/{email}")
async def get_user_orders(email: str):
    rows = await database.fetch_all(
        orders_table.select().where(orders_table.c.user_email == email)
    )
    result = []
    for r in rows:
        result.append({
            "id": str(r["id"]), "items": json.loads(r["items"]),
            "subtotal": r["subtotal"], "total": r["total"],
            "status": r["status"], "created_at": r["created_at"]
        })
    return result