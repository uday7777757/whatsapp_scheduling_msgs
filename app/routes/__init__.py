from .auth import bp as auth_bp
from .main import bp as main_bp
from .api import bp as api_bp

# Explicitly name them to avoid conflicts
auth_bp.name = 'auth_routes'
main_bp.name = 'main_routes'
api_bp.name = 'api_routes'