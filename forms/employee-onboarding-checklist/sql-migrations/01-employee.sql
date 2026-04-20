-- 01_employee.sql
-- Employee demographic information.

CREATE TABLE employee (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    nhs_number VARCHAR(20) UNIQUE,
    email VARCHAR(255) NOT NULL DEFAULT '',
    phone VARCHAR(30) NOT NULL DEFAULT '',
    job_title VARCHAR(255) NOT NULL DEFAULT '',
    department VARCHAR(255) NOT NULL DEFAULT '',
    start_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_employee_updated_at
    BEFORE UPDATE ON employee
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE employee IS
    'Employee demographic information for healthcare staff onboarding.';
COMMENT ON COLUMN employee.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN employee.first_name IS
    'Employee given name.';
COMMENT ON COLUMN employee.last_name IS
    'Employee family name.';
COMMENT ON COLUMN employee.date_of_birth IS
    'Employee date of birth.';
COMMENT ON COLUMN employee.nhs_number IS
    'NHS number, unique per employee.';
COMMENT ON COLUMN employee.email IS
    'Employee email address.';
COMMENT ON COLUMN employee.phone IS
    'Employee phone number.';
COMMENT ON COLUMN employee.job_title IS
    'Job title for the role being onboarded.';
COMMENT ON COLUMN employee.department IS
    'Department or ward the employee will join.';
COMMENT ON COLUMN employee.start_date IS
    'Agreed start date for the role.';
