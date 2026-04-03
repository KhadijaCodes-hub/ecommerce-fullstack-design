import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, HTTPException
from database import database, products_table
from models.product_models import Product, ProductUpdate
import sqlalchemy

router = APIRouter()

def product_helper(row) -> dict:
    return {
        "id":           str(row["id"]),
        "name":         row["name"],
        "price":        row["price"],
        "old_price":    row["old_price"],
        "image":        row["image"],
        "description":  row["description"],
        "category":     row["category"],
        "brand":        row["brand"],
        "manufacturer": row["manufacturer"],
        "condition":    row["condition"],
        "stock":        row["stock"],
        "rating":       row["rating"],
        "orders":       row["orders"],
        "free_shipping":row["free_shipping"],
    }

# GET ALL PRODUCTS
@router.get("/")
async def get_products(
    category: str = None, search: str = None,
    brand: str = None, manufacturer: str = None,
    condition: str = None, min_price: float = None,
    max_price: float = None, rating: float = None
):
    query = products_table.select()
    if category:    query = query.where(products_table.c.category.ilike(f"%{category}%"))
    if search:      query = query.where(products_table.c.name.ilike(f"%{search}%"))
    if brand:       query = query.where(products_table.c.brand.ilike(f"%{brand}%"))
    if manufacturer:query = query.where(products_table.c.manufacturer.ilike(f"%{manufacturer}%"))
    if condition:   query = query.where(products_table.c.condition.ilike(f"%{condition}%"))
    if min_price:   query = query.where(products_table.c.price >= min_price)
    if max_price:   query = query.where(products_table.c.price <= max_price)
    if rating:      query = query.where(products_table.c.rating >= rating)

    rows = await database.fetch_all(query)
    return [product_helper(r) for r in rows]

# GET SINGLE PRODUCT
@router.get("/{id}")
async def get_product(id: int):
    query = products_table.select().where(products_table.c.id == id)
    row   = await database.fetch_one(query)
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_helper(row)

# CREATE PRODUCT
@router.post("/")
async def create_product(product: Product):
    query = products_table.insert().values(
        name=product.name, price=product.price,
        old_price=product.old_price, image=product.image,
        description=product.description, category=product.category,
        brand=product.brand, manufacturer=product.manufacturer,
        condition=product.condition, stock=product.stock,
        rating=product.rating, orders=product.orders,
        free_shipping=product.free_shipping
    )
    pid = await database.execute(query)
    row = await database.fetch_one(products_table.select().where(products_table.c.id == pid))
    return product_helper(row)

# UPDATE PRODUCT
@router.put("/{id}")
async def update_product(id: int, product: ProductUpdate):
    update_data = {k: v for k, v in product.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided")
    query = products_table.update().where(products_table.c.id == id).values(**update_data)
    await database.execute(query)
    row = await database.fetch_one(products_table.select().where(products_table.c.id == id))
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_helper(row)

# DELETE PRODUCT
@router.delete("/{id}")
async def delete_product(id: int):
    query = products_table.delete().where(products_table.c.id == id)
    await database.execute(query)
    return {"message": "Product deleted successfully"}