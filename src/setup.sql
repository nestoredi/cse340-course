-- ========================================
-- Drop existing tables (children first) so this script can be re-run
-- ========================================
DROP TABLE IF EXISTS project_category;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS organization;
-- WARNING: re-running this script also deletes every registered user.
-- After running it, register the admin account again and re-run the
-- UPDATE statement at the end of this file.
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- ========================================
-- Organization Table
-- ========================================
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- ========================================
-- Project Table
-- One organization sponsors many projects (1:N), and every project
-- belongs to exactly one organization.
-- ========================================
CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    project_date DATE NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organization (organization_id)
);

-- ========================================
-- Category Table
-- ========================================
CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ========================================
-- Project/Category junction table
-- Many-to-many: a project can have many categories and a category
-- can have many projects. The composite primary key prevents the
-- same project/category pair from being added twice.
-- ========================================
CREATE TABLE project_category (
    project_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, category_id),
    FOREIGN KEY (project_id) REFERENCES project (project_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category (category_id) ON DELETE CASCADE
);

-- ========================================
-- Insert sample data: Organizations
-- (organization_id values 1, 2, 3 are assigned in this order)
-- ========================================
INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES
('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');

-- ========================================
-- Insert sample data: Projects (5 per organization)
-- project_id 1-5: BrightFuture, 6-10: GreenHarvest, 11-15: UnityServe
-- ========================================
INSERT INTO project (organization_id, title, description, location, project_date)
VALUES
-- BrightFuture Builders (organization_id = 1)
(1, 'Neighborhood Playground Build', 'Help build a safe, sustainable playground for local families.', 'Oak Avenue Lot', '2026-12-05'),
(1, 'Community Center Repair Day', 'Repair doors, windows, and walls at the community center.', 'Eastside Community Center', '2026-12-19'),
(1, 'Accessible Ramp Construction', 'Build wheelchair ramps for neighbors who need safer access to their homes.', 'Various homes in Maple District', '2027-01-09'),
(1, 'Bus Stop Shelter Build', 'Construct covered shelters at busy bus stops using recycled materials.', 'Fifth Street Transit Stop', '2027-01-23'),
(1, 'School Library Shelving Project', 'Build and install new bookshelves for an elementary school library.', 'Lincoln Elementary School', '2027-02-06'),
-- GreenHarvest Growers (organization_id = 2)
(2, 'Park Cleanup', 'Join us to clean up local parks and make them beautiful!', 'Riverside Park', '2026-12-06'),
(2, 'Community Garden Day', 'Help plant and tend vegetables for neighborhood food pantries.', 'Maple Street Community Garden', '2026-12-13'),
(2, 'Urban Composting Workshop', 'Learn to compost and help set up bins for local households.', 'GreenHarvest Learning Barn', '2027-01-10'),
(2, 'Seed Library Setup', 'Organize a free seed library and teach families how to grow their own food.', 'Downtown Public Library', '2027-01-24'),
(2, 'Fresh Produce Distribution', 'Pack and hand out fresh produce to families in need.', 'Northside Food Pantry', '2027-02-07'),
-- UnityServe Volunteers (organization_id = 3)
(3, 'Food Drive', 'Help collect and distribute food to those in need.', 'Downtown Community Center', '2026-12-12'),
(3, 'Community Tutoring', 'Volunteer to tutor students in various subjects.', 'Lincoln Public Library', '2026-12-20'),
(3, 'Senior Visit Day', 'Spend time with seniors through games, music, and conversation.', 'Sunrise Care Home', '2027-01-16'),
(3, 'Clothing Donation Sort', 'Sort and pack donated clothing for local shelters.', 'UnityServe Warehouse', '2027-01-30'),
(3, 'Neighborhood Wellness Walk', 'Lead a friendly group walk to promote healthy habits in the community.', 'Riverside Trail', '2027-02-13');

-- ========================================
-- Insert sample data: Categories
-- (category_id values 1 to 4 are assigned in this order)
-- ========================================
INSERT INTO category (name)
VALUES
('Environmental'),
('Educational'),
('Community Service'),
('Health and Wellness');

-- ========================================
-- Associate projects with categories
-- (1 Environmental, 2 Educational, 3 Community Service, 4 Health and Wellness)
-- Every project has at least one category; many have two.
-- ========================================
INSERT INTO project_category (project_id, category_id)
VALUES
(1, 3),
(2, 3),
(3, 3), (3, 4),
(4, 3),
(5, 2),
(6, 1), (6, 3),
(7, 1), (7, 4),
(8, 1), (8, 2),
(9, 1), (9, 2),
(10, 3), (10, 4),
(11, 3), (11, 4),
(12, 2),
(13, 3), (13, 4),
(14, 3),
(15, 4);

-- ========================================
-- Roles Table (role-based access control)
-- ========================================
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT
);

INSERT INTO roles (role_name, role_description) VALUES
    ('user', 'Standard user with basic access'),
    ('admin', 'Administrator with full system access');

-- ========================================
-- Users Table
-- Each user has exactly one role (one-to-many: a role has many users)
-- ========================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(role_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Admin account (run this AFTER registering admin@example.com on the website)
-- The password must be hashed by the app, so the user is never inserted here.
-- ========================================
-- UPDATE users
-- SET role_id = (SELECT role_id FROM roles WHERE role_name = 'admin')
-- WHERE email = 'admin@example.com';
