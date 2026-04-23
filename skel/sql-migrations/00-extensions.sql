-- Enable required extensions and create shared trigger function.

-- pgcrypto provides gen_random_uuid() for UUID primary key generation.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- set_updated_at() is a reusable trigger function that sets the updated_at
-- column to the current timestamp whenever a row is modified.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION set_updated_at() IS
    'Trigger function that sets updated_at to now() on every UPDATE.';
