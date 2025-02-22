from flask import Flask, jsonify, Blueprint
from flask_jwt_extended import jwt_required
import sqlite3
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
    
    cursor.execute("SELECT id, profile_image, name, email, gender, is_active, created_at, updated_at FROM users")
    users = cursor.fetchall()
    cursor.close()

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

    return jsonify(user_list), 200
