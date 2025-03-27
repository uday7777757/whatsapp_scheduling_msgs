from flask_socketio import emit
from flask_login import current_user
from app.models import Ambulance

def register_socket_handlers(socketio):
    @socketio.on('connect')
    def handle_connect():
        if current_user.is_authenticated and current_user.role == 'driver':
            emit('connection_success', {'status': 'connected'})

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')