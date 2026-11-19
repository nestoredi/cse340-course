-- ============================================================
-- CSE 340 Service Network - database setup
-- Run this whole file in pgAdmin (Query Tool) to re-create the database.
-- ============================================================

-- Drop in reverse dependency order so the script can be re-run safely
DROP TABLE IF EXISTS project_category;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS organization;

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
-- Project Table (one organization sponsors many projects)
-- ========================================
CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(200) NOT NULL,
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
-- Bridge table: many-to-many between projects and categories
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
-- ========================================
INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES
('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');

-- ========================================
-- Insert sample data: Categories
-- ========================================
INSERT INTO category (name)
VALUES
('Environmental'),
('Educational'),
('Community Service'),
('Health and Wellness');

-- ========================================
-- Insert sample data: Projects (5 per organization)
-- ========================================
INSERT INTO project (organization_id, title, description, location, project_date)
VALUES
-- BrightFuture Builders (organization 1)
(1, 'Neighborhood Playground Build', 'Volunteers assemble a new accessible playground, including swings, a climbing wall and safe rubber flooring.', 'Maple Park, Riverside', '2026-12-05'),
(1, 'Community Center Roof Repair', 'Repair and weatherproof the roof of the community center so it can stay open through winter.', 'Oak Street Community Center', '2026-12-19'),
(1, 'Accessible Ramp Installation', 'Build wheelchair ramps for the homes of senior neighbors who have difficulty entering their houses.', 'Elm Avenue Neighborhood', '2027-01-16'),
(1, 'Community Garden Fence', 'Install a sturdy fence and raised-bed borders around the new shared community garden.', 'Willow Lane Lot', '2027-02-06'),
(1, 'Bus Shelter Construction', 'Construct two covered bus shelters with benches to protect commuters from rain and sun.', 'Main Street Transit Stop', '2027-03-13'),

-- GreenHarvest Growers (organization 2)
(2, 'Rooftop Garden Workshop', 'Learn how to plant, water and harvest vegetables on a rooftop, with starter kits for every family.', 'Downtown Library Rooftop', '2026-12-12'),
(2, 'Urban Compost Training', 'A hands-on class on turning kitchen scraps into compost for neighborhood gardens.', 'Cedar Street Learning Garden', '2027-01-09'),
(2, 'Neighborhood Tree Planting', 'Plant fifty native trees along streets that currently have little shade.', 'Birch Boulevard', '2027-01-30'),
(2, 'Seed Swap and Kids Gardening Day', 'Families trade seeds and children plant their first herb pots with guidance from volunteers.', 'Riverside Community Hall', '2027-02-20'),
(2, 'Fresh Produce Distribution', 'Harvest and distribute fresh vegetables to families who need them, at no cost.', 'Harvest Hub Market Square', '2027-03-27'),

-- UnityServe Volunteers (organization 3)
(3, 'Food Pantry Sorting Day', 'Sort and pack donated food so it can be delivered to local families this holiday season.', 'Unity Food Pantry', '2026-12-08'),
(3, 'Winter Coat Drive', 'Collect, clean and hand out warm coats and blankets to people facing the cold months.', 'Grace Church Hall', '2026-12-15'),
(3, 'Senior Companion Visits', 'Volunteers spend an afternoon with seniors for conversation, board games and a shared meal.', 'Sunset Care Home', '2027-01-23'),
(3, 'Free Health Screening Fair', 'Partner nurses provide free blood pressure and vision checks, plus healthy-living advice.', 'City Recreation Center', '2027-02-13'),
(3, 'After-School Tutoring Night', 'Volunteers help students with reading and math homework in a friendly, supportive setting.', 'Lincoln Elementary Library', '2027-03-06');

-- ========================================
-- Associate every project with at least one category
-- (1 Environmental, 2 Educational, 3 Community Service, 4 Health and Wellness)
-- ========================================
INSERT INTO project_category (project_id, category_id)
VALUES
(1, 3), (1, 4),
(2, 3),
(3, 3), (3, 4),
(4, 1), (4, 3),
(5, 3),
(6, 1), (6, 2),
(7, 1), (7, 2),
(8, 1), (8, 3),
(9, 2), (9, 3),
(10, 3), (10, 4),
(11, 3),
(12, 3), (12, 4),
(13, 3), (13, 4),
(14, 4), (14, 3),
(15, 2), (15, 3);

-- Verify the data
-- SELECT * FROM organization;
-- SELECT * FROM project;
-- SELECT * FROM category;
-- SELECT * FROM project_category;
