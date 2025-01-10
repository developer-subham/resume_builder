import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db

user_bp = Blueprint('user', __name__)

@user_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_details():
    """
    Fetch details of the currently authenticated user.
    """
    user_id = get_jwt_identity()  # Get the user ID from the JWT token
    db = get_db()
    cursor = db.cursor()
    
    # Query to fetch user details
    cursor.execute("SELECT id, name, email, phone, gender FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Map query result to a dictionary
    user_data = {
        "id": user[0],
        "name": user[1],
        "email": user[2],
        "phone": user[3],
        "gender": user[4],
    }

    return jsonify(user_data), 200