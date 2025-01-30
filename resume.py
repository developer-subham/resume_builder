import json
import sqlite3
from flask import Blueprint, request, render_template, jsonify, redirect, url_for, g, current_app
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity #Blueprint library
from db import get_db

resume_bp = Blueprint('resume', __name__)

@resume_bp.route('/', methods=['POST'])
@jwt_required()
def create_resume_for_user():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO resumes (user_id, name) VALUES (?, ?)", 
                   (user_id, name))
    db.commit()
    resume_id = cursor.lastrowid
    return jsonify({"id": resume_id}), 201

def get_resume_data(user_id, resume_id=None):
    db = get_db()
    cursor = db.cursor()

    if resume_id:
        cursor.execute("SELECT * FROM resumes WHERE user_id = ? AND id = ?", (user_id, resume_id))
    else:
        cursor.execute("SELECT * FROM resumes WHERE user_id = ?", (user_id,))
    
    rows = cursor.fetchall()
    column_names = [description[0] for description in cursor.description]
    result = []
    for row in rows:
        resume = {}
        for index, column_name in enumerate(column_names):
            value = row[index]
            if value is None:
                value = []

            if isinstance(value, str):
                try:
                    value = json.loads(value)
                except json.JSONDecodeError:
                    pass

            resume[column_name] = value

        result.append(resume)
    return result

@resume_bp.route('/', methods=['GET'])
@jwt_required()
def get_resumes_by_user_id():
    user_id = get_jwt_identity()
    resumes = get_resume_data(user_id)
    if not resumes:
        return jsonify({"error": "No resumes found for this user"}), 404
    return jsonify(resumes)

@resume_bp.route('/<int:resume_id>', methods=['GET'])
@jwt_required()
def get_resume_by_id_and_user_id(resume_id):
    user_id = get_jwt_identity()
    resumes = get_resume_data(user_id, resume_id)
    if len(resumes) == 0:
        return jsonify({"error": "Resume not found or access denied"}), 404
    return jsonify(resumes[0])

@resume_bp.route('/template/<int:resume_id>/<theme_name>', methods=['GET'])
@jwt_required()
def get_resume_template(resume_id, theme_name):
    user_id = get_jwt_identity()
    resumes = get_resume_data(user_id, resume_id)
    if len(resumes) == 0:
        return jsonify({"error": "Resume not found or access denied"}), 404
    return render_template(f"resume/themes/{theme_name}.html", **resumes[0])

@resume_bp.route('/preview/<int:resume_id>/', methods=['GET'])
@jwt_required()
def get_resume_preview_of_stored_theme(resume_id):
    user_id = get_jwt_identity()
    resumes = get_resume_data(user_id, resume_id)
    if len(resumes) == 0:
        return jsonify({"error": "Resume not found or access denied"}), 404
    resume = resumes[0]
    if resume['resume_template']:
        resume_template = resume['resume_template']['theme_name']
        return render_template(f"resume/themes/{resume_template}.html", **resume)
    else:
        return "Please click on edit button, fill resume details and select resume template"

@resume_bp.route('/<int:resume_id>/section/<section>', methods=['PUT'])
@jwt_required()
def save_section(resume_id, section):
    user_id = get_jwt_identity()  # Extract user_id from JWT
    
    if section not in ["profile", "experience", "projects", "education", "skills", "hobbies", "resume_template"]:
        return jsonify({"error": "Invalid section"}), 400

    data = request.json
    db = get_db()
    cursor = db.cursor()
    cursor.execute(f"UPDATE resumes SET {section} = ? WHERE user_id = ? and id = ?", (json.dumps(data), user_id, resume_id))
    db.commit()

    if cursor.rowcount == 0:
        return jsonify({"error": "Resume not found"}), 404
    return jsonify({"message": f"{section.capitalize()} updated successfully"})


@resume_bp.route('/<int:resume_id>', methods=['DELETE'])
@jwt_required()
def delete_resume(resume_id):
    """
    Deletes a specific resume for the authenticated user.
    """
    user_id = get_jwt_identity()  # Extract user_id from JWT
    db = get_db()
    cursor = db.cursor()

    # Check if the resume exists and belongs to the user
    cursor.execute("SELECT * FROM resumes WHERE id = ? AND user_id = ?", (resume_id, user_id))
    resume = cursor.fetchone()

    if not resume:
        return jsonify({"error": "Resume not found or not authorized to delete"}), 404

    # Delete the resume
    cursor.execute("DELETE FROM resumes WHERE id = ? AND user_id = ?", (resume_id, user_id))
    db.commit()

    return jsonify({"message": "Resume deleted successfully"}), 200
