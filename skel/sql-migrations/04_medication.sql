-- Medicine

CREATE TABLE medication (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    international_nonproprietary_name TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
);

CREATE TRIGGER trigger_medication_updated_at
    BEFORE UPDATE ON medication
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE medication IS
    'Medicine';
COMMENT ON COLUMN medication.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN medication.created_at IS
    'Timestamp when the record was created.';
COMMENT ON COLUMN medication.updated_at IS
    'Timestamp when the record was updated.';
COMMENT ON COLUMN medication.deleted_at IS
    'Timestamp when the record was deleted.';
COMMENT ON COLUMN medication.international_nonproprietary_name IS
    'International Nonproprietary Name (INN) of the medication, as designated by the WHO.';
COMMENT ON COLUMN medication.description IS
    'Description of the medication, including its uses and properties.';

CREATE INDEX medication_index_gto
    ON medication
    USING GIN ((
        international_nonproprietary_name
            || ' ' ||
        description
    ) gin_trgm_ops);
