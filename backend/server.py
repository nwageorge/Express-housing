from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date
import bcrypt
import jwt
from jwt.exceptions import InvalidTokenError

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'expresshousing2025secretkey')
JWT_ALGORITHM = 'HS256'

app = FastAPI(title="Express Housing API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ===== MODELS =====
class UserBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: str
    name: str
    role: str = "guest"
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ApartmentBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str
    building_name: str
    neighborhood: str
    city: str = "Philadelphia, PA"
    address: str = ""
    apt_type: str  # Studio, 1 Bedroom, 2 Bedroom, 3 Bedroom, Penthouse
    bedrooms: int
    bathrooms: float
    max_guests: int
    sqft: int
    nightly_rate: float
    monthly_rate: float
    description: str = ""
    amenities: List[str] = []
    images: List[str] = []
    stay_paths: List[str] = []  # corporate, medical, family
    rating: float = 4.8
    review_count: int = 0
    is_featured: bool = False
    is_new: bool = False
    min_nights: int = 2
    reviews: List[dict] = []
    photo_tour: List[dict] = []  # [{url, room}]

class Apartment(ApartmentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookingCreate(BaseModel):
    apartment_id: str
    check_in: str   # YYYY-MM-DD
    check_out: str  # YYYY-MM-DD
    guests: int = 1
    purpose: str = "leisure"  # business, medical, family, relocation, leisure
    notes: Optional[str] = None

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str = ""
    user_email: str = ""
    apartment_id: str
    apartment_title: str = ""
    apartment_image: str = ""
    neighborhood: str = ""
    check_in: str
    check_out: str
    nights: int = 1
    guests: int = 1
    purpose: str = "leisure"
    notes: Optional[str] = None
    status: str = "pending"  # pending, confirmed, completed, cancelled
    total_price: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str

# ===== AUTH HELPERS =====
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc).timestamp() + 86400 * 7
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ===== EMAIL (MOCKED - logged to db.email_log, visible in admin dashboard) =====
async def send_email(to_email: str, to_name: str, subject: str, body: str, booking_id: str = None):
    """MOCKED email sender. Logs the email instead of sending.
    Swap this function body with a real provider (SendGrid etc.) later."""
    record = {
        "id": str(uuid.uuid4()),
        "to_email": to_email,
        "to_name": to_name,
        "subject": subject,
        "body": body,
        "booking_id": booking_id,
        "status": "sent (mocked)",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.email_log.insert_one(dict(record))
    logger.info(f"[MOCK EMAIL] to={to_email} subject={subject}")
    return record

# ===== ROUTES =====
@api_router.get("/")
async def root():
    return {"message": "Express Housing - Flexible Furnished Stays API"}

# --- Auth ---
@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_dict = user_data.model_dump()
    password = user_dict.pop("password")
    user = {
        **user_dict,
        "id": str(uuid.uuid4()),
        "password_hash": hash_password(password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user)
    token = create_token(user["id"], user["email"])
    safe_user = {k: v for k, v in user.items() if k not in ("password_hash", "_id")}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], user["email"])
    safe_user = {k: v for k, v in user.items() if k not in ("password_hash", "_id")}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {k: v for k, v in user.items() if k != "password_hash"}

# --- Apartments ---
@api_router.get("/apartments")
async def get_apartments(
    neighborhood: Optional[str] = None,
    apt_type: Optional[str] = None,
    guests: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    stay_path: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    sort: Optional[str] = None,
):
    query = {}
    if neighborhood:
        query["neighborhood"] = neighborhood
    if apt_type:
        query["apt_type"] = apt_type
    if guests:
        query["max_guests"] = {"$gte": guests}
    if stay_path:
        query["stay_paths"] = stay_path
    if featured is not None:
        query["is_featured"] = featured
    price_q = {}
    if min_price is not None:
        price_q["$gte"] = min_price
    if max_price is not None:
        price_q["$lte"] = max_price
    if price_q:
        query["nightly_rate"] = price_q
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"neighborhood": {"$regex": search, "$options": "i"}},
            {"building_name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    sort_map = {
        "price_asc": ("nightly_rate", 1),
        "price_desc": ("nightly_rate", -1),
        "rating": ("rating", -1),
        "newest": ("created_at", -1),
    }
    cursor = db.apartments.find(query, {"_id": 0})
    if sort in sort_map:
        cursor = cursor.sort([sort_map[sort]])
    apartments = await cursor.to_list(200)
    return apartments

@api_router.get("/apartments/{apartment_id}")
async def get_apartment(apartment_id: str):
    apt = await db.apartments.find_one({"id": apartment_id}, {"_id": 0})
    if not apt:
        raise HTTPException(status_code=404, detail="Apartment not found")
    return apt

@api_router.get("/neighborhoods")
async def get_neighborhoods():
    pipeline = [
        {"$group": {"_id": "$neighborhood", "count": {"$sum": 1}, "image": {"$first": {"$arrayElemAt": ["$images", 0]}}, "min_rate": {"$min": "$nightly_rate"}}},
        {"$sort": {"count": -1}},
    ]
    rows = await db.apartments.aggregate(pipeline).to_list(50)
    return [{"name": r["_id"], "count": r["count"], "image": r["image"], "min_rate": r["min_rate"]} for r in rows]

# --- Bookings (Request to Book) ---
@api_router.post("/bookings")
async def create_booking(booking_data: BookingCreate, user: dict = Depends(get_current_user)):
    apt = await db.apartments.find_one({"id": booking_data.apartment_id}, {"_id": 0})
    if not apt:
        raise HTTPException(status_code=404, detail="Apartment not found")
    try:
        ci = date.fromisoformat(booking_data.check_in)
        co = date.fromisoformat(booking_data.check_out)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid dates. Use YYYY-MM-DD")
    nights = (co - ci).days
    if nights < 1:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")
    if nights < apt.get("min_nights", 1):
        raise HTTPException(status_code=400, detail=f"Minimum stay is {apt.get('min_nights', 1)} nights")
    if booking_data.guests > apt.get("max_guests", 1):
        raise HTTPException(status_code=400, detail=f"Maximum {apt.get('max_guests', 1)} guests for this apartment")
    # Date blocking: reject overlap with existing pending/confirmed bookings
    conflict = await db.bookings.find_one({
        "apartment_id": apt["id"],
        "status": {"$in": ["pending", "confirmed"]},
        "check_in": {"$lt": booking_data.check_out},
        "check_out": {"$gt": booking_data.check_in},
    })
    if conflict:
        raise HTTPException(status_code=409, detail="Those dates are no longer available for this apartment")
    # Monthly pro-rated pricing for stays of 28+ nights
    if nights >= 28:
        total = round(apt["monthly_rate"] / 30 * nights, 2)
    else:
        total = round(apt["nightly_rate"] * nights, 2)
    booking = Booking(
        user_id=user["id"],
        user_name=user.get("name", ""),
        user_email=user.get("email", ""),
        apartment_id=apt["id"],
        apartment_title=apt["title"],
        apartment_image=apt["images"][0] if apt.get("images") else "",
        neighborhood=apt.get("neighborhood", ""),
        check_in=booking_data.check_in,
        check_out=booking_data.check_out,
        nights=nights,
        guests=booking_data.guests,
        purpose=booking_data.purpose,
        notes=booking_data.notes,
        status="pending",
        total_price=total,
    )
    doc = booking.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.bookings.insert_one(dict(doc))
    await send_email(
        user.get("email", ""), user.get("name", ""),
        f"Stay request received \u2014 {apt['title']}",
        f"Hi {user.get('name', '').split(' ')[0]},\n\nWe received your stay request for {apt['title']} in {apt.get('neighborhood', '')} from {booking_data.check_in} to {booking_data.check_out} ({nights} nights, {booking_data.guests} guests). Estimated total: ${total:,.2f}.\n\nOur team will confirm availability within hours.\n\n\u2014 Express Housing",
        booking.id,
    )
    return doc

@api_router.get("/apartments/{apartment_id}/unavailable")
async def get_unavailable_dates(apartment_id: str):
    bookings = await db.bookings.find(
        {"apartment_id": apartment_id, "status": {"$in": ["pending", "confirmed"]}},
        {"_id": 0, "check_in": 1, "check_out": 1},
    ).to_list(200)
    return bookings

@api_router.get("/bookings")
async def get_bookings(user: dict = Depends(get_current_user)):
    bookings = await db.bookings.find({"user_id": user["id"]}, {"_id": 0}).sort([("created_at", -1)]).to_list(100)
    return bookings

@api_router.get("/bookings/{booking_id}")
async def get_booking(booking_id: str, user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"id": booking_id, "user_id": user["id"]}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

# --- Wishlist ---
@api_router.get("/wishlist")
async def get_wishlist(user: dict = Depends(get_current_user)):
    items = await db.wishlist.find({"user_id": user["id"]}, {"_id": 0}).to_list(200)
    apt_ids = [i["apartment_id"] for i in items]
    apartments = await db.apartments.find({"id": {"$in": apt_ids}}, {"_id": 0}).to_list(200)
    return apartments

@api_router.post("/wishlist/{apartment_id}")
async def toggle_wishlist(apartment_id: str, user: dict = Depends(get_current_user)):
    existing = await db.wishlist.find_one({"user_id": user["id"], "apartment_id": apartment_id})
    if existing:
        await db.wishlist.delete_one({"user_id": user["id"], "apartment_id": apartment_id})
        return {"saved": False}
    await db.wishlist.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "apartment_id": apartment_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"saved": True}

@api_router.get("/wishlist/ids")
async def get_wishlist_ids(user: dict = Depends(get_current_user)):
    items = await db.wishlist.find({"user_id": user["id"]}, {"_id": 0, "apartment_id": 1}).to_list(200)
    return [i["apartment_id"] for i in items]

# --- Admin ---
class StatusUpdate(BaseModel):
    status: str  # confirmed, cancelled, completed

@api_router.get("/admin/stats")
async def admin_stats(admin: dict = Depends(require_admin)):
    pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}, "revenue": {"$sum": "$total_price"}}}]
    rows = await db.bookings.aggregate(pipeline).to_list(20)
    stats = {"pending": 0, "confirmed": 0, "completed": 0, "cancelled": 0, "revenue": 0}
    for r in rows:
        stats[r["_id"]] = r["count"]
        if r["_id"] in ("confirmed", "completed"):
            stats["revenue"] += r["revenue"]
    stats["total"] = sum(stats[k] for k in ("pending", "confirmed", "completed", "cancelled"))
    stats["apartments"] = await db.apartments.count_documents({})
    return stats

@api_router.get("/admin/bookings")
async def admin_bookings(status: Optional[str] = None, admin: dict = Depends(require_admin)):
    query = {"status": status} if status else {}
    bookings = await db.bookings.find(query, {"_id": 0}).sort([("created_at", -1)]).to_list(500)
    return bookings

@api_router.patch("/admin/bookings/{booking_id}")
async def admin_update_booking(booking_id: str, update: StatusUpdate, admin: dict = Depends(require_admin)):
    if update.status not in ("confirmed", "cancelled", "completed"):
        raise HTTPException(status_code=400, detail="Invalid status")
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": update.status}})
    booking["status"] = update.status
    first = (booking.get("user_name") or "Guest").split(" ")[0]
    if update.status == "confirmed":
        subject = f"Your stay is confirmed \u2014 {booking['apartment_title']}"
        body = f"Hi {first},\n\nGreat news \u2014 your stay at {booking['apartment_title']} ({booking['neighborhood']}) from {booking['check_in']} to {booking['check_out']} is CONFIRMED.\n\nTotal: ${booking['total_price']:,.2f}. Keypad check-in details arrive 48 hours before arrival.\n\nWelcome to Express Housing!"
    elif update.status == "cancelled":
        subject = f"Update on your stay request \u2014 {booking['apartment_title']}"
        body = f"Hi {first},\n\nUnfortunately we couldn't accommodate your stay at {booking['apartment_title']} from {booking['check_in']} to {booking['check_out']}. Those dates are unavailable.\n\nReply to this email and our team will find you a comparable home.\n\n\u2014 Express Housing"
    else:
        subject = f"Thanks for staying with us \u2014 {booking['apartment_title']}"
        body = f"Hi {first},\n\nYour stay at {booking['apartment_title']} is complete. We'd love to host you again \u2014 returning guests get priority on new listings.\n\n\u2014 Express Housing"
    await send_email(booking.get("user_email", ""), booking.get("user_name", ""), subject, body, booking_id)
    return booking

@api_router.get("/admin/emails")
async def admin_emails(admin: dict = Depends(require_admin)):
    emails = await db.email_log.find({}, {"_id": 0}).sort([("created_at", -1)]).to_list(200)
    return emails

# --- Contact ---
@api_router.post("/contact")
async def submit_contact(contact_data: ContactCreate):
    doc = contact_data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contact_messages.insert_one(dict(doc))
    return {"success": True, "message": "Thanks for reaching out. Our team will reply within 24 hours."}

# ===== SEED DATA =====
# Image pools (curated via vision expert)
LR = [
    "https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "https://images.unsplash.com/photo-1658218635253-64728f6234be?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "https://images.unsplash.com/photo-1564078516393-cf04bd966897?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "https://images.pexels.com/photos/6492391/pexels-photo-6492391.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6636314/pexels-photo-6636314.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
]
BR = [
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "https://images.pexels.com/photos/34574606/pexels-photo-34574606.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
]
KT = [
    "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "https://images.unsplash.com/photo-1617228069096-4638a7ffc906?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
]
HERO = [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
    "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
    "https://images.unsplash.com/photo-1686056040370-b5e5c06c4273?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
]

AMEN_CORE = ["Fully furnished", "Gigabit Wi-Fi", "Fully-equipped kitchen", "Keypad self check-in", "4K Smart TV", "In-unit washer & dryer"]

def _rev(name, rating, comment, purpose, date_str):
    return {"id": str(uuid.uuid4()), "user_name": name, "rating": rating, "comment": comment, "purpose": purpose, "date": date_str}

SEED_APARTMENTS = [
    {
        "title": "The Franklin Residences 1BR", "building_name": "The Franklin", "neighborhood": "Old City",
        "address": "834 Chestnut St", "apt_type": "1 Bedroom", "bedrooms": 1, "bathrooms": 1, "max_guests": 2, "sqft": 720,
        "nightly_rate": 159, "monthly_rate": 3400,
        "description": "A polished one-bedroom in the heart of Old City, steps from Independence Hall. Dedicated workspace, gigabit Wi-Fi, and a building gym make this a favorite for business travelers who want history outside their door.",
        "amenities": AMEN_CORE + ["Dedicated workspace", "24-hour fitness center", "Elevator"],
        "images": [LR[0], BR[0], KT[0], LR[3]], "stay_paths": ["corporate"], "rating": 4.9, "review_count": 42,
        "is_featured": True, "min_nights": 2,
        "reviews": [
            _rev("Marcus T.", 5, "Check-in was seamless and the workspace setup saved my week. Better than any hotel.", "Business", "May 2025"),
            _rev("Elena R.", 5, "Beautiful apartment, walkable to everything in Old City.", "Leisure", "April 2025"),
        ],
    },
    {
        "title": "Rittenhouse Square Luxe 2BR", "building_name": "The Rittenhouse Collection", "neighborhood": "Rittenhouse Square",
        "address": "1900 Walnut St", "apt_type": "2 Bedroom", "bedrooms": 2, "bathrooms": 2, "max_guests": 4, "sqft": 1100,
        "nightly_rate": 249, "monthly_rate": 5200,
        "description": "Designer two-bedroom overlooking Rittenhouse Square with a chef's kitchen, marble baths, and a resident lounge. Ideal for relocations and executive stays that need room to breathe.",
        "amenities": AMEN_CORE + ["Doorman", "24-hour fitness center", "Rooftop terrace", "Dedicated workspace"],
        "images": [LR[3], BR[1], KT[1], LR[1]], "stay_paths": ["corporate", "family"], "rating": 4.9, "review_count": 57,
        "is_featured": True, "min_nights": 3,
        "reviews": [
            _rev("Priya S.", 5, "Our family of four stayed 6 weeks during a relocation. Felt like home from day one.", "Relocation", "June 2025"),
            _rev("David K.", 5, "The square outside your window every morning. Unbeatable.", "Business", "May 2025"),
        ],
    },
    {
        "title": "Center City Skyline Studio", "building_name": "One Liberty Place Residences", "neighborhood": "Center City",
        "address": "1650 Market St", "apt_type": "Studio", "bedrooms": 0, "bathrooms": 1, "max_guests": 2, "sqft": 520,
        "nightly_rate": 119, "monthly_rate": 2600,
        "description": "A bright studio with floor-to-ceiling skyline views in the middle of Center City. Smart layout with a real workspace and a queen bed — everything a solo traveler needs.",
        "amenities": AMEN_CORE + ["Dedicated workspace", "Elevator", "24-hour fitness center"],
        "images": [LR[1], BR[2], KT[2]], "stay_paths": ["corporate", "medical"], "rating": 4.7, "review_count": 31,
        "min_nights": 2,
        "reviews": [_rev("Jordan M.", 5, "Perfect for my 3-week hospital rotation. Quiet, clean, great Wi-Fi.", "Medical", "March 2025")],
    },
    {
        "title": "Fishtown Artist Loft 1BR", "building_name": "The Frankford Lofts", "neighborhood": "Fishtown",
        "address": "1401 Frankford Ave", "apt_type": "1 Bedroom", "bedrooms": 1, "bathrooms": 1, "max_guests": 3, "sqft": 850,
        "nightly_rate": 139, "monthly_rate": 2900,
        "description": "Exposed brick, 14-foot ceilings, and Fishtown's best coffee downstairs. A creative loft minutes from the El, made for longer stays that should not feel corporate.",
        "amenities": AMEN_CORE + ["Pet friendly", "Rooftop terrace"],
        "images": [LR[2], BR[3], KT[3], LR[6]], "stay_paths": ["family"], "rating": 4.8, "review_count": 26,
        "is_new": True, "min_nights": 2,
        "reviews": [_rev("Sofia L.", 5, "The loft is stunning and the neighborhood is so alive. Extended twice!", "Leisure", "June 2025")],
    },
    {
        "title": "University City Med Stay 1BR", "building_name": "The Radian", "neighborhood": "University City",
        "address": "3925 Walnut St", "apt_type": "1 Bedroom", "bedrooms": 1, "bathrooms": 1, "max_guests": 2, "sqft": 680,
        "nightly_rate": 129, "monthly_rate": 2750,
        "description": "Five minutes from Penn Medicine and CHOP. Comfortable, quiet one-bedroom built for medical travelers, visiting clinicians, and families who need to be close to care.",
        "amenities": AMEN_CORE + ["Free parking", "Elevator", "24/7 guest support"],
        "images": [LR[4], BR[0], KT[0]], "stay_paths": ["medical"], "rating": 4.9, "review_count": 48,
        "is_featured": True, "min_nights": 2,
        "reviews": [
            _rev("Anne W.", 5, "We stayed 2 months during my husband's treatment. The team checked in on us constantly. Grateful.", "Medical", "April 2025"),
            _rev("Dr. Chen", 5, "Booked for a visiting fellowship. Walkable to the hospital, spotless unit.", "Medical", "February 2025"),
        ],
    },
    {
        "title": "Northern Liberties Penthouse", "building_name": "The Piazza Alta", "neighborhood": "Northern Liberties",
        "address": "1001 N 2nd St", "apt_type": "Penthouse", "bedrooms": 3, "bathrooms": 2, "max_guests": 6, "sqft": 1600,
        "nightly_rate": 389, "monthly_rate": 7900,
        "description": "A three-bedroom penthouse with a private terrace over the Piazza. Pool, gym, and dining downstairs. The flagship Express Housing stay for teams and families.",
        "amenities": AMEN_CORE + ["Pool", "Rooftop terrace", "24-hour fitness center", "Free parking", "Doorman"],
        "images": [HERO[1], LR[5], BR[1], KT[1]], "stay_paths": ["corporate", "family"], "rating": 5.0, "review_count": 19,
        "is_featured": True, "min_nights": 3,
        "reviews": [_rev("The Grants", 5, "Hosted our whole family for a month. Terrace dinners every night.", "Family", "May 2025")],
    },
    {
        "title": "Society Hill Classic 2BR", "building_name": "Society Hill Towers", "neighborhood": "Society Hill",
        "address": "200 Locust St", "apt_type": "2 Bedroom", "bedrooms": 2, "bathrooms": 1, "max_guests": 4, "sqft": 980,
        "nightly_rate": 199, "monthly_rate": 4300,
        "description": "Cobblestone streets and river views. A classic two-bedroom in one of Philadelphia's most storied neighborhoods, refreshed with modern furnishings throughout.",
        "amenities": AMEN_CORE + ["Elevator", "24-hour fitness center", "Doorman"],
        "images": [LR[5], BR[2], KT[2], LR[0]], "stay_paths": ["family", "corporate"], "rating": 4.8, "review_count": 34,
        "min_nights": 2,
        "reviews": [_rev("Hannah B.", 5, "Waking up near the waterfront was the highlight of our relocation.", "Relocation", "March 2025")],
    },
    {
        "title": "Logan Square Executive 1BR", "building_name": "The Alexander", "neighborhood": "Logan Square",
        "address": "1601 Vine St", "apt_type": "1 Bedroom", "bedrooms": 1, "bathrooms": 1, "max_guests": 2, "sqft": 750,
        "nightly_rate": 169, "monthly_rate": 3600,
        "description": "Steps from the Comcast towers and the Parkway museums. An executive one-bedroom with in-building workspace and a serious gym — built for the business week and the weekend after.",
        "amenities": AMEN_CORE + ["Dedicated workspace", "In-building workspace", "24-hour fitness center", "Doorman"],
        "images": [LR[6], BR[3], KT[3]], "stay_paths": ["corporate"], "rating": 4.8, "review_count": 29,
        "min_nights": 2,
        "reviews": [_rev("Tom H.", 5, "My company books this unit every quarter now. Consistent, professional, easy.", "Business", "June 2025")],
    },
    {
        "title": "Manayunk Riverside 2BR", "building_name": "The Isle", "neighborhood": "Manayunk",
        "address": "4601 Flat Rock Rd", "apt_type": "2 Bedroom", "bedrooms": 2, "bathrooms": 2, "max_guests": 5, "sqft": 1050,
        "nightly_rate": 179, "monthly_rate": 3800,
        "description": "Riverside two-bedroom along the towpath with Main Street's restaurants a short stroll away. Free parking and space to spread out make this a family favorite.",
        "amenities": AMEN_CORE + ["Free parking", "Pool", "Pet friendly"],
        "images": [LR[7], BR[0], KT[1], LR[2]], "stay_paths": ["family"], "rating": 4.7, "review_count": 22,
        "is_new": True, "min_nights": 2,
        "reviews": [_rev("The Nguyens", 5, "Kids loved the pool, we loved the towpath runs. Perfect month.", "Family", "May 2025")],
    },
    {
        "title": "Graduate Hospital Family 3BR", "building_name": "The Southwark", "neighborhood": "Graduate Hospital",
        "address": "2001 South St", "apt_type": "3 Bedroom", "bedrooms": 3, "bathrooms": 2, "max_guests": 6, "sqft": 1400,
        "nightly_rate": 289, "monthly_rate": 6100,
        "description": "A rare three-bedroom with a real dining table for eight, a washer-dryer, and three quiet bedrooms. Built for family recovery stays, renovations, and long visits.",
        "amenities": AMEN_CORE + ["Free parking", "Elevator", "24/7 guest support"],
        "images": [LR[3], BR[1], KT[0], LR[4]], "stay_paths": ["family", "medical"], "rating": 4.9, "review_count": 27,
        "min_nights": 3,
        "reviews": [_rev("Renee C.", 5, "Three real bedrooms saved us during our home renovation. Flexible checkout too.", "Family", "April 2025")],
    },
    {
        "title": "Old City Boutique Studio", "building_name": "The Bank Building", "neighborhood": "Old City",
        "address": "421 Chestnut St", "apt_type": "Studio", "bedrooms": 0, "bathrooms": 1, "max_guests": 2, "sqft": 480,
        "nightly_rate": 109, "monthly_rate": 2400,
        "description": "A thoughtfully designed studio inside a converted 19th-century bank. Original details, brand-new everything else. The best value stay in Old City.",
        "amenities": AMEN_CORE + ["Elevator"],
        "images": [LR[4], BR[2], KT[3]], "stay_paths": ["corporate", "medical"], "rating": 4.8, "review_count": 38,
        "is_new": True, "min_nights": 2,
        "reviews": [_rev("Isabelle F.", 5, "Gorgeous building, unbeatable location, fair price. Will return.", "Leisure", "June 2025")],
    },
    {
        "title": "Center City Corporate 2BR", "building_name": "The Metropolitan", "neighborhood": "Center City",
        "address": "117 N 15th St", "apt_type": "2 Bedroom", "bedrooms": 2, "bathrooms": 2, "max_guests": 4, "sqft": 1150,
        "nightly_rate": 269, "monthly_rate": 5600,
        "description": "Two bedrooms, two workspaces, one block from City Hall. Our most-booked corporate unit, with a conference-ready dining table and blackout shades for jet-lagged mornings.",
        "amenities": AMEN_CORE + ["Dedicated workspace", "In-building workspace", "Doorman", "24-hour fitness center"],
        "images": [HERO[0], BR[3], KT[2], LR[7]], "stay_paths": ["corporate"], "rating": 4.9, "review_count": 51,
        "is_featured": True, "min_nights": 3,
        "reviews": [
            _rev("Sarah J.", 5, "Our consultants rotate through this unit monthly. Zero complaints ever.", "Business", "June 2025"),
            _rev("Ahmed Z.", 5, "International relocation made painless. The team even stocked the fridge.", "Relocation", "May 2025"),
        ],
    },
]

async def seed_apartments():
    # Room label mapping for photo tours
    room_map = {}
    for u in LR:
        room_map[u] = "Living Room"
    for u in BR:
        room_map[u] = "Bedroom"
    for u in KT:
        room_map[u] = "Kitchen"
    for u in HERO:
        room_map[u] = "Living Space"
    await db.apartments.delete_many({})
    docs = []
    for a in SEED_APARTMENTS:
        apt = Apartment(**a)
        d = apt.model_dump()
        # Deterministic id so re-seeding preserves bookings/wishlist references
        d["id"] = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"expresshousing:{a['title']}"))
        d["photo_tour"] = [{"url": img, "room": room_map.get(img, "Interior")} for img in d["images"]]
        d["created_at"] = d["created_at"].isoformat()
        docs.append(d)
    await db.apartments.insert_many(docs)
    return len(docs)

async def seed_admin():
    existing = await db.users.find_one({"email": "admin@expresshousing.com"})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": "admin@expresshousing.com",
            "name": "Express Admin",
            "role": "admin",
            "phone": None,
            "password_hash": hash_password("admin2025"),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user admin@expresshousing.com")

@api_router.post("/seed")
async def seed_data():
    count = await seed_apartments()
    await seed_admin()
    return {"success": True, "apartments_seeded": count}

@app.on_event("startup")
async def startup_seed():
    await seed_admin()
    sample = await db.apartments.find_one({})
    # Re-seed if empty or missing photo_tour (schema upgrade)
    if not sample or "photo_tour" not in sample:
        count = await seed_apartments()
        logger.info(f"Seeded {count} apartments on startup")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
