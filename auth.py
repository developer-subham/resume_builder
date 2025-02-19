import json
import sqlite3
from flask import Blueprint, request, render_template, jsonify, redirect, url_for, g, current_app #Blueprint library
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import binascii
import os
from flask_cors import CORS

from db import get_db


auth_bp = Blueprint('auth', __name__)

def generate_salt():
    return binascii.hexlify(os.urandom(16)).decode()

@auth_bp.route('/register', methods=['POST'])
def sign_up():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    gender = data.get('gender')

    salt = generate_salt()
    hashed_password = generate_password_hash(password + salt)

    if not all([name, email, password, gender]):
        return jsonify({'msg': 'All fields are request'}),400
    db = get_db()

    try:
        cursor = db.cursor()
        cursor.execute('''
            INSERT INTO users(name, email, password, salt, gender)
            VALUES (?, ?, ?, ?, ?)
        ''', (name, email, hashed_password, salt, gender))
        db.commit()
        return jsonify({'msg': "Registered successful"}), 201
    except sqlite3.IntegrityError:
        return jsonify({'msg': f'Email already exists'}), 409
    except Exception as error:
        return jsonify({'message': f'Error {error}'}), 500
    finally:
        db.close()


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT u.id, u.name, u.password, u.salt, u.is_active, r.name AS role 
        FROM users u 
        JOIN user_roles r ON u.role_id = r.id 
        WHERE u.email = ?
    """, (email,))
    user = cursor.fetchone()

    if user:
        user_id, name, hashed_password, salt, is_active, role = user

        if check_password_hash(hashed_password, password + salt):
            if is_active == 0:
                return jsonify({
                    "message": "Account is deactivated. Contact Support",
                    "user": {"is_active": 0}
                }), 403 

            access_token = create_access_token(
                identity=user_id,
                additional_claims={
                    "sub": str(user_id),
                    "role": role
                }
            )
            return jsonify({
                "access_token": access_token,
                "user": {
                    "name": name,
                    "email": email,
                    "role": role,
                    "is_active": is_active 
                }
            }), 200
    else:
        return jsonify({'message': 'Invalid email or password'}), 401


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()  # Ensure JWT authentication for logout
def logout():
    token = request.headers.get('Authorization').split()[1]
    print(request.headers.get('Authorization'))
    db = get_db()
    cursor = db.cursor()        
    cursor.execute('''
        INSERT INTO blacklist (token) VALUES (?)
        ''', (token,))
    db.commit()
    db.close()

    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.before_request
def check_blacklist():
    token = request.headers.get('Authorization')
    if token:
        token = token.split()[1]
        if _check_if_token_blacklisted(token):
            return jsonify({"message": "Token has been blacklisted. Please log in again."}), 401

def _check_if_token_blacklisted(token):
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM blacklist WHERE token = ?', (token,))
    result = cursor.fetchone()
    return result is not None
