#!/usr/bin/env python3
"""
Check user database to debug why Patiala user didn't receive SMS
"""

from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = "sqlite:///backend/documents.db"
Base = declarative_base()

class User(Base):
    """User model matching the main application database schema"""
    __tablename__ = 'users'
    
    id = Column(String, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100))
    phone_number = Column(String(15))
    district = Column(String(100))
    state = Column(String(100))
    crop = Column(String(100))
    language = Column(String(10))

def check_users():
    """Check all users in database, especially Patiala users"""
    try:
        engine = create_engine(DATABASE_URL)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Get all users
        users = session.query(User).all()
        logger.info(f"Total users in database: {len(users)}")
        
        print("\n=== ALL USERS ===")
        for user in users:
            print(f"ID: {user.id}")
            print(f"Name: {user.name}")
            print(f"Phone: {user.phone_number}")
            print(f"District: {user.district}")
            print(f"State: {user.state}")
            print(f"Crop: {user.crop}")
            print(f"Language: {user.language}")
            print("-" * 40)
        
        # Check specifically for Patiala users
        patiala_users = session.query(User).filter(User.district.ilike('%patiala%')).all()
        logger.info(f"Patiala users found: {len(patiala_users)}")
        
        print("\n=== PATIALA USERS ===")
        for user in patiala_users:
            print(f"Name: {user.name}, Phone: {user.phone_number}, District: {user.district}")
        
        # Check for your specific phone number
        your_user = session.query(User).filter(User.phone_number == '+919536519246').first()
        if your_user:
            print(f"\n=== YOUR USER RECORD ===")
            print(f"Name: {your_user.name}")
            print(f"Phone: {your_user.phone_number}")
            print(f"District: {your_user.district}")
            print(f"State: {your_user.state}")
        else:
            print(f"\n=== NO USER FOUND WITH PHONE +919536519246 ===")
        
        session.close()
        
    except Exception as e:
        logger.error(f"Database error: {e}")

if __name__ == "__main__":
    check_users()
