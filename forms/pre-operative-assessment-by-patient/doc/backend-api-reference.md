# Backend API Reference

REST API documentation for the Pre-Operative Assessment backend, built with Rust, Axum, and the Loco framework.

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | Loco (Axum-based) | Opinionated Rust web framework |
| ORM | SeaORM | Async ORM for PostgreSQL |
| Language | Rust (edition 2024) | Memory-safe systems language |
| Database | PostgreSQL 18 | Primary data store |
| Serialization | serde + serde_json | JSON request/response handling |
| UUID | uuid v4 | Primary key generation |

---

## Base URL

- Development: `http://localhost:5150`
- Production: configured via `$HOST` and `$PORT` environment variables

---

## Endpoints

### Assessments

#### Create Assessment

```
POST /api/assessments
```

**Request Body:** JSON `AssessmentData` object, or empty `{}` for a blank draft.

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "data": { ... },
  "result": null,
  "status": "draft",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

#### List Assessments (Paginated)

```
GET /api/assessments?page=0&per_page=20
```

**Query Parameters:**
- `page` (optional, default `0`): Zero-indexed page number
- `per_page` (optional, default `20`): Items per page

**Response:** `200 OK`
```json
{
  "items": [ ... ],
  "page": 0,
  "per_page": 20
}
```

#### Get Single Assessment

```
GET /api/assessments/{id}
```

**Response:** `200 OK` with `AssessmentResponse`, or `404 Not Found`.

#### Update Assessment

```
PUT /api/assessments/{id}
```

**Request Body:** JSON `AssessmentData` object (replaces existing data).

**Response:** `200 OK` with updated `AssessmentResponse`.

#### Delete Assessment

```
DELETE /api/assessments/{id}
```

**Response:** `200 OK` with empty body.

#### Grade Assessment

```
POST /api/assessments/{id}/grade
```

Runs the ASA grading engine against the stored assessment data. Saves the result and sets status to `"graded"`.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "asa_grade": 2,
  "fired_rules": [
    {
      "id": "CV-001",
      "system": "Cardiovascular",
      "description": "Controlled hypertension",
      "grade": 2
    }
  ],
  "additional_flags": [
    {
      "id": "FLAG-AIRWAY-001",
      "category": "Airway",
      "message": "Difficult airway anticipated",
      "priority": "high"
    }
  ],
  "timestamp": "2025-01-01T00:00:00+00:00"
}
```

### Reports

#### Generate Text Report

```
POST /api/reports/text
```

**Request Body:**
```json
{
  "data": { ... }  // AssessmentData object
}
```

**Response:** `200 OK` with `Content-Type: text/plain` attachment.

---

## Data Model

### AssessmentData

The `AssessmentData` structure mirrors the frontend TypeScript interfaces. It contains nested objects for each body system assessment:

- `demographics` - Name, DOB, weight, height, BMI, planned procedure
- `cardiovascular` - Hypertension, IHD, heart failure, valvular disease, arrhythmia, pacemaker, recent MI
- `respiratory` - Asthma, COPD, OSA, smoking status
- `renal` - CKD, dialysis
- `hepatic` - Liver disease, cirrhosis, Child-Pugh score
- `endocrine` - Diabetes, thyroid, adrenal insufficiency
- `neurological` - Stroke/TIA, epilepsy, neuromuscular disease, raised ICP
- `haematological` - Bleeding disorders, anticoagulants, sickle cell, anaemia
- `musculoskeletal_airway` - Difficult airway indicators, cervical spine, mouth opening
- `gastrointestinal` - GORD, hiatus hernia
- `medications` - Array of medication entries
- `allergies` - Array of allergy entries
- `previous_anaesthesia` - Prior anaesthesia history, complications
- `social_history` - Alcohol, smoking, recreational drugs
- `functional_capacity` - Exercise tolerance, estimated METs
- `pregnancy` - Pregnancy status, gestation weeks

### Conventions

- **Empty strings** (`""`) represent unanswered fields (matches TypeScript/frontend convention)
- **`null`** used for numeric fields that are not applicable (e.g., BMI when height/weight not entered)
- **snake_case** field names in Rust/API (camelCase in frontend TypeScript)

---

## ASA Grading Engine

The backend contains a complete port of the frontend grading engine:

- **42 ASA rules** across 11 body systems
- **Safety flag detection** for 20+ alert categories
- **Utility functions** for BMI, METs, age calculations

The engine is invoked via the `POST /api/assessments/{id}/grade` endpoint and stores results in the assessment record.

---

## Configuration

### Environment Variables (Production)

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port |
| `HOST` | Server host URL |
| `DATABASE_URL` | PostgreSQL connection string |
| `FRONTEND_URL` | Allowed CORS origin |

### Config Files

- `config/development.yaml` - Local development settings
- `config/production.yaml` - Production settings with CORS
- `config/test.yaml` - Test environment settings

---

## Database

The backend currently uses a simplified JSONB schema with a single `assessments` table. The full normalized schema (23 tables in `./db/`) defines the target architecture. The JSONB approach stores assessment data and grading results as JSON values, with the ASA rules evaluated in application code.

### Migration

Located in `migration/src/m20260227_000001_create_assessments.rs`. Run automatically on startup when `auto_migrate: true` is set in config.

---

## Error Handling

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad Request (invalid assessment data) |
| 404 | Assessment not found |
| 500 | Internal server error |

Error responses include a descriptive message in the response body.
