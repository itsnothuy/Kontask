from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, DECIMAL, ForeignKey
import database
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base, relationship

class User(database.Base):
    """
    Represents a user in the system.

    Attributes:
        id (str): Primary key.
        username (str): The username of the user.
        hashed_password (str): The hashed password of the user.
        email (str): Email address of the user.
        is_supplier (bool): Flag indicating if the user is a supplier.
        is_verified (bool): For suppliers, indicates if they are verified.
        created_at (datetime): Timestamp when the user was created.
    """
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    username = Column(String)
    hashed_password = Column(String)
    email = Column(String)
    experience_description = Column(String)
    full_name = Column(String)
    rating = Column(Integer, default=4)
    avatar_url = Column(String, default="http://www.gravatar.com/avatar/?d=mp")
    is_supplier = Column(Boolean, default=False, comment='customer or supplier')
    is_verified = Column(Boolean, default=False, comment='For suppliers')
    created_at = Column(DateTime, default=datetime.now)
    
     # Relationship to SupplierServices
    services = relationship("SupplierService", back_populates="supplier")
    
    # NEW columns
    business_name = Column(String, comment="Supplier's business/brand name")
    pdf_summary = Column(Text, comment="Auto-generated summary from PDF")
    # store all availability slots in one column as an array of JSON objects.
    availabilities = Column(JSONB, default=[], nullable=True)
    skills = Column(JSONB, default=[], comment="User's skill set as a JSON array")




class Post(database.Base):
    """
    Represents a task post created by a requester.

    Attributes:
        id (str): Primary key.
        title (str): Title of the task.
        description (str): Detailed task description.
        category (str): Auto-categorized task category.
        status (str): Current status (e.g., open, accepted, completed).
        requester_id (str): Foreign key to the user who created the post.
        created_at (datetime): Timestamp when the post was created.
    """
    __tablename__ = "posts"

    id = Column(String, primary_key=True)
    title = Column(String)
    description = Column(Text, comment='Task description')
    category = Column(String, comment='Auto-categorized task')
    status = Column(String, comment='e.g., open, accepted, completed')
    requester_id = Column(String, ForeignKey('users.id'), comment='User who created the post')
    created_at = Column(DateTime, default=datetime.now)


class Bid(database.Base):
    """
    Represents a bid made by a supplier for a given task.

    Attributes:
        id (str): Primary key.
        post_id (str): Reference to the related post.
        supplier_id (str): User id of the supplier making the bid.
        price (Decimal): Offered price.
        message (str): Negotiation message or counter-offer details.
        status (str): Status of the bid (pending, accepted, or declined).
        created_at (datetime): Timestamp when the bid was created.
    """
    __tablename__ = "bids"

    id = Column(String, primary_key=True)
    post_id = Column(String, ForeignKey('posts.id'), comment='Reference to posts')
    supplier_id = Column(String, ForeignKey('users.id'), comment='User id of supplier making the bid')
    price = Column(DECIMAL, comment='Offered price')
    message = Column(Text, comment='Negotiation message or counter-offer details')
    status = Column(String, comment='pending, accepted, or declined')
    created_at = Column(DateTime, default=datetime.now)


class Message(database.Base):
    """
    Represents a message exchanged between users.

    Attributes:
        id (str): Primary key.
        sender_id (str): User id of the sender.
        receiver_id (str): User id of the receiver.
        content (str): Message content.
        sent_at (datetime): Timestamp when the message was sent.
    """
    __tablename__ = "messages"

    id = Column(String, primary_key=True)
    sender_id = Column(String, ForeignKey('users.id'), comment='User id of sender')
    receiver_id = Column(String, ForeignKey('users.id'), comment='User id of receiver')
    content = Column(Text)
    sent_at = Column(DateTime, default=datetime.now)


class Review(database.Base):
    """
    Represents a review provided by a customer for a completed task.

    Attributes:
        id (str): Primary key.
        post_id (str): Reference to the completed post.
        supplier_id (str): User id of the supplier being reviewed.
        customer_id (str): User id of the customer providing the review.
        rating (int): Rating value (e.g., 1-5).
        review (str): Detailed review text.
        created_at (datetime): Timestamp when the review was created.
    """
    __tablename__ = "reviews"

    id = Column(String, primary_key=True)
    post_id = Column(String, ForeignKey('posts.id'), comment='Reference to completed task')
    supplier_id = Column(String, ForeignKey('users.id'), comment='User id of supplier being reviewed')
    customer_id = Column(String, ForeignKey('users.id'), comment='User id of customer providing review')
    rating = Column(Integer, comment='Rating value (e.g., 1-5)')
    review = Column(Text)
    created_at = Column(DateTime, default=datetime.now)


class Service(database.Base):
    """
    Represents a service that can be offered by a supplier.

    Attributes:
        id (str): Primary key.
        name (str): Name of the service.
        description (str): Description of the service.
    """
    __tablename__ = "services"

    id = Column(String, primary_key=True)
    name = Column(String)
    description = Column(Text)
    
    # Relationship to SupplierService
    suppliers = relationship("SupplierService", back_populates="service")


class SupplierService(database.Base):
    """
    Association table linking suppliers to the services they offer.

    Attributes:
        supplier_id (str): Foreign key to the supplier (user).
        service_id (str): Foreign key to the service.
    """
    __tablename__ = "supplier_services"

    supplier_id = Column(String, ForeignKey('users.id'), primary_key=True)
    service_id = Column(String, ForeignKey('services.id'), primary_key=True)
    
    supplier = relationship("User", back_populates="services")
    service = relationship("Service", back_populates="suppliers")


class Transaction(database.Base):
    """
    Represents a completed transaction for a task.

    Attributes:
        id (str): Primary key.
        post_id (str): Reference to the completed post.
        supplier_id (str): User id of the supplier.
        customer_id (str): User id of the customer.
        amount (Decimal): Transaction amount.
        transaction_date (datetime): Date and time of the transaction.
    """
    __tablename__ = "transactions"

    id = Column(String, primary_key=True)
    post_id = Column(String, ForeignKey('posts.id'), comment='Reference to completed task')
    supplier_id = Column(String, ForeignKey('users.id'))
    customer_id = Column(String, ForeignKey('users.id'))
    amount = Column(DECIMAL)
    transaction_date = Column(DateTime, default=datetime.now)


class Appointment(database.Base):
    """
    Represents an appointment for a task scheduling.

    Attributes:
        id (str): Primary key.
        post_id (str): Reference to the task post.
        supplier_id (str): User id of the supplier.
        customer_id (str): User id of the customer.
        appointment_time (datetime): Scheduled appointment time.
        created_at (datetime): Timestamp when the appointment was created.
    """
    __tablename__ = "appointments"

    id = Column(String, primary_key=True)
    post_id = Column(String, ForeignKey('posts.id'), comment='Reference to task for scheduling')
    supplier_id = Column(String, ForeignKey('users.id'))
    customer_id = Column(String, ForeignKey('users.id'))
    appointment_time = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)

