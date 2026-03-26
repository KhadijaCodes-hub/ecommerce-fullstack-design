from pydantic import BaseModel
from typing import Optional

class Product(BaseModel):
    name: str
    price: float
    old_price: Optional[float] = None
    image: str
    description: str
    category: str
    brand: Optional[str] = None
    manufacturer: Optional[str] = None
    condition: Optional[str] = "Brand new"
    stock: int
    rating: Optional[float] = 7.5
    orders: Optional[int] = 154
    free_shipping: Optional[bool] = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    old_price: Optional[float] = None
    image: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    manufacturer: Optional[str] = None
    condition: Optional[str] = None
    stock: Optional[int] = None
    rating: Optional[float] = None
    orders: Optional[int] = None
    free_shipping: Optional[bool] = None