from flask import Flask, render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager

# Database
from db import init_db

# Blueprint files
from resume import resume_bp
from auth import auth_bp
from user import user_bp


app = Flask(__name__)

app.config.from_object('config.Config')

with app.app_context():
    init_db()

jwt = JWTManager(app)

# Blueprint register
app.register_blueprint(resume_bp, url_prefix='/api/resume')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/user')



@app.route('/')
def index():
    return render_template('index.html')

@app.route('/auth', methods=['GET'])
def auth_controller():
    return render_template('auth.html')

@app.route('/user/resumes/', methods=['GET'])
def resumes():
    return render_template('resumes.html')

@app.route('/settings', methods=['GET'])
def settings():
    return render_template('settings.html')

# Handle 404 error
@app.errorhandler(404)
def page_not_found(e):
    return render_template('errors/404.html'), 404

if __name__ == '__main__':
    app.run(debug=True)