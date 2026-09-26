-- =============================================================
-- V3__demo_user.sql
-- Creates a demo admin account for hackathon demonstration.
-- Password: "admin123" hashed with BCrypt (cost 10).
-- =============================================================

INSERT INTO users (name, email, password, active)
VALUES (
    'Admin User',
    'admin@stocksense.io',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    true
);

-- Assign ROLE_ADMIN
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'admin@stocksense.io' AND r.name = 'ROLE_ADMIN';
