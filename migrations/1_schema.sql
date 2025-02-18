
CREATE TABLE IF NOT EXISTS user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);


INSERT OR IGNORE INTO user_roles (name, description) VALUES
('user', 'Regular user with basic access'),
('admin', 'Administrator with full access'),
('customer_support', 'Customer Support with limited admin access');

-- Create the 'users' table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    gender TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    profile_image VARCHAR(255),
    role_id INTEGER NULL DEFAULT 1,
    salt TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


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