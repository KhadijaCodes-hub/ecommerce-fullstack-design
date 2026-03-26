import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, HTTPException
from database import products_collection
from models.product_models import Product, ProductUpdate
from bson import ObjectId

router = APIRouter()

# Helper — MongoDB _id ko string mein convert karo
def product_helper(product) -> dict:
    return {
        "id": str(product["_id"]),
        "name": product["name"],
        "price": product["price"],
        "old_price": product.get("old_price", None),
        "image": product["image"],
        "description": product["description"],
        "category": product["category"],
        "brand": product.get("brand", None),
        "manufacturer": product.get("manufacturer", None),
        "condition": product.get("condition", "Brand new"),
        "stock": product["stock"],
        "rating": product.get("rating", 7.5),
        "orders": product.get("orders", 154),
        "free_shipping": product.get("free_shipping", True),
    }

# ===== GET ALL PRODUCTS =====
@router.get("/")
async def get_products(
    category: str = None,
    search: str = None,
    brand: str = None,
    min_price: float = None,
    max_price: float = None,
    condition: str = None,
    rating: float = None,
    manufacturer: str = None,
    free_shipping: bool = None
):
    query = {}
    if category:
        query["category"] = {"$regex": category, "$options": "i"}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if brand:
        query["brand"] = {"$regex": brand, "$options": "i"}
    if manufacturer:
        query["manufacturer"] = {"$regex": manufacturer, "$options": "i"}
    if condition:
        query["condition"] = {"$regex": condition, "$options": "i"}
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    if rating is not None:
        query["rating"] = {"$gte": rating}
    if free_shipping is not None:
        query["free_shipping"] = free_shipping

    products = []
    async for product in products_collection.find(query):
        products.append(product_helper(product))
    return products

# ===== GET SINGLE PRODUCT =====
@router.get("/{id}")
async def get_product(id: str):
    product = await products_collection.find_one({"_id": ObjectId(id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_helper(product)

# ===== CREATE PRODUCT =====
@router.post("/")
async def create_product(product: Product):
    result = await products_collection.insert_one(product.dict())
    new_product = await products_collection.find_one({"_id": result.inserted_id})
    return product_helper(new_product)

# ===== UPDATE PRODUCT =====
@router.put("/{id}")
async def update_product(id: str, product: ProductUpdate):
    update_data = {k: v for k, v in product.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Koi data nahi diya update ke liye")
    
    result = await products_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": update_data}
    )
    
    # Modified count 0 ho lekin product exist karta ho — ye bhi handle karo
    updated = await products_collection.find_one({"_id": ObjectId(id)})
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product_helper(updated)

# ===== DELETE PRODUCT =====
@router.delete("/{id}")
async def delete_product(id: str):
    result = await products_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}