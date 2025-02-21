import json
import os
import base64
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from db import get_db
from image_util import save_base64_image
from datetime import datetime


user_bp = Blueprint('user', __name__)

UPLOAD_FOLDER = 'static/images/uploads/profile_pictures'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)



@user_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_details():
    user_id = get_jwt_identity()
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT id, name, email, gender, profile_image, updated_at FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "User not found"}), 404

    user_data = {
        "id": user[0],
        "name": user[1],
        "email": user[2],
        "gender": user[3],
        "profile_image": user[4] if user[4] else 'static/images/uploads/profile_pictures/default.png',
        "updated_at": user[5]
    }
    return jsonify(user_data), 200

@user_bp.route('/', methods=['PUT'])
@jwt_required()
def update_user_details():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    gender = data.get('gender')
    profile_image_base64 = data.get('profile_image')

    if not name or not email:
        return jsonify({"error": "Full name and email are required"}), 400

    profile_image_path = None
    if profile_image_base64:
        profile_image_path = save_base64_image(profile_image_base64, user_id, UPLOAD_FOLDER)
        if not profile_image_path:
            return jsonify({"error": "Invalid image data or format"}), 400

    updated_at = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    db = get_db()
    cursor = db.cursor()
    query = "UPDATE users SET name = ?, email = ?, gender = ?, updated_at = ?"
    params = [name, email, gender, updated_at]

    if profile_image_path:
        query += ", profile_image = ?"
        params.append(profile_image_path)

    query += " WHERE id = ?"
    params.append(user_id)

    cursor.execute(query, tuple(params))
    db.commit()
    db.close()

    return jsonify({"message": "User details updated successfully", "updated_at": updated_at}), 200

@user_bp.route('/deactive_account', methods=['PATCH'])
@jwt_required()
def deactive_account():
    try:
        user_id = get_jwt_identity()
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT is_active FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"message": "User not found"}), 404

        if user[0] == 0:
            return jsonify({"message": "Account already deactivated. Contact support."}), 400

        cursor.execute("UPDATE users SET is_active = 0 WHERE id = ?", (user_id,))
        db.commit()
        db.close()
        return jsonify({"message": "Account deactivated successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Error deactivating account: {str(e)}"}), 500

@user_bp.route('/change_password', methods=['PATCH'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"error": "Invalid JSON request"}), 400

        old_password = data.get('old_password')
        new_password = data.get('new_password')

        if not old_password or not new_password:
            return jsonify({"error": "Both old and new passwords are required"}), 400

        db = get_db()
        cursor = db.cursor()

        cursor.execute("SELECT password FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not check_password_hash(user[0], old_password):
            return jsonify({"error": "Incorrect old password"}), 401

        new_hashed_password = generate_password_hash(new_password)
        cursor.execute("UPDATE users SET password = ? WHERE id = ?", (new_hashed_password, user_id))
        db.commit()
        db.close()

        return jsonify({"message": "Password changed successfully"}), 200
    except Exception as e:
        print("Error:", str(e))  # Log error in the console
        return jsonify({"error": f"Error changing password: {str(e)}"}), 500

@user_bp.route('/upload_image', methods=['PATCH'])
@jwt_required()
def upload_image():
    user_id = get_jwt_identity()
    data = request.get_json()
    image_data = data.get("image_data")

    if not image_data:
        return jsonify({"error": "No image data provided"}), 400

    try:
        image_bytes = base64.b64decode(image_data)
        filename = f"user_{user_id}.jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        with open(filepath, "wb") as image_file:
            image_file.write(image_bytes)

        image_url = f"/{filepath}"
        return jsonify({"message": "Image uploaded successfully!", "image_url": image_url}), 200
    except Exception as e:
        return jsonify({"error": f"Error processing image: {str(e)}"}), 500
