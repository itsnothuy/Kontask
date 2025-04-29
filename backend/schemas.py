from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from typing import Optional, List



# ------------------------
# Supplier Availability
# ------------------------
class Availability(BaseModel):
    day_of_week: str
    is_available: bool
    start_time: str  # e.g., "09:00"
    end_time: str    # e.g., "17:00"
    
# ------------------------
# Users
# ------------------------
class User(BaseModel):
    """
    Represents a user in the system.

    Attributes:
        id (str): Primary key.
        username (str): The username.
        email (str): The user's email address.
        is_supplier (bool): Flag indicating if the user is a supplier (default: False).
        is_verified (bool): For suppliers, indicates if they are verified (default: False).
        created_at (datetime): Timestamp when the user was created.
    """
    id: str
    username: str
    email: str
    full_name: str
    avatar_url: str 
    experience_description: str = ""
    rating: int = 4
    is_supplier: bool = False
    is_verified: bool = False
    created_at: datetime
    
    # NEW
    business_name: Optional[str] = None
    pdf_summary: Optional[str] = None
    availabilities: List[Availability] = []
    skills: List[str] = []

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    """
    Schema for creating a new user.
    
    Attributes:
        username (str): The username.
        email (str): The user's email address.
        is_supplier (bool): Flag indicating if the user is a supplier.
        is_verified (bool): For suppliers, indicates if they are verified.
    """
    username: str
    password: str
    full_name: str
    experience_description: str = ""
    rating: int = 4
    avatar_url: str = "http://www.gravatar.com/avatar/?d=mp"
    email: str
    is_supplier: bool = False
    is_verified: bool = False

class UserLogin(BaseModel):
    username: str
    password: str

# ------------------------
# Posts
# ------------------------
class Post(BaseModel):
    """
    Represents a task post created by a user.

    Attributes:
        id (str): Primary key.
        title (str): Title of the task.
        description (str): Detailed description of the task.
        category (str): Auto-categorized task category.
        status (str): Task status (e.g., open, accepted, completed).
        requester_id (str): User ID of the requester.
        created_at (datetime): Timestamp when the post was created.
    """
    id: str
    title: str
    description: str
    category: str
    status: str
    requester_id: str
    offers: int = 0
    views: int = 0
    created_at: datetime

class PostCreate(BaseModel):
    """
    Schema for creating a new post.
    
    Attributes:
        title (str): Title of the task.
        description (str): Detailed description of the task.
        category (str): Auto-categorized task category.
        status (str): Task status.
        requester_id (str): User ID of the requester.
    """
    title: str
    description: str
    category: str
    status: str
    requester_id: str

# ------------------------
# Bids
# ------------------------
class Bid(BaseModel):
    """
    Represents a bid made by a supplier on a task.

    Attributes:
        id (str): Primary key.
        post_id (str): ID of the associated post.
        supplier_id (str): User ID of the supplier making the bid.
        price (Decimal): Offered price.
        message (str): Negotiation message or counter-offer details.
        status (str): Status of the bid (pending, accepted, or declined).
        created_at (datetime): Timestamp when the bid was created.
    """
    id: str
    post_id: str
    supplier_id: str
    price: Decimal
    message: str
    status: str
    created_at: datetime

class BidCreate(BaseModel):
    """
    Schema for creating a new bid.
    
    Attributes:
        post_id (str): ID of the associated post.
        supplier_id (str): User ID of the supplier.
        price (Decimal): Offered price.
        message (str): Negotiation message or counter-offer details.
        status (str): Bid status.
    """
    post_id: str
    supplier_id: str
    price: Decimal
    message: str
    status: str = "pending"

# ------------------------
# Messages
# ------------------------
class Message(BaseModel):
    """
    Represents a message exchanged between users.

    Attributes:
        id (str): Primary key.
        sender_id (str): User ID of the sender.
        receiver_id (str): User ID of the receiver.
        content (str): Content of the message.
        sent_at (datetime): Timestamp when the message was sent.
    """
    id: str
    sender_id: str
    receiver_id: str
    content: str
    sent_at: datetime

class MessageCreate(BaseModel):
    """
    Schema for creating a new message.
    
    Attributes:
        sender_id (str): User ID of the sender.
        receiver_id (str): User ID of the receiver.
        content (str): Content of the message.
    """
    sender_id: str
    receiver_id: str
    content: str

# ------------------------
# Reviews
# ------------------------
class Review(BaseModel):
    """
    Represents a review for a completed task.

    Attributes:
        id (str): Primary key.
        post_id (str): ID of the completed post.
        supplier_id (str): User ID of the supplier being reviewed.
        customer_id (str): User ID of the customer providing the review.
        rating (str): Rating value (e.g., 1-5).
        review (str): Detailed review text.
        created_at (datetime): Timestamp when the review was created.
    """
    id: str
    post_id: str
    supplier_id: str
    customer_id: str
    rating: int
    review: str
    created_at: datetime

class ReviewCreate(BaseModel):
    """
    Schema for creating a new review.
    
    Attributes:
        post_id (str): ID of the completed post.
        supplier_id (str): User ID of the supplier.
        customer_id (str): User ID of the customer.
        rating s: Rating value.
        review (str): Detailed review text.
    """
    post_id: str
    supplier_id: str
    customer_id: str
    rating: int
    review: str

# ------------------------
# Services
# ------------------------
class Service(BaseModel):
    """
    Represents a service that can be offered by suppliers.

    Attributes:
        id s: Primary key.
        name (str): Name of the service.
        description (str): Description of the service.
    """
    id: str
    name: str
    description: str
    
    class Config:
        orm_mode = True

class ServiceCreate(BaseModel):
    """
    Schema for creating a new service.
    
    Attributes:
        name (str): Name of the service.
        description (str): Description of the service.
    """
    name: str
    description: str

# ------------------------
# Supplier Services (Association Table)
# ------------------------
class SupplierService(BaseModel):
    """
    Represents the association between a supplier and a service.

    Attributes:
        supplier_id s: User ID of the supplier.
        service_id s: ID of the service.
    """
    supplier_id: str
    service_id: str
    
    class Config:
     orm_mode = True

# ------------------------
# Transactions
# ------------------------
class Transaction(BaseModel):
    """
    Represents a transaction for a completed task.

    Attributes:
        id s: Primary key.
        post_id s: ID of the completed post.
        supplier_id s: User ID of the supplier.
        customer_id s: User ID of the customer.
        amount (Decimal): Transaction amount.
        transaction_date (datetime): Date and time of the transaction.
    """
    id: str
    post_id: str
    supplier_id: str
    customer_id: str
    amount: Decimal
    transaction_date: datetime

class TransactionCreate(BaseModel):
    """
    Schema for creating a new transaction.
    
    Attributes:
        post_id s: ID of the completed post.
        supplier_id s: User ID of the supplier.
        customer_id s: User ID of the customer.
        amount (Decimal): Transaction amount.
    """
    post_id: str
    supplier_id: str
    customer_id: str
    amount: Decimal

# ------------------------
# Appointments
# ------------------------
class Appointment(BaseModel):
    """
    Represents an appointment for scheduling a task.

    Attributes:
        id (str): Primary key.
        post_id (str): ID of the task post.
        supplier_id (str): User ID of the supplier.
        customer_id (str): User ID of the customer.
        appointment_time (datetime): Scheduled appointment time.
        created_at (datetime): Timestamp when the appointment was created.
    """
    id: str
    post_id: str
    supplier_id: str
    customer_id: str
    appointment_time: datetime
    created_at: datetime

class AppointmentCreate(BaseModel):
    """
    Schema for creating a new appointment.
    
    Attributes:
        post_id (str): ID of the task post.
        supplier_id (str): User ID of the supplier.
        customer_id (str): User ID of the customer.
        appointment_time (datetime): Scheduled appointment time.
    """
    post_id: str
    supplier_id: str
    customer_id: str
    appointment_time: datetime


class SearchRequest(BaseModel):
    query: str
    requester_id: str




