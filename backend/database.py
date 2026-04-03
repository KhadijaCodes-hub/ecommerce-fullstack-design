import databases
import sqlalchemy
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Async database connection
database = databases.Database(DATABASE_URL)

# SQLAlchemy for table creation
metadata = sqlalchemy.MetaData()

# ===== TABLES =====
products_table = sqlalchemy.Table(
    "products", metadata,
    sqlalchemy.Column("id",           sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("name",         sqlalchemy.String(255), nullable=False),
    sqlalchemy.Column("price",        sqlalchemy.Float, nullable=False),
    sqlalchemy.Column("old_price",    sqlalchemy.Float, nullable=True),
    sqlalchemy.Column("image",        sqlalchemy.String(500)),
    sqlalchemy.Column("description",  sqlalchemy.Text),
    sqlalchemy.Column("category",     sqlalchemy.String(100)),
    sqlalchemy.Column("brand",        sqlalchemy.String(100), nullable=True),
    sqlalchemy.Column("manufacturer", sqlalchemy.String(100), nullable=True),
    sqlalchemy.Column("condition",    sqlalchemy.String(50), default="Brand new"),
    sqlalchemy.Column("stock",        sqlalchemy.Integer, default=0),
    sqlalchemy.Column("rating",       sqlalchemy.Float, default=7.5),
    sqlalchemy.Column("orders",       sqlalchemy.Integer, default=0),
    sqlalchemy.Column("free_shipping",sqlalchemy.Boolean, default=True),
)

users_table = sqlalchemy.Table(
    "users", metadata,
    sqlalchemy.Column("id",       sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("name",     sqlalchemy.String(255), nullable=False),
    sqlalchemy.Column("email",    sqlalchemy.String(255), unique=True, nullable=False),
    sqlalchemy.Column("password", sqlalchemy.String(500), nullable=False),
    sqlalchemy.Column("role",     sqlalchemy.String(50), default="user"),
)

inquiries_table = sqlalchemy.Table(
    "inquiries", metadata,
    sqlalchemy.Column("id",         sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("item",       sqlalchemy.String(255)),
    sqlalchemy.Column("details",    sqlalchemy.Text, nullable=True),
    sqlalchemy.Column("quantity",   sqlalchemy.Integer, nullable=True),
    sqlalchemy.Column("unit",       sqlalchemy.String(50), nullable=True),
    sqlalchemy.Column("user_email", sqlalchemy.String(255), nullable=True),
    sqlalchemy.Column("status",     sqlalchemy.String(50), default="pending"),
    sqlalchemy.Column("created_at", sqlalchemy.String(100)),
)

newsletter_table = sqlalchemy.Table(
    "newsletter", metadata,
    sqlalchemy.Column("id",         sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("email",      sqlalchemy.String(255), unique=True, nullable=False),
    sqlalchemy.Column("created_at", sqlalchemy.String(100)),
)

orders_table = sqlalchemy.Table(
    "orders", metadata,
    sqlalchemy.Column("id",         sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("items",      sqlalchemy.Text),  # JSON string
    sqlalchemy.Column("subtotal",   sqlalchemy.Float),
    sqlalchemy.Column("discount",   sqlalchemy.Float),
    sqlalchemy.Column("tax",        sqlalchemy.Float),
    sqlalchemy.Column("total",      sqlalchemy.Float),
    sqlalchemy.Column("coupon",     sqlalchemy.String(100), nullable=True),
    sqlalchemy.Column("user_email", sqlalchemy.String(255), nullable=True),
    sqlalchemy.Column("user_name",  sqlalchemy.String(255), nullable=True),
    sqlalchemy.Column("status",     sqlalchemy.String(50), default="pending"),
    sqlalchemy.Column("created_at", sqlalchemy.String(100)),
)

engine = sqlalchemy.create_engine(DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://"))