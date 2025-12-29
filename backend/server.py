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
from datetime import datetime, timezone
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
JWT_SECRET = os.environ.get('JWT_SECRET', 'homehealthcare2024secretkey')
JWT_ALGORITHM = 'HS256'

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
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
    role: str = "client"  # client or agency
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class AgencyBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    bio: str
    location: str
    city: str
    experience_years: int
    certifications: List[str] = []
    specialties: List[str] = []
    price_per_hour: float
    rating: float = 4.5
    review_count: int = 0
    image_url: str
    is_verified: bool = False
    is_new: bool = False

class Agency(AgencyBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ServiceBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    description: str
    duration_hours: int = 1
    price: float

class Service(ServiceBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    agency_id: str

class BookingCreate(BaseModel):
    agency_id: str
    service_type: str
    date: str
    time_slot: str
    notes: Optional[str] = None
    patient_name: str
    patient_age: Optional[int] = None
    care_needs: Optional[str] = None

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    agency_id: str
    service_type: str
    date: str
    time_slot: str
    notes: Optional[str] = None
    patient_name: str
    patient_age: Optional[int] = None
    care_needs: Optional[str] = None
    status: str = "pending"  # pending, confirmed, completed, cancelled
    total_price: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    agency_id: str
    rating: int
    comment: str

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    agency_id: str
    rating: int
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    subject: str
    message: str
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
        'exp': datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
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

# ===== ROUTES =====
@api_router.get("/")
async def root():
    return {"message": "NurseNow - In-Home Care Marketplace API"}

# Auth Routes
@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "role": user_data.role,
        "phone": user_data.phone,
        "password": hash_password(user_data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email)
    user_response = {k: v for k, v in user_doc.items() if k not in ['password', '_id']}
    return {"access_token": token, "token_type": "bearer", "user": user_response}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'])
    user_response = {k: v for k, v in user.items() if k not in ['password', '_id']}
    return {"access_token": token, "token_type": "bearer", "user": user_response}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {k: v for k, v in user.items() if k != 'password'}

# Agency Routes
@api_router.get("/agencies")
async def get_agencies(city: Optional[str] = None, specialty: Optional[str] = None):
    query = {}
    if city:
        query["city"] = city
    if specialty:
        query["specialties"] = {"$in": [specialty]}
    
    agencies = await db.agencies.find(query, {"_id": 0}).to_list(100)
    return agencies

@api_router.get("/agencies/{agency_id}")
async def get_agency(agency_id: str):
    agency = await db.agencies.find_one({"id": agency_id}, {"_id": 0})
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")
    
    # Get reviews for this agency
    reviews = await db.reviews.find({"agency_id": agency_id}, {"_id": 0}).to_list(100)
    agency["reviews"] = reviews
    
    # Get services
    services = await db.services.find({"agency_id": agency_id}, {"_id": 0}).to_list(20)
    agency["services"] = services
    
    return agency

@api_router.post("/agencies")
async def create_agency(agency_data: AgencyBase, user: dict = Depends(get_current_user)):
    if user.get('role') != 'agency':
        raise HTTPException(status_code=403, detail="Only agency accounts can create profiles")
    
    agency_id = str(uuid.uuid4())
    agency_doc = {
        "id": agency_id,
        "user_id": user['id'],
        **agency_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.agencies.insert_one(agency_doc)
    return {"id": agency_id, **agency_doc}

# Booking Routes
@api_router.post("/bookings")
async def create_booking(booking_data: BookingCreate, user: dict = Depends(get_current_user)):
    agency = await db.agencies.find_one({"id": booking_data.agency_id}, {"_id": 0})
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")
    
    booking_id = str(uuid.uuid4())
    booking_doc = {
        "id": booking_id,
        "user_id": user['id'],
        "agency_id": booking_data.agency_id,
        "service_type": booking_data.service_type,
        "date": booking_data.date,
        "time_slot": booking_data.time_slot,
        "notes": booking_data.notes,
        "patient_name": booking_data.patient_name,
        "patient_age": booking_data.patient_age,
        "care_needs": booking_data.care_needs,
        "total_price": agency.get('price_per_hour', 50),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.bookings.insert_one(booking_doc)
    # Return without _id
    return {k: v for k, v in booking_doc.items() if k != '_id'}

@api_router.get("/bookings")
async def get_bookings(user: dict = Depends(get_current_user)):
    bookings = await db.bookings.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    
    # Enrich with agency info
    for booking in bookings:
        agency = await db.agencies.find_one({"id": booking.get('agency_id')}, {"_id": 0})
        if agency:
            booking['agency'] = agency
    
    return bookings

@api_router.get("/bookings/{booking_id}")
async def get_booking(booking_id: str, user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"id": booking_id, "user_id": user['id']}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

# Review Routes
@api_router.post("/reviews")
async def create_review(review_data: ReviewCreate, user: dict = Depends(get_current_user)):
    agency = await db.agencies.find_one({"id": review_data.agency_id})
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")
    
    review_id = str(uuid.uuid4())
    review_doc = {
        "id": review_id,
        "user_id": user['id'],
        "user_name": user.get('name', 'Anonymous'),
        **review_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reviews.insert_one(review_doc)
    
    # Update agency rating
    all_reviews = await db.reviews.find({"agency_id": review_data.agency_id}).to_list(1000)
    avg_rating = sum(r['rating'] for r in all_reviews) / len(all_reviews)
    await db.agencies.update_one(
        {"id": review_data.agency_id},
        {"$set": {"rating": round(avg_rating, 1), "review_count": len(all_reviews)}}
    )
    
    return review_doc

@api_router.get("/reviews/{agency_id}")
async def get_reviews(agency_id: str):
    reviews = await db.reviews.find({"agency_id": agency_id}, {"_id": 0}).to_list(100)
    return reviews

# Contact Routes
@api_router.post("/contact")
async def submit_contact(contact_data: ContactCreate):
    contact_id = str(uuid.uuid4())
    contact_doc = {
        "id": contact_id,
        **contact_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contact_messages.insert_one(contact_doc)
    return {"message": "Thank you for your message. We will get back to you soon!"}

@api_router.get("/contact/messages")
async def get_contact_messages(user: dict = Depends(get_current_user)):
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    messages = await db.contact_messages.find({}, {"_id": 0}).to_list(100)
    return messages

# Seed Data Route - Initialize agencies
@api_router.post("/seed")
async def seed_data():
    # Check if already seeded
    existing = await db.agencies.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded", "count": existing}
    
    agencies_data = [
        # Philadelphia, PA - 7 agencies
        {
            "id": str(uuid.uuid4()),
            "name": "Caring Hearts Home Care",
            "bio": "Providing compassionate in-home care services for over 15 years. Our certified caregivers specialize in elderly care, post-surgery recovery, and chronic condition management.",
            "location": "1234 Market Street, Philadelphia, PA 19107",
            "city": "Philadelphia, PA",
            "experience_years": 15,
            "certifications": ["State Licensed", "Medicare Certified", "ACHC Accredited"],
            "specialties": ["Elderly Care", "Post-Surgery Recovery", "Chronic Conditions"],
            "price_per_hour": 35,
            "rating": 4.9,
            "review_count": 124,
            "image_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Gentle Touch Nursing",
            "bio": "Specialized pediatric and infant care services. Our team includes registered nurses and certified nursing assistants dedicated to your child's health and comfort.",
            "location": "567 Walnut Street, Philadelphia, PA 19106",
            "city": "Philadelphia, PA",
            "experience_years": 12,
            "certifications": ["Pediatric Certified", "State Licensed", "CPR Certified"],
            "specialties": ["Pediatric Care", "Infant Care", "Special Needs"],
            "price_per_hour": 40,
            "rating": 4.8,
            "review_count": 89,
            "image_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Philadelphia Senior Services",
            "bio": "Dedicated to enhancing the quality of life for seniors. We offer companionship, daily living assistance, and specialized dementia care programs.",
            "location": "890 Chestnut Street, Philadelphia, PA 19107",
            "city": "Philadelphia, PA",
            "experience_years": 20,
            "certifications": ["Alzheimer's Certified", "State Licensed", "Bonded & Insured"],
            "specialties": ["Dementia Care", "Alzheimer's", "Companionship"],
            "price_per_hour": 32,
            "rating": 4.7,
            "review_count": 156,
            "image_url": "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "HomeWell Care Services",
            "bio": "Comprehensive home healthcare including skilled nursing, physical therapy, and personal care. Serving the greater Philadelphia area with excellence.",
            "location": "123 Broad Street, Philadelphia, PA 19102",
            "city": "Philadelphia, PA",
            "experience_years": 8,
            "certifications": ["Medicare Certified", "State Licensed", "Joint Commission Accredited"],
            "specialties": ["Skilled Nursing", "Physical Therapy", "Personal Care"],
            "price_per_hour": 38,
            "rating": 4.6,
            "review_count": 67,
            "image_url": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Nurturing Angels Care",
            "bio": "Specialized in overnight and 24-hour care services. Our angels provide round-the-clock support for patients requiring continuous monitoring.",
            "location": "456 Pine Street, Philadelphia, PA 19106",
            "city": "Philadelphia, PA",
            "experience_years": 10,
            "certifications": ["24/7 Care Certified", "State Licensed", "Background Checked"],
            "specialties": ["24-Hour Care", "Overnight Care", "Hospice Support"],
            "price_per_hour": 30,
            "rating": 4.8,
            "review_count": 98,
            "image_url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Liberty Home Health",
            "bio": "Wound care specialists and post-operative care experts. We help patients recover safely and comfortably in their own homes.",
            "location": "789 Spruce Street, Philadelphia, PA 19107",
            "city": "Philadelphia, PA",
            "experience_years": 14,
            "certifications": ["Wound Care Certified", "State Licensed", "OASIS Certified"],
            "specialties": ["Wound Care", "Post-Op Care", "IV Therapy"],
            "price_per_hour": 45,
            "rating": 4.9,
            "review_count": 112,
            "image_url": "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Keystone Care Partners",
            "bio": "Mental health and behavioral support specialists. We provide compassionate care for patients with psychiatric conditions and developmental disabilities.",
            "location": "321 Race Street, Philadelphia, PA 19106",
            "city": "Philadelphia, PA",
            "experience_years": 6,
            "certifications": ["Mental Health Certified", "State Licensed", "Behavioral Specialist"],
            "specialties": ["Mental Health", "Behavioral Support", "Developmental Care"],
            "price_per_hour": 42,
            "rating": 4.5,
            "review_count": 45,
            "image_url": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=500&fit=crop",
            "is_verified": False,
            "is_new": True
        },
        # Washington, D.C. - 6 agencies
        {
            "id": str(uuid.uuid4()),
            "name": "Capitol Care Services",
            "bio": "Premier in-home care in the nation's capital. Our caregivers are trained to provide exceptional service to distinguished clients.",
            "location": "1600 K Street NW, Washington, DC 20006",
            "city": "Washington, D.C.",
            "experience_years": 18,
            "certifications": ["State Licensed", "CHAP Accredited", "Bonded & Insured"],
            "specialties": ["Executive Care", "Elderly Care", "Concierge Services"],
            "price_per_hour": 50,
            "rating": 4.9,
            "review_count": 178,
            "image_url": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "DC Family Caregivers",
            "bio": "Family-centered care approach. We treat your loved ones like our own family, providing personalized attention and genuine compassion.",
            "location": "2000 M Street NW, Washington, DC 20036",
            "city": "Washington, D.C.",
            "experience_years": 11,
            "certifications": ["State Licensed", "Home Care Certified", "First Aid Trained"],
            "specialties": ["Family Care", "Respite Care", "Daily Living Assistance"],
            "price_per_hour": 38,
            "rating": 4.7,
            "review_count": 92,
            "image_url": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Georgetown Health Aides",
            "bio": "Serving the prestigious Georgetown community with top-tier caregiving services. Multilingual staff available.",
            "location": "3100 M Street NW, Washington, DC 20007",
            "city": "Washington, D.C.",
            "experience_years": 9,
            "certifications": ["Multilingual Certified", "State Licensed", "Cultural Sensitivity Trained"],
            "specialties": ["Multilingual Care", "Cultural Care", "Elderly Care"],
            "price_per_hour": 55,
            "rating": 4.8,
            "review_count": 67,
            "image_url": "https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Potomac Nursing Services",
            "bio": "Skilled nursing care delivered with compassion. Our registered nurses provide medical care in the comfort of your home.",
            "location": "1200 New Hampshire Ave NW, Washington, DC 20036",
            "city": "Washington, D.C.",
            "experience_years": 16,
            "certifications": ["RN Staffed", "State Licensed", "Medicare Certified"],
            "specialties": ["Skilled Nursing", "Medication Management", "Chronic Disease"],
            "price_per_hour": 48,
            "rating": 4.9,
            "review_count": 134,
            "image_url": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "National Mall Home Care",
            "bio": "Veteran-owned home care agency specializing in care for military families and veterans. Honoring those who served.",
            "location": "700 Independence Ave SW, Washington, DC 20024",
            "city": "Washington, D.C.",
            "experience_years": 7,
            "certifications": ["VA Certified", "State Licensed", "Veteran Owned"],
            "specialties": ["Veteran Care", "PTSD Support", "Military Families"],
            "price_per_hour": 35,
            "rating": 4.8,
            "review_count": 78,
            "image_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Embassy Row Caregivers",
            "bio": "Discreet, professional care for diplomats and international clients. Background-checked staff with security clearances.",
            "location": "2200 Massachusetts Ave NW, Washington, DC 20008",
            "city": "Washington, D.C.",
            "experience_years": 13,
            "certifications": ["Security Cleared", "State Licensed", "Confidentiality Certified"],
            "specialties": ["Diplomatic Care", "Privacy-Focused", "International Clients"],
            "price_per_hour": 65,
            "rating": 4.9,
            "review_count": 45,
            "image_url": "https://images.unsplash.com/photo-1590611936760-eeb9bc598548?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": True
        },
        # Pittsburgh, PA - 8 agencies
        {
            "id": str(uuid.uuid4()),
            "name": "Steel City Home Care",
            "bio": "Pittsburgh's most trusted home care provider. Strong as steel in our commitment to quality care.",
            "location": "100 Fifth Avenue, Pittsburgh, PA 15222",
            "city": "Pittsburgh, PA",
            "experience_years": 22,
            "certifications": ["State Licensed", "ACHC Accredited", "Community Award Winner"],
            "specialties": ["Elderly Care", "Rehabilitation", "Long-term Care"],
            "price_per_hour": 30,
            "rating": 4.8,
            "review_count": 201,
            "image_url": "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Three Rivers Nursing",
            "bio": "Connecting families with compassionate caregivers across the three rivers. Local roots, professional service.",
            "location": "200 Grant Street, Pittsburgh, PA 15219",
            "city": "Pittsburgh, PA",
            "experience_years": 15,
            "certifications": ["State Licensed", "Medicare Certified", "Local Business Award"],
            "specialties": ["Skilled Nursing", "Home Health Aide", "Therapy Services"],
            "price_per_hour": 33,
            "rating": 4.7,
            "review_count": 145,
            "image_url": "https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Oakland Family Care",
            "bio": "Serving the Oakland medical district and beyond. Close partnership with UPMC for coordinated care.",
            "location": "300 Halket Street, Pittsburgh, PA 15213",
            "city": "Pittsburgh, PA",
            "experience_years": 12,
            "certifications": ["UPMC Partner", "State Licensed", "Hospital Discharge Specialist"],
            "specialties": ["Post-Hospital Care", "Medical Coordination", "Recovery Support"],
            "price_per_hour": 35,
            "rating": 4.8,
            "review_count": 89,
            "image_url": "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Squirrel Hill Seniors",
            "bio": "Culturally sensitive care for diverse communities. Specialized in Kosher care and religious accommodations.",
            "location": "1801 Murray Avenue, Pittsburgh, PA 15217",
            "city": "Pittsburgh, PA",
            "experience_years": 19,
            "certifications": ["Cultural Competency Certified", "State Licensed", "Community Trust Award"],
            "specialties": ["Cultural Care", "Kosher Services", "Religious Accommodations"],
            "price_per_hour": 32,
            "rating": 4.9,
            "review_count": 167,
            "image_url": "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "South Hills Care Team",
            "bio": "Dedicated caregivers serving Pittsburgh's South Hills communities. Family-owned and operated since 2005.",
            "location": "1500 Washington Road, Pittsburgh, PA 15241",
            "city": "Pittsburgh, PA",
            "experience_years": 19,
            "certifications": ["Family Business Certified", "State Licensed", "BBB A+ Rated"],
            "specialties": ["Personal Care", "Companionship", "Transportation"],
            "price_per_hour": 28,
            "rating": 4.6,
            "review_count": 123,
            "image_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "North Shore Health Aides",
            "bio": "Quality care on Pittsburgh's vibrant North Shore. Flexible scheduling to meet your family's needs.",
            "location": "100 Art Rooney Avenue, Pittsburgh, PA 15212",
            "city": "Pittsburgh, PA",
            "experience_years": 8,
            "certifications": ["Flexible Care Certified", "State Licensed", "24/7 Availability"],
            "specialties": ["Flexible Scheduling", "Respite Care", "Weekend Care"],
            "price_per_hour": 29,
            "rating": 4.5,
            "review_count": 56,
            "image_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=500&fit=crop",
            "is_verified": False,
            "is_new": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Allegheny Valley Care",
            "bio": "Serving the entire Allegheny Valley with dedication. Our caregivers go the extra mile for your loved ones.",
            "location": "400 Freeport Road, Pittsburgh, PA 15215",
            "city": "Pittsburgh, PA",
            "experience_years": 11,
            "certifications": ["Valley Coverage", "State Licensed", "Extended Hours Available"],
            "specialties": ["Wide Coverage Area", "Rural Care", "Extended Hours"],
            "price_per_hour": 27,
            "rating": 4.7,
            "review_count": 78,
            "image_url": "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mt. Washington Wellness",
            "bio": "Elevating home care to new heights. Holistic approach combining physical, mental, and emotional well-being.",
            "location": "200 Grandview Avenue, Pittsburgh, PA 15211",
            "city": "Pittsburgh, PA",
            "experience_years": 6,
            "certifications": ["Holistic Care Certified", "State Licensed", "Wellness Focused"],
            "specialties": ["Holistic Care", "Wellness Programs", "Mind-Body Care"],
            "price_per_hour": 36,
            "rating": 4.6,
            "review_count": 42,
            "image_url": "https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=400&h=500&fit=crop",
            "is_verified": False,
            "is_new": True
        },
        # Newark, NJ - 6 agencies (budget-friendly)
        {
            "id": str(uuid.uuid4()),
            "name": "Garden State Home Care",
            "bio": "Affordable quality care in New Jersey. We believe everyone deserves excellent home healthcare.",
            "location": "1000 Broad Street, Newark, NJ 07102",
            "city": "Newark, NJ",
            "experience_years": 17,
            "certifications": ["State Licensed", "Affordable Care Champion", "Community Service Award"],
            "specialties": ["Affordable Care", "Medicaid Accepted", "Sliding Scale Fees"],
            "price_per_hour": 25,
            "rating": 4.7,
            "review_count": 189,
            "image_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Newark Community Nurses",
            "bio": "Community-focused nursing care. Our roots are in Newark, and we're committed to serving our neighbors.",
            "location": "200 Market Street, Newark, NJ 07102",
            "city": "Newark, NJ",
            "experience_years": 14,
            "certifications": ["Community Health Certified", "State Licensed", "Local Partnership Award"],
            "specialties": ["Community Health", "Preventive Care", "Health Education"],
            "price_per_hour": 28,
            "rating": 4.6,
            "review_count": 134,
            "image_url": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Ironbound Caregivers",
            "bio": "Bilingual care services in Newark's vibrant Ironbound district. Portuguese and Spanish speaking staff.",
            "location": "300 Ferry Street, Newark, NJ 07105",
            "city": "Newark, NJ",
            "experience_years": 10,
            "certifications": ["Bilingual Certified", "State Licensed", "Cultural Care Expert"],
            "specialties": ["Bilingual Care", "Portuguese/Spanish", "Cultural Sensitivity"],
            "price_per_hour": 26,
            "rating": 4.8,
            "review_count": 98,
            "image_url": "https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Essex County Home Health",
            "bio": "County-wide coverage with local expertise. We know Essex County and we know home care.",
            "location": "500 Central Avenue, Newark, NJ 07107",
            "city": "Newark, NJ",
            "experience_years": 21,
            "certifications": ["County Wide Service", "State Licensed", "Long-term Care Expert"],
            "specialties": ["County Coverage", "Long-term Care", "Insurance Coordination"],
            "price_per_hour": 27,
            "rating": 4.7,
            "review_count": 156,
            "image_url": "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "University Heights Care",
            "bio": "Serving the university community with student-friendly and senior care. Flexible, affordable options.",
            "location": "150 University Avenue, Newark, NJ 07102",
            "city": "Newark, NJ",
            "experience_years": 5,
            "certifications": ["Student-Friendly", "State Licensed", "Flexible Payment Plans"],
            "specialties": ["Student Care", "Senior Care", "Flexible Payments"],
            "price_per_hour": 24,
            "rating": 4.5,
            "review_count": 45,
            "image_url": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=500&fit=crop",
            "is_verified": False,
            "is_new": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Branch Brook Health Services",
            "bio": "Named after Newark's beautiful park, we bring natural healing and comfort to your home.",
            "location": "800 Lake Street, Newark, NJ 07104",
            "city": "Newark, NJ",
            "experience_years": 9,
            "certifications": ["Natural Care Approach", "State Licensed", "Green Certified"],
            "specialties": ["Natural Healing", "Comfort Care", "Eco-Friendly Practices"],
            "price_per_hour": 29,
            "rating": 4.6,
            "review_count": 67,
            "image_url": "https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?w=400&h=500&fit=crop",
            "is_verified": True,
            "is_new": True
        }
    ]
    
    for agency in agencies_data:
        agency["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.agencies.insert_many(agencies_data)
    return {"message": "Data seeded successfully", "count": len(agencies_data)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
