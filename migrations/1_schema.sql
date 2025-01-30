-- Create the 'users' table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    gender TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
);

-- Added the 'is_active' column to the 'users' table
-- ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1; 

-- ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) DEFAULT 'static/uploads/profile_pictures/default.png';


-- Create the 'blacklist' table
CREATE TABLE IF NOT EXISTS blacklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'resumes' table
CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    about TEXT,                   
    profile TEXT,                  
    profile_image TEXT,           
    education TEXT,              
    skills TEXT,                  
    hobbies TEXT,                 
    experience TEXT,               
    languages TEXT,                
    projects TEXT,                 
    achievements TEXT,
    resume_template TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);