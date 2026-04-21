# Plan: Hematology Assessment

## Current status

Not yet implemented. Directory structure exists but no code has been written.

## Implementation plan

Follow the same patterns as dermatology-assessment (canonical template):

1. Create front-end-form-with-svelte/ with all engine files, step components, and routes
2. Create front-end-dashboard-with-svelte/ with SVAR DataGrid
3. Create back-end-with-rust-axum-loco-json/ with Rust engine types
4. Add Vitest unit tests for grading logic

## Planned scoring system

CBC interpretation with anaemia classification (iron-deficiency, B12/folate, chronic disease, haemolytic), coagulation screen assessment, and white cell differential analysis. The scoring engine should flag critical values requiring urgent intervention.

## Planned steps

1. Demographics
2. Presenting Symptoms (fatigue, bruising, bleeding, infections)
3. Bleeding History (epistaxis, menorrhagia, surgical bleeding)
4. CBC Results (Hb, WCC, platelets, MCV, MCH, MCHC)
5. Iron Studies (ferritin, serum iron, TIBC, transferrin saturation)
6. Coagulation Screen (PT, APTT, fibrinogen, D-dimer)
7. Blood Film (morphology, reticulocytes)
8. Transfusion History
9. Current Medications (anticoagulants, antiplatelets, iron supplements)
10. Comorbidities (liver disease, renal disease, malignancy)
