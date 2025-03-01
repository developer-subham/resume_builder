from flask import Flask, request, jsonify, Blueprint
from flask_jwt_extended import jwt_required
import sqlite3
from werkzeug.security import generate_password_hash
from math import ceil
from db import get_db  # Ensure you have a `get_db()` function in `db.py`

admin_bp = Blueprint('admin', __name__)

@admin_bp.route("/total_users", methods=['GET'])
@jwt_required()
def total_users():
    db = get_db()
    db.row_factory = sqlite3.Row
    cursor = db.cursor()

    cursor.execute("SELECT COUNT(*) AS total_users FROM users")
    result = cursor.fetchone()
    cursor.close()

    return jsonify({"total_users": result["total_users"] if result else 0})


@admin_bp.route("/total_resumes", methods=['GET'])
@jwt_required()
def total_resumes():
    db = get_db()
    db.row_factory = sqlite3.Row
    cursor = db.cursor()

    cursor.execute("SELECT COUNT(*) AS total_resumes FROM resumes")
    result = cursor.fetchone()
    cursor.close()

    return jsonify({"total_resumes": result["total_resumes"] if result else 0})


@admin_bp.route("/active_users", methods=['GET'])
@jwt_required()
def active_users():
    db = get_db()
    db.row_factory = sqlite3.Row
    cursor = db.cursor()

    cursor.execute("SELECT COUNT(*) AS active_users FROM users WHERE is_active = 1")
    result = cursor.fetchone()
    cursor.close()

    return jsonify({"active_users": result["active_users"] if result else 0})


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    db = get_db()
    db.row_factory = sqlite3.Row
    cursor = db.cursor()

    # Get pagination parameters from the request
    page = request.args.get('page', default=1, type=int)
    page_size = request.args.get('page_size', default=10, type=int)
    offset = (page - 1) * page_size

    # Query to get paginated users
    cursor.execute("""
        SELECT id, profile_image, name, email, gender, is_active, created_at, updated_at 
        FROM users 
        LIMIT ? OFFSET ?
    """, (page_size, offset))
    users = cursor.fetchall()

    # Query to get the total number of users for pagination
    cursor.execute("SELECT COUNT(*) as total FROM users")
    total_users = cursor.fetchone()["total"]
    cursor.close()

    # Prepare the response
    user_list = [
        {
            "id": user["id"],
            "profile_image": user["profile_image"],
            "name": user["name"],
            "email": user["email"],
            "gender": user["gender"],
            "is_active": user["is_active"],
            "created_at": user["created_at"],
            "updated_at": user["updated_at"]
        }
        for user in users
    ]

    return jsonify({
        "users": user_list,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_users": total_users,
            "total_pages": ceil(total_users / page_size)
        }
    }), 200

@admin_bp.route('/users/<int:user_id>/update-status', methods=['PATCH'])
@jwt_required()
def update_user_status(user_id):
    db = get_db()
    cursor = db.cursor()

    data = request.get_json()
    new_status = data.get("is_active")

    if new_status not in [0, 1]:
        return jsonify({"error": "Invalid status"}), 400

    cursor.execute("UPDATE users SET is_active = ? WHERE id = ?", (new_status, user_id))
    db.commit()
    cursor.close()

    return jsonify({"message": "User status updated successfully!"}), 200

@admin_bp.route('/users/<int:user_id>/change_password', methods=['PATCH'])
@jwt_required()
def change_password_admin(user_id):
    data = request.get_json()
    new_password = data.get("password")

    if not new_password:
        return jsonify({"error": "Password cannot be empty"}), 400

    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('SELECT salt FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()  # Fetch the first row
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    salt = user[0]  # Extract the salt value
    hashed_password = generate_password_hash(new_password + salt)

    cursor.execute("UPDATE users SET password = ? WHERE id = ?", (hashed_password, user_id))
    db.commit()
    cursor.close()

    return jsonify({"message": "Password changed successfully!"}), 200

@admin_bp.route('/users/search', methods=['GET'])
@jwt_required()
def search_users():
    search_query = request.args.get("query", "").strip()

    if not search_query:
        return jsonify({"error": "Search query cannot be empty"}), 400

    db = get_db()
    db.row_factory = sqlite3.Row
    cursor = db.cursor()

    cursor.execute("""
        SELECT id, profile_image, name, email, gender, is_active, created_at, updated_at
        FROM users
        WHERE name LIKE ? OR email LIKE ?
    """, (f"%{search_query}%", f"%{search_query}%"))

    users = cursor.fetchall()
    cursor.close()

    if not users:
        return jsonify({"error": "No users found"}), 404

    user_list = [
        {
            "id": user["id"],
            "profile_image": user["profile_image"] if user["profile_image"] else "/static/images/uploads/profile_pictures/default.png",
            "name": user["name"],
            "email": user["email"],
            "gender": user["gender"],
            "is_active": user["is_active"],
            "created_at": user["created_at"],
            "updated_at": user["updated_at"]
        }
        for user in users
    ]

    return jsonify(user_list), 200
