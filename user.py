import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from db import get_db

import os

user_bp = Blueprint('user', __name__)

UPLOAD_FOLDER = 'static/images/uploads/profile'
ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg']

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
    cursor.execute("SELECT id, name, email, gender FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Map query result to a dictionary
    user_data = {
        "id": user[0],    # Access tuple by index
        "name": user[1],  # Access tuple by index
        "email": user[2], # Access tuple by index
        "gender": user[3],# Access tuple by index
    }

    return jsonify(user_data), 200

@user_bp.route('/', methods=['PUT'])
@jwt_required()
def update_user_details():
    user_id = get_jwt_identity() # Get the user id from jwt token
    data = request.get_json() # Get the update data from JSON

    # Extract update fields
    name = data.get('name')
    email = data.get('email')
    gender = data.get('gender')

    # Check the validate input
    if not name or not email: 
        return jsonify({'error': "Name and email are required"}), 400

    db = get_db()
    cursor = db.cursor()

    # Update the user information in Database
    cursor.execute(
        "UPDATE users SET name = ?, email = ?, gender = ? WHERE id = ?",
        (name, email, gender, user_id)
    )
    db.commit()

    if cursor.rowcount == 0:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"message": "User details updated successfully"}), 200

@user_bp.route('/deactive_account', methods=['PATCH'])
@jwt_required()
def deactive_account():
    try:
        # Get the current user's identity (user_id) from the JWT token
        user_id = get_jwt_identity()  # This is the user ID

        # Database connection and cursor
        db = get_db()
        cursor = db.cursor()

        # Get the user's active column
        cursor.execute("SELECT is_active FROM users WHERE id = ?", (user_id))
        db.commit()

        # Fetch user active data
        user = cursor.fetchone()

        # Check if user is not found
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Check if account is already deactivated then you need to display error
        is_active = user[0]
        if is_active == 0:
            return jsonify({"message": "Sorry your account is already deactivated so please contact our help center."})

        # deactive user account
        cursor.execute("UPDATE users SET is_active = 0 WHERE id = ?", (user_id,))
        db.commit()
        # Return success response
        return jsonify({"message": "Account deactivated successfully"}), 200

    except Exception as e:
        return jsonify({"message": f"Error deactive account: {str(e)}"}), 500


@user_bp.route('/change_password', methods=['PATCH'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        old_password = data.get('old_password')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        db = get_db()
        cursor = db.cursor()

        # Get the current hashed password from the database
        cursor.execute("SELECT password FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'message': 'User not found'}), 404

        hashed_password = user[0]  # Extract the stored hashed password

        # Verify old password
        if not check_password_hash(hashed_password, old_password):
            return jsonify({'message': 'Incorrect old password'}), 401

        # Hash new password
        new_hashed_password = generate_password_hash(new_password)

        # Update password in database
        cursor.execute("UPDATE users SET password = ? WHERE id = ?", (new_hashed_password, user_id))
        db.commit()

        return jsonify({'message': 'Password changed successfully'}), 200

    except Exception as e:
        return jsonify({'message': f'Error changing password: {str(e)}'}), 500


@user_bp.route('/update_profile_picture', methods=['PATCH'])
@jwt_required()
def update_profile_picture():
    user_id = get_jwt_identity()
    
    if 'profile_image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['profile_image']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(f"user_{user_id}_" + file.filename)  # Rename file
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)  # Save file

        # Save file path to database
        db = get_db()
        cursor = db.cursor()
        cursor.execute("UPDATE users SET profile_image = %s WHERE id = %s", (filepath, user_id))
        db.commit()

        return jsonify({"message": "Profile image updated successfully!", "profile_image_url": filepath}), 200
    else:
        return jsonify({"error": "Invalid file format"}), 400
