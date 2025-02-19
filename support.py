from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db

# Define the Blueprint correctly
support_bp = Blueprint('support', __name__)

# Fetch all users
@support_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT id, name, email, gender, is_active FROM users
    """)
    users = cursor.fetchall()

    user_list = []
    for user in users:
        user_id, name, email, gender, is_active = user
        user_list.append({
            "id": user_id,
            "name": name,
            "email": email,
            "gender": gender,
            "is_active": is_active
        })

    return jsonify(user_list), 200

# Activate/Deactivate User
@support_bp.route('/toggle_status/<int:user_id>', methods=['POST'])
@jwt_required()
def toggle_user_status(user_id):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT is_active FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    
    if not user:
        return jsonify({"message": "User not found"}), 404

    new_status = 0 if user[0] else 1  # Toggle active status
    cursor.execute("UPDATE users SET is_active = ? WHERE id = ?", (new_status, user_id))
    db.commit()

    return jsonify({"message": "User status updated", "new_status": new_status}), 200
