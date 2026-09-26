-- =============================================================
-- V4__password_reset_otp.sql
-- StockSense IMS — Password Reset OTP table
-- =============================================================

CREATE TABLE password_reset_otps (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(150) NOT NULL,
    otp_hash    VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    verified    BOOLEAN NOT NULL DEFAULT FALSE,
    used        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_otps_email ON password_reset_otps(email);
