from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import database, metadata, engine
from routes.products    import router as products_router
from routes.auth_routes import router as auth_router
from routes.general_routes import router as general_router

# Tables banao
metadata.create_all(engine)

app = FastAPI(title="eCommerce API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

app.include_router(products_router, prefix="/api/products", tags=["Products"])
app.include_router(auth_router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(general_router,  prefix="/api/general",  tags=["General"])

@app.get("/")
async def root():
    return {"message": "eCommerce API is running!"}