import json
import sqlite3
from flask import Blueprint, request, render_template, jsonify, redirect, url_for, g, current_app #Blueprint library
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash


from db import get_db


auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def sign_up():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    hashed_password = generate_password_hash(password)
    gender = data.get('gender')

    if not all([name, email, password, gender]):
        return jsonify({'msg': 'All fields are request'}),400

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            INSERT INTO users(name, email, password, gender)
            VALUES (?, ?, ?, ?)
        ''', (name, email, hashed_password, gender))
        db.commit()
        return jsonify({'msg': "Registered successful"}), 201
    except sqlite3.IntegrityError:
        return jsonify({'msg': 'Email already exists'}), 409


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute('SELECT id, name, password FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()

    if user and check_password_hash(user[2], password):
         # Create JWT token with user ID as identity and include `sub` claim
        access_token = create_access_token(
            identity=user[0], 
            additional_claims={"sub": str(user[0])}  # Add the `sub` claim
        )
        
        return jsonify({'access_token': access_token, 'user': {'name': user[1], 'email': email}}), 200
    else:
        return jsonify({'message': 'Invalid email or password'}), 401

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()  # Ensure JWT authentication for logout
def logout():
    token = request.headers.get('Authorization').split()[1] 
    db = get_db()
    return jsonify({'message': 'Logged out successfully'}), 200
