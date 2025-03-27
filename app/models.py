from datetime import datetime
from app import db
from flask_login import UserMixin

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin, dispatcher, driver

class Ambulance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    license_plate = db.Column(db.String(20), unique=True, nullable=False)
    current_lat = db.Column(db.Float)
    current_lng = db.Column(db.Float)
    status = db.Column(db.String(20), default='available')
    driver_id = db.Column(db.Integer, db.ForeignKey('user.id'))