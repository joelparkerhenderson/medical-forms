CREATE TABLE assessment_family_pedigree_member (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    family_pedigree_id UUID NOT NULL
        REFERENCES assessment_family_pedigree(id) ON DELETE CASCADE,

    relationship VARCHAR(50) NOT NULL DEFAULT '',
    sex VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (sex IN ('male', 'female', 'other', '')),
    age INTEGER
        CHECK (age IS NULL OR (age >= 0 AND age <= 120)),
    alive VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (alive IN ('yes', 'no', '')),
    age_at_death INTEGER
        CHECK (age_at_death IS NULL OR (age_at_death >= 0 AND age_at_death <= 120)),
    cause_of_death VARCHAR(255) NOT NULL DEFAULT '',
    medical_conditions TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_family_pedigree_member_updated_at
    BEFORE UPDATE ON assessment_family_pedigree_member
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_family_pedigree IS
    'Family pedigree section: family structure, consanguinity, and adoption status. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_family_pedigree.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_family_pedigree.total_first_degree_relatives IS
    'Number of first-degree relatives (parents, siblings, children).';
COMMENT ON COLUMN assessment_family_pedigree.total_second_degree_relatives IS
    'Number of second-degree relatives (grandparents, aunts, uncles, nieces, nephews).';
COMMENT ON COLUMN assessment_family_pedigree.consanguinity_in_family IS
    'Whether consanguinity (blood relatives marrying) exists in the family: yes, no, or empty string.';
COMMENT ON COLUMN assessment_family_pedigree.consanguinity_details IS
    'Details of consanguineous relationships.';
COMMENT ON COLUMN assessment_family_pedigree.adoption_status IS
    'Adoption status: not-adopted, adopted-known-history, adopted-unknown-history, or empty string.';
COMMENT ON COLUMN assessment_family_pedigree.pedigree_notes IS
    'Free-text notes about the family pedigree.';
COMMENT ON COLUMN assessment_family_pedigree.three_generation_pedigree_drawn IS
    'Whether a three-generation pedigree has been drawn: yes, no, or empty string.';
COMMENT ON TABLE assessment_family_pedigree_member IS
    'Individual family member within the pedigree.';
COMMENT ON COLUMN assessment_family_pedigree_member.relationship IS
    'Relationship to the patient (e.g. mother, paternal grandfather).';
COMMENT ON COLUMN assessment_family_pedigree_member.sex IS
    'Sex: male, female, other, or empty string.';
COMMENT ON COLUMN assessment_family_pedigree_member.age IS
    'Current age in years, NULL if unknown.';
COMMENT ON COLUMN assessment_family_pedigree_member.alive IS
    'Whether the relative is alive: yes, no, or empty string.';
COMMENT ON COLUMN assessment_family_pedigree_member.age_at_death IS
    'Age at death in years, NULL if alive or unknown.';
COMMENT ON COLUMN assessment_family_pedigree_member.cause_of_death IS
    'Cause of death if deceased.';
COMMENT ON COLUMN assessment_family_pedigree_member.medical_conditions IS
    'Free-text list of medical conditions relevant to genetics.';
COMMENT ON COLUMN assessment_family_pedigree_member.sort_order IS
    'Display order within the pedigree list.';

COMMENT ON COLUMN assessment_family_pedigree.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_family_pedigree.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_family_pedigree.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN assessment_family_pedigree_member.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_family_pedigree_member.family_pedigree_id IS
    'Foreign key to the assessment_family_pedigree table.';
COMMENT ON COLUMN assessment_family_pedigree_member.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_family_pedigree_member.updated_at IS
    'Timestamp when this row was last updated.';
