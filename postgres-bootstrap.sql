-- Run this script as a PostgreSQL superuser (e.g. postgres)
-- Creates the app role and database expected by City-V.

DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'cityv_user') THEN
        CREATE ROLE cityv_user LOGIN PASSWORD 'cityv_secret';
    END IF;
END
$$;

DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cityv') THEN
        CREATE DATABASE cityv OWNER cityv_user;
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE cityv TO cityv_user;
