from flask import Blueprint, jsonify, request
from flask_login import login_required
from app.models import Ambulance
from app import db, socketio

bp = Blueprint('api', __name__)

@bp.route('/api/ambulances', methods=['GET'])
def get_ambulances():
    ambulances = Ambulance.query.all()
    return jsonify([{
        'id': a.id,
        'lat': a.current_lat,
        'lng': a.current_lng,
        'status': a.status
    } for a in ambulances])

@bp.route('/api/update-location', methods=['POST'])
@login_required
def update_location():
    data = request.get_json()
    ambulance = Ambulance.query.filter_by(driver_id=current_user.id).first()
    
    if ambulance:
        ambulance.current_lat = data['lat']
        ambulance.current_lng = data['lng']
        db.session.commit()
        
        socketio.emit('location_update', {
            'id': ambulance.id,
            'lat': data['lat'],
            'lng': data['lng']
        })
        
        return jsonify({'status': 'success'})
    return jsonify({'status': 'error'}), 400