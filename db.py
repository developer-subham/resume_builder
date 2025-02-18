from pathlib import Path
import sqlite3
from flask import g, current_app

def get_db():
    """Returns a database connection. Uses Flask's g object to store a connection per request."""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(current_app.config['DATABASE'])
    return db

def close_db(error=None):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with current_app.app_context():
        db = get_db()
        cursor = db.cursor()

        sql_file = Path(__file__).parent / 'migrations/1_schema.sql'
        with sql_file.open('r') as f:
            sql_script = f.read()

        cursor.executescript(sql_script)

        db.commit()
        db.close()