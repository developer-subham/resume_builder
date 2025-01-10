import os
from dotenv import load_dotenv
from datetime import timedelta


load_dotenv('dev.env')


class Config:
    FLASK_ENV = os.getenv('FLASK_ENV', 'dev')
    DEBUG = os.getenv('FLASK_ENV') != 'prod'

    SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')
    DATABASE = os.getenv('DATABASE', 'resume_builder')

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)

    JWT_TOKEN_LOCATION = ['headers']  
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'   
