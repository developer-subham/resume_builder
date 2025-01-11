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

@user_bp.route('/', methods=['DELETE'])
@jwt_required()
def delete_user_account():
    try:
        # Get the current user's identity from the JWT
        user_id = get_jwt_identity()
        email = request.json.get('email')

        if not email:
            return jsonify({"message": "Email is required"}), 400

        # Validate if the email matches the user's identity
        db = get_db()
        cursor = db.cursor()

        # Get user details based on email
        user = get_user_by_email(email, cursor)

        if not user:
            return jsonify({"message": "Email not found. Please create account"}), 400
        
        if user[0] != user_id:  # Ensure user ID matches
            return jsonify({"message": "Email is invalid"}), 400

        # Delete associated data
        delete_resumes_by_user_id(user_id, cursor)  # Deletes all resumes for the user
        delete_user_by_id(user_id, cursor)         # Deletes the user record

        return jsonify({"message": "Account deleted successfully"}), 200

    except Exception as e:
        return jsonify({"message": f"Error deleting account: {str(e)}"}), 500

    
def get_user_by_email(email, cursor):
    # Query the database to fetch user by email
    query = "SELECT * FROM users WHERE email = ?"
    cursor.execute(query, (email,))
    return cursor.fetchone()

def delete_user_by_id(user_id, cursor):
    # Delete user by ID
    query = "DELETE FROM users WHERE id = ?"
    cursor.execute(query, (user_id,))
    cursor.connection.commit()

def delete_resumes_by_user_id(user_id, cursor):
    # Delete resumes associated with the user
    query = "DELETE FROM resumes WHERE user_id = ?"
    cursor.execute(query, (user_id,))
    cursor.connection.commit()
