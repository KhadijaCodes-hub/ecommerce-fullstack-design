from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.products import router as products_router
from routes.auth_routes import router as auth_router
from routes.general_routes import router as general_router
from models.product_models import Product,ProductUpdate

app = FastAPI(title="eCommerce API")

# CORS — frontend se connect karne ke liye
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(products_router, prefix="/api/products", tags=["Products"])
app.include_router(auth_router,    prefix="/api/auth",    tags=["Auth"])
app.include_router(general_router, prefix="/api/general", tags=["General"])


@app.get("/")
async def root():
    return {"message": "eCommerce API is running!"}