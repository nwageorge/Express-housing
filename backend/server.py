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

class AgencyReview(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_name: str
    rating: int
    comment: str
    date: str
    care_type: str  # e.g., "Elderly Care", "Post-Surgery"
    relationship: str  # e.g., "Daughter", "Son", "Spouse"

class AgencyBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    bio: str
    description: str = ""  # Longer description for detail page
    location: str
    city: str
    experience_years: int
    certifications: List[str] = []
    specialties: List[str] = []
    price_per_hour: float
    rating: float = 4.5
    review_count: int = 0
    image_url: str  # Main/primary image
    gallery_images: List[str] = []  # Multiple images: office, caregivers, care scenes
    is_verified: bool = False
    is_new: bool = False
    total_caregivers: int = 10
    years_in_business: int = 5
    families_served: int = 100
    reviews: List[dict] = []  # Embedded reviews from families

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
    
    # Reviews are now embedded in the agency document
    # No need to fetch from a separate collection
    return agency
    
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

# Seed Data Route - Initialize agencies with enhanced data
@api_router.post("/seed")
async def seed_data():
    # Check if already seeded
    existing = await db.agencies.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded", "count": existing}
    
    # Helper function to generate reviews for agencies
    def generate_reviews(agency_specialties):
        review_templates = [
            {"user_name": "Sarah M.", "rating": 5, "comment": "The caregivers from this agency have been absolutely wonderful with my mother. They treat her with dignity and respect, and she looks forward to their visits.", "relationship": "Daughter", "care_type": "Elderly Care"},
            {"user_name": "Michael T.", "rating": 5, "comment": "After my father's hip surgery, their team was there every step of the way. Professional, punctual, and genuinely caring.", "relationship": "Son", "care_type": "Post-Surgery"},
            {"user_name": "Jennifer K.", "rating": 4, "comment": "Great communication and flexible scheduling. The caregiver assigned to us became like family.", "relationship": "Daughter", "care_type": "Companionship"},
            {"user_name": "Robert & Linda P.", "rating": 5, "comment": "We interviewed several agencies before choosing this one. Best decision we made. Mom is thriving!", "relationship": "Family", "care_type": "Elderly Care"},
            {"user_name": "David W.", "rating": 5, "comment": "The overnight care for my wife has been exceptional. I can finally get some rest knowing she's in good hands.", "relationship": "Spouse", "care_type": "24-Hour Care"},
            {"user_name": "Patricia H.", "rating": 4, "comment": "Very responsive to our changing needs. When Dad's condition changed, they adjusted the care plan immediately.", "relationship": "Daughter", "care_type": "Chronic Conditions"},
            {"user_name": "James L.", "rating": 5, "comment": "The dementia care specialists here truly understand the challenges. They've made such a difference for our family.", "relationship": "Son", "care_type": "Dementia Care"},
            {"user_name": "Elizabeth R.", "rating": 5, "comment": "Compassionate, skilled, and reliable. Everything you want in a home care agency.", "relationship": "Granddaughter", "care_type": "Elderly Care"},
        ]
        import random
        num_reviews = random.randint(4, 6)
        selected = random.sample(review_templates, num_reviews)
        for i, review in enumerate(selected):
            review["id"] = str(uuid.uuid4())
            review["date"] = f"202{random.randint(3,4)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
        return selected
    
    agencies_data = [
        # Philadelphia, PA - 7 agencies
        {
            "id": str(uuid.uuid4()),
            "name": "Caring Hearts Home Care",
            "bio": "Award-winning in-home care agency serving Philadelphia families since 2009.",
            "description": "Caring Hearts Home Care has been a trusted partner for Philadelphia families for over 15 years. Our team of certified caregivers provides personalized, compassionate care that allows your loved ones to maintain their independence and dignity in the comfort of their own home. We specialize in elderly care, post-surgery recovery, and chronic condition management. Every caregiver undergoes rigorous background checks, ongoing training, and is matched carefully to each client's unique needs and personality.",
            "location": "1234 Market Street, Philadelphia, PA 19107",
            "city": "Philadelphia, PA",
            "experience_years": 15,
            "certifications": ["State Licensed", "Medicare Certified", "ACHC Accredited", "BBB A+ Rating"],
            "specialties": ["Elderly Care", "Post-Surgery Recovery", "Chronic Conditions", "Companionship"],
            "price_per_hour": 16,
            "rating": 4.9,
            "review_count": 124,
            "image_url": "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551622/pexels-photo-7551622.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551668/pexels-photo-7551668.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 45,
            "years_in_business": 15,
            "families_served": 1200,
            "reviews": generate_reviews(["Elderly Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Gentle Touch Nursing",
            "bio": "Specialized pediatric and family care services with registered nurses.",
            "description": "Gentle Touch Nursing brings hospital-quality care into your home. Our team includes registered nurses and certified nursing assistants dedicated to providing the highest standard of care for children and adults alike. We understand that having a healthcare professional in your home requires trust, which is why we take extra care in selecting and training our staff. From infant care to special needs support, our nurses are equipped to handle complex medical situations with grace and expertise.",
            "location": "567 Walnut Street, Philadelphia, PA 19106",
            "city": "Philadelphia, PA",
            "experience_years": 12,
            "certifications": ["Pediatric Certified", "State Licensed", "CPR Certified", "First Aid Certified"],
            "specialties": ["Pediatric Care", "Infant Care", "Special Needs", "Medical Support"],
            "price_per_hour": 18,
            "rating": 4.8,
            "review_count": 89,
            "image_url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/8460072/pexels-photo-8460072.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460153/pexels-photo-8460153.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/5206919/pexels-photo-5206919.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/5207100/pexels-photo-5207100.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 32,
            "years_in_business": 12,
            "families_served": 850,
            "reviews": generate_reviews(["Pediatric Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Philadelphia Senior Services",
            "bio": "Dedicated to enhancing quality of life for seniors with specialized dementia care.",
            "description": "Philadelphia Senior Services has been the city's premier provider of senior care for two decades. Our specialized programs for dementia and Alzheimer's care set us apart, with caregivers trained in the latest therapeutic approaches. We believe in treating the whole person—mind, body, and spirit—which is why our care plans include not just physical assistance, but also social engagement, mental stimulation, and emotional support. Our compassionate team becomes an extension of your family.",
            "location": "890 Chestnut Street, Philadelphia, PA 19107",
            "city": "Philadelphia, PA",
            "experience_years": 20,
            "certifications": ["Alzheimer's Certified", "State Licensed", "Bonded & Insured", "Dementia Care Specialist"],
            "specialties": ["Dementia Care", "Alzheimer's", "Companionship", "Memory Care"],
            "price_per_hour": 15,
            "rating": 4.7,
            "review_count": 156,
            "image_url": "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768140/pexels-photo-3768140.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551668/pexels-photo-7551668.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460059/pexels-photo-8460059.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 58,
            "years_in_business": 20,
            "families_served": 2100,
            "reviews": generate_reviews(["Dementia Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "HomeWell Care Services",
            "bio": "Comprehensive home healthcare including skilled nursing and physical therapy.",
            "description": "HomeWell Care Services provides a complete spectrum of in-home healthcare services throughout greater Philadelphia. Our skilled nursing team can handle everything from medication management to wound care, while our physical and occupational therapists help clients regain mobility and independence. We coordinate closely with physicians and hospitals to ensure seamless transitions from facility to home care, making recovery smoother and more comfortable for everyone involved.",
            "location": "123 Broad Street, Philadelphia, PA 19102",
            "city": "Philadelphia, PA",
            "experience_years": 8,
            "certifications": ["Medicare Certified", "State Licensed", "Joint Commission Accredited"],
            "specialties": ["Skilled Nursing", "Physical Therapy", "Personal Care", "Medication Management"],
            "price_per_hour": 17,
            "rating": 4.6,
            "review_count": 67,
            "image_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/5206919/pexels-photo-5206919.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/5207100/pexels-photo-5207100.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 28,
            "years_in_business": 8,
            "families_served": 520,
            "reviews": generate_reviews(["Skilled Nursing"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Nurturing Angels Care",
            "bio": "Round-the-clock care specialists for overnight and 24-hour support.",
            "description": "Nurturing Angels Care specializes in providing continuous, round-the-clock care for those who need constant supervision and support. Whether you need overnight care so family caregivers can rest, or full 24-hour care for complex medical situations, our angels are there. We understand the stress that comes with caring for a loved one with high needs, and we're committed to providing peace of mind along with exceptional care. Our team works in shifts to ensure fresh, attentive caregivers at all times.",
            "location": "456 Pine Street, Philadelphia, PA 19106",
            "city": "Philadelphia, PA",
            "experience_years": 10,
            "certifications": ["24/7 Care Certified", "State Licensed", "Background Checked", "Hospice Trained"],
            "specialties": ["24-Hour Care", "Overnight Care", "Hospice Support", "Respite Care"],
            "price_per_hour": 15,
            "rating": 4.8,
            "review_count": 98,
            "image_url": "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/3768146/pexels-photo-3768146.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460072/pexels-photo-8460072.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551667/pexels-photo-7551667.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551622/pexels-photo-7551622.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 52,
            "years_in_business": 10,
            "families_served": 780,
            "reviews": generate_reviews(["24-Hour Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Liberty Home Health",
            "bio": "Wound care specialists and post-operative care experts.",
            "description": "Liberty Home Health brings clinical expertise to your doorstep. Our team of wound care certified nurses and post-operative care specialists helps patients recover from surgeries, manage complex wounds, and handle IV therapy in the comfort of home. We work directly with surgeons and physicians to follow care protocols precisely, reducing the risk of complications and hospital readmissions. Our goal is to get you back to your normal life as quickly and safely as possible.",
            "location": "789 Spruce Street, Philadelphia, PA 19107",
            "city": "Philadelphia, PA",
            "experience_years": 14,
            "certifications": ["Wound Care Certified", "State Licensed", "OASIS Certified", "IV Therapy Trained"],
            "specialties": ["Wound Care", "Post-Op Care", "IV Therapy", "Surgical Recovery"],
            "price_per_hour": 18,
            "rating": 4.9,
            "review_count": 112,
            "image_url": "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/5207100/pexels-photo-5207100.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460153/pexels-photo-8460153.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460072/pexels-photo-8460072.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 35,
            "years_in_business": 14,
            "families_served": 920,
            "reviews": generate_reviews(["Post-Op Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Keystone Care Partners",
            "bio": "Mental health and behavioral support specialists.",
            "description": "Keystone Care Partners provides compassionate care for individuals with psychiatric conditions and developmental disabilities. Our specially trained caregivers understand the unique challenges of mental health care and are skilled in de-escalation techniques, medication reminders, and therapeutic engagement. We believe everyone deserves to live with dignity in their own community, and we're dedicated to making that possible through personalized, supportive care that respects each individual's journey.",
            "location": "321 Race Street, Philadelphia, PA 19106",
            "city": "Philadelphia, PA",
            "experience_years": 6,
            "certifications": ["Mental Health Certified", "State Licensed", "Behavioral Specialist", "Crisis Intervention Trained"],
            "specialties": ["Mental Health", "Behavioral Support", "Developmental Care", "Autism Support"],
            "price_per_hour": 17,
            "rating": 4.5,
            "review_count": 45,
            "image_url": "https://images.unsplash.com/photo-1543333995-a78aea2eee50?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551668/pexels-photo-7551668.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": False,
            "is_new": True,
            "total_caregivers": 18,
            "years_in_business": 6,
            "families_served": 210,
            "reviews": generate_reviews(["Mental Health"])
        },
        # Washington, D.C. - 6 agencies
        {
            "id": str(uuid.uuid4()),
            "name": "Capitol Care Services",
            "bio": "Premier in-home care serving distinguished clients in the nation's capital.",
            "description": "Capitol Care Services is Washington D.C.'s most trusted name in premium home care. We serve a distinguished clientele who expect nothing but the best, and we deliver with caregivers who are not only highly skilled but also discreet and professional. Our concierge-level service includes personalized care plans, flexible scheduling, and caregivers matched not just for skills but for personality and interests. When you choose Capitol Care, you're choosing excellence.",
            "location": "1600 K Street NW, Washington, DC 20006",
            "city": "Washington, D.C.",
            "experience_years": 18,
            "certifications": ["State Licensed", "CHAP Accredited", "Bonded & Insured", "Executive Background Checked"],
            "specialties": ["Executive Care", "Elderly Care", "Concierge Services", "Companionship"],
            "price_per_hour": 18,
            "rating": 4.9,
            "review_count": 178,
            "image_url": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/7551667/pexels-photo-7551667.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768146/pexels-photo-3768146.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460059/pexels-photo-8460059.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768140/pexels-photo-3768140.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 65,
            "years_in_business": 18,
            "families_served": 1850,
            "reviews": generate_reviews(["Executive Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "District Home Care",
            "bio": "Compassionate care for DC residents with multilingual caregivers.",
            "description": "District Home Care serves Washington's diverse community with caregivers who speak over 15 languages. We understand that cultural sensitivity is crucial to providing effective care, especially for elderly clients who may feel more comfortable communicating in their native language. Our team reflects the rich diversity of our city, and we take pride in matching clients with caregivers who understand their cultural background, dietary preferences, and traditions.",
            "location": "2020 Pennsylvania Ave NW, Washington, DC 20006",
            "city": "Washington, D.C.",
            "experience_years": 11,
            "certifications": ["Multilingual Staff", "State Licensed", "Cultural Competency Certified"],
            "specialties": ["Multilingual Care", "Cultural Care", "Elderly Care", "Personal Care"],
            "price_per_hour": 16,
            "rating": 4.7,
            "review_count": 134,
            "image_url": "https://images.unsplash.com/photo-1509909756405-be0199881695?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/7551668/pexels-photo-7551668.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 42,
            "years_in_business": 11,
            "families_served": 980,
            "reviews": generate_reviews(["Elderly Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Georgetown Care Specialists",
            "bio": "Boutique care agency serving Georgetown and Northwest DC.",
            "description": "Georgetown Care Specialists offers an intimate, boutique approach to home care. We intentionally keep our client roster small so we can provide truly personalized attention to each family we serve. Our caregivers become genuine members of the families they work with, providing not just physical care but emotional support and companionship. We specialize in long-term care relationships where consistency and trust are paramount.",
            "location": "3200 M Street NW, Washington, DC 20007",
            "city": "Washington, D.C.",
            "experience_years": 9,
            "certifications": ["State Licensed", "Geriatric Care Manager", "Bonded & Insured"],
            "specialties": ["Long-term Care", "Companionship", "Luxury Care", "Elderly Care"],
            "price_per_hour": 18,
            "rating": 4.8,
            "review_count": 67,
            "image_url": "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/7551622/pexels-photo-7551622.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460059/pexels-photo-8460059.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768146/pexels-photo-3768146.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 22,
            "years_in_business": 9,
            "families_served": 340,
            "reviews": generate_reviews(["Companionship"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "National Health Companions",
            "bio": "Veteran-owned agency serving military families and veterans.",
            "description": "National Health Companions is proudly veteran-owned and operated, with a special focus on serving those who served. We understand the unique healthcare needs of veterans and military families, from managing service-connected conditions to navigating VA benefits. Many of our caregivers are veterans themselves or military spouses, creating an immediate bond of understanding with our clients. We're honored to give back to those who gave so much for our country.",
            "location": "1775 I Street NW, Washington, DC 20006",
            "city": "Washington, D.C.",
            "experience_years": 13,
            "certifications": ["VA Approved", "State Licensed", "PTSD Care Certified", "Veteran-Owned"],
            "specialties": ["Veteran Care", "Military Families", "PTSD Support", "Disability Care"],
            "price_per_hour": 15,
            "rating": 4.9,
            "review_count": 145,
            "image_url": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/5206919/pexels-photo-5206919.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460153/pexels-photo-8460153.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 48,
            "years_in_business": 13,
            "families_served": 1120,
            "reviews": generate_reviews(["Veteran Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Potomac Pediatric Care",
            "bio": "Specialized pediatric home care for children with complex needs.",
            "description": "Potomac Pediatric Care provides expert nursing care for children with complex medical conditions. Our pediatric nurses are trained to handle everything from ventilator care to feeding tubes, allowing medically fragile children to thrive at home with their families. We work closely with children's hospitals throughout the DC area to ensure continuity of care, and we provide training and support to family members who want to participate in their child's care.",
            "location": "4500 Wisconsin Ave NW, Washington, DC 20016",
            "city": "Washington, D.C.",
            "experience_years": 15,
            "certifications": ["Pediatric ICU Certified", "State Licensed", "Ventilator Care Trained", "Children's Hospital Affiliated"],
            "specialties": ["Pediatric Nursing", "Complex Medical Care", "Ventilator Care", "Special Needs"],
            "price_per_hour": 18,
            "rating": 4.8,
            "review_count": 89,
            "image_url": "https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/8460072/pexels-photo-8460072.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460153/pexels-photo-8460153.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/5207100/pexels-photo-5207100.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 38,
            "years_in_business": 15,
            "families_served": 620,
            "reviews": generate_reviews(["Pediatric Nursing"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "DC Senior Living Support",
            "bio": "Helping seniors age in place with dignity and independence.",
            "description": "DC Senior Living Support is dedicated to one mission: helping seniors stay in their homes for as long as safely possible. We provide the support needed for aging in place, from help with daily activities to medication management to fall prevention. Our caregivers are trained in senior-specific techniques and understand the importance of maintaining independence and dignity. We also offer family consultations to help plan for changing care needs over time.",
            "location": "1200 New Hampshire Ave NW, Washington, DC 20036",
            "city": "Washington, D.C.",
            "experience_years": 7,
            "certifications": ["State Licensed", "Fall Prevention Certified", "Senior Care Specialist"],
            "specialties": ["Aging in Place", "Fall Prevention", "Daily Living Support", "Medication Management"],
            "price_per_hour": 16,
            "rating": 4.6,
            "review_count": 56,
            "image_url": "https://images.unsplash.com/photo-1517732306149-e8f829eb588a?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/3768140/pexels-photo-3768140.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551667/pexels-photo-7551667.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768146/pexels-photo-3768146.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": True,
            "total_caregivers": 25,
            "years_in_business": 7,
            "families_served": 380,
            "reviews": generate_reviews(["Aging in Place"])
        },
        # Pittsburgh, PA - 5 agencies
        {
            "id": str(uuid.uuid4()),
            "name": "Steel City Home Care",
            "bio": "Pittsburgh's most trusted home care agency since 2005.",
            "description": "Steel City Home Care has been serving Pittsburgh families for nearly two decades, building a reputation for reliability and excellence. Our roots run deep in this community—many of our caregivers have been with us for over 10 years, providing consistent, familiar faces for our clients. We offer comprehensive care services from light housekeeping and companionship to complex medical support, always with the warmth and friendliness Pittsburgh is known for.",
            "location": "600 Grant Street, Pittsburgh, PA 15219",
            "city": "Pittsburgh, PA",
            "experience_years": 19,
            "certifications": ["State Licensed", "ACHC Accredited", "Community Service Award"],
            "specialties": ["Elderly Care", "Companionship", "Light Housekeeping", "Meal Preparation"],
            "price_per_hour": 15,
            "rating": 4.8,
            "review_count": 201,
            "image_url": "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/7551622/pexels-photo-7551622.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460059/pexels-photo-8460059.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 72,
            "years_in_business": 19,
            "families_served": 2450,
            "reviews": generate_reviews(["Elderly Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Three Rivers Care Solutions",
            "bio": "Comprehensive care services for the greater Pittsburgh region.",
            "description": "Three Rivers Care Solutions serves families throughout the greater Pittsburgh area, from downtown to the surrounding suburbs. We're known for our responsive, flexible approach—when your care needs change, we adapt quickly. Our care coordinators are available 24/7 to handle emergencies, adjust schedules, or answer questions. We believe great care starts with great communication, which is why we provide regular updates to family members and work collaboratively with healthcare providers.",
            "location": "300 Sixth Avenue, Pittsburgh, PA 15222",
            "city": "Pittsburgh, PA",
            "experience_years": 12,
            "certifications": ["State Licensed", "24/7 Support", "Bonded & Insured"],
            "specialties": ["Flexible Care", "Emergency Response", "Family Communication", "Regional Coverage"],
            "price_per_hour": 16,
            "rating": 4.7,
            "review_count": 145,
            "image_url": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/7551668/pexels-photo-7551668.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460153/pexels-photo-8460153.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768140/pexels-photo-3768140.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 55,
            "years_in_business": 12,
            "families_served": 1340,
            "reviews": generate_reviews(["Elderly Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "UPMC Home Health Partners",
            "bio": "Affiliated with UPMC for seamless hospital-to-home transitions.",
            "description": "UPMC Home Health Partners works closely with the UPMC health system to provide seamless transitions from hospital to home care. When you're discharged from a UPMC facility, our team is ready to step in immediately with care that follows your physician's orders precisely. Our electronic health records integrate with UPMC systems, so your entire care team stays informed and coordinated. This level of integration means safer, more effective care for you or your loved one.",
            "location": "200 Lothrop Street, Pittsburgh, PA 15213",
            "city": "Pittsburgh, PA",
            "experience_years": 16,
            "certifications": ["UPMC Affiliated", "Medicare Certified", "Joint Commission Accredited", "EHR Integrated"],
            "specialties": ["Hospital Transitions", "Skilled Nursing", "Rehabilitation", "Chronic Disease Management"],
            "price_per_hour": 17,
            "rating": 4.9,
            "review_count": 189,
            "image_url": "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/5207100/pexels-photo-5207100.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460072/pexels-photo-8460072.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 85,
            "years_in_business": 16,
            "families_served": 2100,
            "reviews": generate_reviews(["Hospital Transitions"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Allegheny Senior Care",
            "bio": "Dedicated exclusively to senior care in Allegheny County.",
            "description": "Allegheny Senior Care focuses exclusively on elderly care, which allows us to develop deep expertise in the unique challenges seniors face. From managing multiple chronic conditions to providing dignified assistance with personal care, our caregivers are true specialists in geriatric care. We also offer specialized programs for couples, allowing both partners to receive coordinated care while staying together in their home.",
            "location": "425 Sixth Avenue, Pittsburgh, PA 15219",
            "city": "Pittsburgh, PA",
            "experience_years": 14,
            "certifications": ["Geriatric Care Certified", "State Licensed", "Couples Care Program"],
            "specialties": ["Senior Care", "Couples Care", "Chronic Conditions", "Personal Care"],
            "price_per_hour": 15,
            "rating": 4.6,
            "review_count": 112,
            "image_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/7551667/pexels-photo-7551667.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768146/pexels-photo-3768146.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551622/pexels-photo-7551622.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 45,
            "years_in_business": 14,
            "families_served": 890,
            "reviews": generate_reviews(["Senior Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Squirrel Hill Home Helpers",
            "bio": "Neighborhood-focused care in Pittsburgh's East End.",
            "description": "Squirrel Hill Home Helpers takes a neighborhood approach to home care. We hire caregivers who live in and know the East End communities, creating natural connections with clients who share their neighborhood. This means caregivers who understand local resources, know the best places for outings, and can easily handle transportation to familiar doctors and stores. It's home care that truly feels like home.",
            "location": "5850 Forbes Avenue, Pittsburgh, PA 15217",
            "city": "Pittsburgh, PA",
            "experience_years": 8,
            "certifications": ["State Licensed", "Community Focused", "Local Background Checks"],
            "specialties": ["Neighborhood Care", "Transportation", "Community Integration", "Companionship"],
            "price_per_hour": 15,
            "rating": 4.7,
            "review_count": 78,
            "image_url": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/8460059/pexels-photo-8460059.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551668/pexels-photo-7551668.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": True,
            "total_caregivers": 28,
            "years_in_business": 8,
            "families_served": 420,
            "reviews": generate_reviews(["Companionship"])
        },
        # Newark, NJ - 4 agencies
        {
            "id": str(uuid.uuid4()),
            "name": "Garden State Home Care",
            "bio": "New Jersey's affordable, quality home care solution.",
            "description": "Garden State Home Care proves that quality care doesn't have to break the bank. We've streamlined our operations to offer competitive rates while maintaining high standards of care. Our caregivers are thoroughly vetted, properly trained, and genuinely caring—we just don't charge premium prices for premium service. Serving families throughout Newark and Northern New Jersey, we make professional home care accessible to everyone who needs it.",
            "location": "550 Broad Street, Newark, NJ 07102",
            "city": "Newark, NJ",
            "experience_years": 11,
            "certifications": ["State Licensed", "Affordable Care Program", "Bonded & Insured"],
            "specialties": ["Affordable Care", "Elderly Care", "Daily Living", "Transportation"],
            "price_per_hour": 15,
            "rating": 4.5,
            "review_count": 167,
            "image_url": "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/8460072/pexels-photo-8460072.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768140/pexels-photo-3768140.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551622/pexels-photo-7551622.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 62,
            "years_in_business": 11,
            "families_served": 1560,
            "reviews": generate_reviews(["Affordable Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Newark Community Care",
            "bio": "By the community, for the community—culturally competent care.",
            "description": "Newark Community Care was founded with a simple mission: provide culturally competent care that reflects the diverse communities of Newark. Our caregivers speak Portuguese, Spanish, Haitian Creole, and many other languages. More importantly, they understand the cultural traditions, dietary preferences, and family values of the communities they serve. When care feels familiar, it's more effective—and that's what we deliver every day.",
            "location": "60 Park Place, Newark, NJ 07102",
            "city": "Newark, NJ",
            "experience_years": 9,
            "certifications": ["Cultural Competency Certified", "Multilingual Staff", "Community Partner"],
            "specialties": ["Cultural Care", "Multilingual", "Community Health", "Family Support"],
            "price_per_hour": 15,
            "rating": 4.6,
            "review_count": 98,
            "image_url": "https://images.pexels.com/photos/8460072/pexels-photo-8460072.jpeg?auto=compress&cs=tinysrgb&w=600",
            "gallery_images": [
                "https://images.pexels.com/photos/7551668/pexels-photo-7551668.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768146/pexels-photo-3768146.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 48,
            "years_in_business": 9,
            "families_served": 720,
            "reviews": generate_reviews(["Cultural Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Essex County Care Services",
            "bio": "Serving all of Essex County with dependable, professional care.",
            "description": "Essex County Care Services provides reliable home care throughout Essex County, from Newark to the suburbs. We pride ourselves on dependability—when we say a caregiver will arrive at 9 AM, they arrive at 9 AM. Our scheduling system ensures consistent caregivers for each client, building the trust and familiarity that makes care more effective. We also offer backup coverage guarantees, so you're never left without support.",
            "location": "1085 Raymond Boulevard, Newark, NJ 07102",
            "city": "Newark, NJ",
            "experience_years": 13,
            "certifications": ["State Licensed", "Reliability Guaranteed", "Full County Coverage"],
            "specialties": ["Reliable Scheduling", "Backup Coverage", "Personal Care", "Elderly Care"],
            "price_per_hour": 16,
            "rating": 4.7,
            "review_count": 134,
            "image_url": "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=600",
            "gallery_images": [
                "https://images.pexels.com/photos/5206919/pexels-photo-5206919.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460059/pexels-photo-8460059.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 55,
            "years_in_business": 13,
            "families_served": 1180,
            "reviews": generate_reviews(["Reliable Scheduling"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Brick City Caregivers",
            "bio": "Newark's newest, most innovative home care agency.",
            "description": "Brick City Caregivers brings fresh innovation to Newark's home care scene. We use modern technology to improve care—from our app that lets families check in on care visits in real-time, to our AI-powered matching system that pairs caregivers with clients based on personality and interests, not just skills. We're proving that home care can be both high-tech and high-touch, combining the best of both worlds for Newark families.",
            "location": "744 Broad Street, Newark, NJ 07102",
            "city": "Newark, NJ",
            "experience_years": 3,
            "certifications": ["State Licensed", "Tech-Enabled Care", "Innovation Award"],
            "specialties": ["Tech-Enabled", "Real-time Updates", "Personalized Matching", "Modern Care"],
            "price_per_hour": 17,
            "rating": 4.8,
            "review_count": 45,
            "image_url": "https://images.pexels.com/photos/5207100/pexels-photo-5207100.jpeg?auto=compress&cs=tinysrgb&w=600",
            "gallery_images": [
                "https://images.pexels.com/photos/8460153/pexels-photo-8460153.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768140/pexels-photo-3768140.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": True,
            "total_caregivers": 22,
            "years_in_business": 3,
            "families_served": 180,
            "reviews": generate_reviews(["Tech-Enabled"])
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
