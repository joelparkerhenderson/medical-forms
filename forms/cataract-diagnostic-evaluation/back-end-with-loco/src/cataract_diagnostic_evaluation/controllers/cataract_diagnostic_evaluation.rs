#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::cataract_diagnostic_evaluations::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub status: String,
    pub assessment_date: Option<Date>,
    pub assessment_time: Option<String>,
    pub blurred_vision: String,
    pub glare_or_halos: String,
    pub night_driving_difficulty: String,
    pub faded_colour_perception: String,
    pub frequent_prescription_changes: String,
    pub symptom_duration_months: Option<f64>,
    pub symptom_laterality: String,
    pub presenting_complaint_notes: String,
    pub history_diabetes: String,
    pub history_prior_eye_surgery: String,
    pub history_prior_eye_surgery_detail: String,
    pub history_ocular_trauma: String,
    pub history_uveitis: String,
    pub history_steroid_use: String,
    pub history_family_cataract: String,
    pub history_smoking_status: String,
    pub history_high_uv_exposure: String,
    pub history_high_myopia: String,
    pub medical_history_notes: String,
    pub unaided_va_logmar_right: Option<f64>,
    pub unaided_va_logmar_left: Option<f64>,
    pub unaided_va_snellen_right: String,
    pub unaided_va_snellen_left: String,
    pub best_corrected_va_logmar_right: Option<f64>,
    pub best_corrected_va_logmar_left: Option<f64>,
    pub best_corrected_va_snellen_right: String,
    pub best_corrected_va_snellen_left: String,
    pub pinhole_va_logmar_right: Option<f64>,
    pub pinhole_va_logmar_left: Option<f64>,
    pub pinhole_va_snellen_right: String,
    pub pinhole_va_snellen_left: String,
    pub refraction_sphere_right: Option<f64>,
    pub refraction_sphere_left: Option<f64>,
    pub refraction_cylinder_right: Option<f64>,
    pub refraction_cylinder_left: Option<f64>,
    pub refraction_axis_right: Option<i32>,
    pub refraction_axis_left: Option<i32>,
    pub refraction_stability: String,
    pub locs_iii_no_right: Option<f64>,
    pub locs_iii_no_left: Option<f64>,
    pub locs_iii_nc_right: Option<f64>,
    pub locs_iii_nc_left: Option<f64>,
    pub locs_iii_c_right: Option<f64>,
    pub locs_iii_c_left: Option<f64>,
    pub locs_iii_p_right: Option<f64>,
    pub locs_iii_p_left: Option<f64>,
    pub cataract_type_right: String,
    pub cataract_type_left: String,
    pub anterior_chamber_depth_right: String,
    pub anterior_chamber_depth_left: String,
    pub corneal_clarity_right: String,
    pub corneal_clarity_left: String,
    pub pupil_reaction_right: String,
    pub pupil_reaction_left: String,
    pub glare_acuity_result_right: String,
    pub glare_acuity_result_left: String,
    pub glare_functional_impact: String,
    pub intraocular_pressure_right_mmhg: Option<f64>,
    pub intraocular_pressure_left_mmhg: Option<f64>,
    pub tonometry_method: String,
    pub dilated_fundus_exam_performed: String,
    pub optic_disc_cup_disc_ratio_right: Option<f64>,
    pub optic_disc_cup_disc_ratio_left: Option<f64>,
    pub macula_findings_right: String,
    pub macula_findings_left: String,
    pub retinal_findings_right: String,
    pub retinal_findings_left: String,
    pub view_obscured_by_cataract_right: String,
    pub view_obscured_by_cataract_left: String,
    pub glaucoma_suspected: String,
    pub glaucoma_notes: String,
    pub amd_suspected: String,
    pub amd_notes: String,
    pub diabetic_retinopathy_suspected: String,
    pub diabetic_retinopathy_notes: String,
    pub biometry_performed: String,
    pub axial_length_right_mm: Option<f64>,
    pub axial_length_left_mm: Option<f64>,
    pub keratometry_k1_right: Option<f64>,
    pub keratometry_k1_left: Option<f64>,
    pub keratometry_k2_right: Option<f64>,
    pub keratometry_k2_left: Option<f64>,
    pub oct_performed: String,
    pub oct_findings: String,
    pub calculated_iol_power_right: Option<f64>,
    pub calculated_iol_power_left: Option<f64>,
    pub functional_difficulty_reading: Option<i32>,
    pub functional_difficulty_driving: Option<i32>,
    pub functional_difficulty_daily_activities: Option<i32>,
    pub functional_impact_notes: String,
    pub management_recommendation: String,
    pub eye_for_surgery: String,
    pub risks_benefits_counselled: String,
    pub consent_discussed: String,
    pub management_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.status = Set(self.status.clone());
      item.assessment_date = Set(self.assessment_date);
      item.assessment_time = Set(self.assessment_time.clone());
      item.blurred_vision = Set(self.blurred_vision.clone());
      item.glare_or_halos = Set(self.glare_or_halos.clone());
      item.night_driving_difficulty = Set(self.night_driving_difficulty.clone());
      item.faded_colour_perception = Set(self.faded_colour_perception.clone());
      item.frequent_prescription_changes = Set(self.frequent_prescription_changes.clone());
      item.symptom_duration_months = Set(self.symptom_duration_months);
      item.symptom_laterality = Set(self.symptom_laterality.clone());
      item.presenting_complaint_notes = Set(self.presenting_complaint_notes.clone());
      item.history_diabetes = Set(self.history_diabetes.clone());
      item.history_prior_eye_surgery = Set(self.history_prior_eye_surgery.clone());
      item.history_prior_eye_surgery_detail = Set(self.history_prior_eye_surgery_detail.clone());
      item.history_ocular_trauma = Set(self.history_ocular_trauma.clone());
      item.history_uveitis = Set(self.history_uveitis.clone());
      item.history_steroid_use = Set(self.history_steroid_use.clone());
      item.history_family_cataract = Set(self.history_family_cataract.clone());
      item.history_smoking_status = Set(self.history_smoking_status.clone());
      item.history_high_uv_exposure = Set(self.history_high_uv_exposure.clone());
      item.history_high_myopia = Set(self.history_high_myopia.clone());
      item.medical_history_notes = Set(self.medical_history_notes.clone());
      item.unaided_va_logmar_right = Set(self.unaided_va_logmar_right);
      item.unaided_va_logmar_left = Set(self.unaided_va_logmar_left);
      item.unaided_va_snellen_right = Set(self.unaided_va_snellen_right.clone());
      item.unaided_va_snellen_left = Set(self.unaided_va_snellen_left.clone());
      item.best_corrected_va_logmar_right = Set(self.best_corrected_va_logmar_right);
      item.best_corrected_va_logmar_left = Set(self.best_corrected_va_logmar_left);
      item.best_corrected_va_snellen_right = Set(self.best_corrected_va_snellen_right.clone());
      item.best_corrected_va_snellen_left = Set(self.best_corrected_va_snellen_left.clone());
      item.pinhole_va_logmar_right = Set(self.pinhole_va_logmar_right);
      item.pinhole_va_logmar_left = Set(self.pinhole_va_logmar_left);
      item.pinhole_va_snellen_right = Set(self.pinhole_va_snellen_right.clone());
      item.pinhole_va_snellen_left = Set(self.pinhole_va_snellen_left.clone());
      item.refraction_sphere_right = Set(self.refraction_sphere_right);
      item.refraction_sphere_left = Set(self.refraction_sphere_left);
      item.refraction_cylinder_right = Set(self.refraction_cylinder_right);
      item.refraction_cylinder_left = Set(self.refraction_cylinder_left);
      item.refraction_axis_right = Set(self.refraction_axis_right);
      item.refraction_axis_left = Set(self.refraction_axis_left);
      item.refraction_stability = Set(self.refraction_stability.clone());
      item.locs_iii_no_right = Set(self.locs_iii_no_right);
      item.locs_iii_no_left = Set(self.locs_iii_no_left);
      item.locs_iii_nc_right = Set(self.locs_iii_nc_right);
      item.locs_iii_nc_left = Set(self.locs_iii_nc_left);
      item.locs_iii_c_right = Set(self.locs_iii_c_right);
      item.locs_iii_c_left = Set(self.locs_iii_c_left);
      item.locs_iii_p_right = Set(self.locs_iii_p_right);
      item.locs_iii_p_left = Set(self.locs_iii_p_left);
      item.cataract_type_right = Set(self.cataract_type_right.clone());
      item.cataract_type_left = Set(self.cataract_type_left.clone());
      item.anterior_chamber_depth_right = Set(self.anterior_chamber_depth_right.clone());
      item.anterior_chamber_depth_left = Set(self.anterior_chamber_depth_left.clone());
      item.corneal_clarity_right = Set(self.corneal_clarity_right.clone());
      item.corneal_clarity_left = Set(self.corneal_clarity_left.clone());
      item.pupil_reaction_right = Set(self.pupil_reaction_right.clone());
      item.pupil_reaction_left = Set(self.pupil_reaction_left.clone());
      item.glare_acuity_result_right = Set(self.glare_acuity_result_right.clone());
      item.glare_acuity_result_left = Set(self.glare_acuity_result_left.clone());
      item.glare_functional_impact = Set(self.glare_functional_impact.clone());
      item.intraocular_pressure_right_mmhg = Set(self.intraocular_pressure_right_mmhg);
      item.intraocular_pressure_left_mmhg = Set(self.intraocular_pressure_left_mmhg);
      item.tonometry_method = Set(self.tonometry_method.clone());
      item.dilated_fundus_exam_performed = Set(self.dilated_fundus_exam_performed.clone());
      item.optic_disc_cup_disc_ratio_right = Set(self.optic_disc_cup_disc_ratio_right);
      item.optic_disc_cup_disc_ratio_left = Set(self.optic_disc_cup_disc_ratio_left);
      item.macula_findings_right = Set(self.macula_findings_right.clone());
      item.macula_findings_left = Set(self.macula_findings_left.clone());
      item.retinal_findings_right = Set(self.retinal_findings_right.clone());
      item.retinal_findings_left = Set(self.retinal_findings_left.clone());
      item.view_obscured_by_cataract_right = Set(self.view_obscured_by_cataract_right.clone());
      item.view_obscured_by_cataract_left = Set(self.view_obscured_by_cataract_left.clone());
      item.glaucoma_suspected = Set(self.glaucoma_suspected.clone());
      item.glaucoma_notes = Set(self.glaucoma_notes.clone());
      item.amd_suspected = Set(self.amd_suspected.clone());
      item.amd_notes = Set(self.amd_notes.clone());
      item.diabetic_retinopathy_suspected = Set(self.diabetic_retinopathy_suspected.clone());
      item.diabetic_retinopathy_notes = Set(self.diabetic_retinopathy_notes.clone());
      item.biometry_performed = Set(self.biometry_performed.clone());
      item.axial_length_right_mm = Set(self.axial_length_right_mm);
      item.axial_length_left_mm = Set(self.axial_length_left_mm);
      item.keratometry_k1_right = Set(self.keratometry_k1_right);
      item.keratometry_k1_left = Set(self.keratometry_k1_left);
      item.keratometry_k2_right = Set(self.keratometry_k2_right);
      item.keratometry_k2_left = Set(self.keratometry_k2_left);
      item.oct_performed = Set(self.oct_performed.clone());
      item.oct_findings = Set(self.oct_findings.clone());
      item.calculated_iol_power_right = Set(self.calculated_iol_power_right);
      item.calculated_iol_power_left = Set(self.calculated_iol_power_left);
      item.functional_difficulty_reading = Set(self.functional_difficulty_reading);
      item.functional_difficulty_driving = Set(self.functional_difficulty_driving);
      item.functional_difficulty_daily_activities = Set(self.functional_difficulty_daily_activities);
      item.functional_impact_notes = Set(self.functional_impact_notes.clone());
      item.management_recommendation = Set(self.management_recommendation.clone());
      item.eye_for_surgery = Set(self.eye_for_surgery.clone());
      item.risks_benefits_counselled = Set(self.risks_benefits_counselled.clone());
      item.consent_discussed = Set(self.consent_discussed.clone());
      item.management_notes = Set(self.management_notes.clone());
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

#[debug_handler]
pub async fn update(
    Path(id): Path<i64>,
    State(ctx): State<AppContext>,
    Json(params): Json<Params>,
) -> Result<Response> {
    let item = load_item(&ctx, id).await?;
    let mut item = item.into_active_model();
    params.update(&mut item);
    let item = item.update(&ctx.db).await?;
    format::json(item)
}

#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/cataract_diagnostic_evaluations/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
