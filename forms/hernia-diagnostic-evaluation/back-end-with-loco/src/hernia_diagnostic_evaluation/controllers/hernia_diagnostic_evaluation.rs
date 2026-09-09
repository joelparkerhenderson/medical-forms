#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::hernia_diagnostic_evaluations::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub status: String,
    pub assessment_date: Option<Date>,
    pub assessment_time: Option<String>,
    pub site_name: String,
    pub duration_of_bulge: String,
    pub pain_score_0_10: Option<i32>,
    pub pain_onset: String,
    pub aggravated_by_straining: String,
    pub aggravated_by_lifting: String,
    pub aggravated_by_coughing: String,
    pub prior_hernia_history: String,
    pub prior_hernia_repair: String,
    pub prior_hernia_repair_mesh: String,
    pub prior_hernia_repair_site: String,
    pub history_notes: String,
    pub risk_chronic_cough: String,
    pub risk_constipation_or_straining: String,
    pub risk_heavy_lifting_occupation: String,
    pub risk_obesity: String,
    pub risk_smoking: String,
    pub risk_family_history: String,
    pub risk_prior_abdominal_surgery: String,
    pub risk_pregnancy: String,
    pub risk_connective_tissue_disorder: String,
    pub risk_ascites: String,
    pub risk_factors_notes: String,
    pub inspection_location: String,
    pub inspection_location_other: String,
    pub bulge_visible_at_rest: String,
    pub bulge_enlarges_on_standing_or_straining: String,
    pub skin_changes: String,
    pub inspection_notes: String,
    pub palpable_mass: String,
    pub cough_impulse_positive: String,
    pub tenderness: String,
    pub mass_size_as_cm: Option<f64>,
    pub palpation_notes: String,
    pub reducibility_status: String,
    pub reduces_spontaneously: String,
    pub reduces_with_manual_pressure: String,
    pub does_not_reduce: String,
    pub reducibility_notes: String,
    pub red_flag_severe_pain: String,
    pub red_flag_vomiting: String,
    pub red_flag_fever: String,
    pub red_flag_absolute_constipation: String,
    pub red_flag_erythema_or_discolouration: String,
    pub red_flag_previously_reducible_now_irreducible: String,
    pub red_flag_tachycardia: String,
    pub red_flag_notes: String,
    pub hernia_type: String,
    pub hernia_type_other: String,
    pub inguinal_subtype: String,
    pub laterality: String,
    pub ehs_size_grade: String,
    pub classification_notes: String,
    pub ultrasound_performed: String,
    pub ultrasound_findings: String,
    pub ct_performed: String,
    pub ct_findings: String,
    pub mri_performed: String,
    pub mri_findings: String,
    pub imaging_indication: String,
    pub imaging_notes: String,
    pub differential_lipoma: String,
    pub differential_lymphadenopathy: String,
    pub differential_hydrocele: String,
    pub differential_undescended_testis: String,
    pub differential_femoral_aneurysm: String,
    pub differential_abscess: String,
    pub differential_other: String,
    pub differential_notes: String,
    pub pain_interferes_with_work_or_activity: String,
    pub functional_impact_scale_0_10: Option<i32>,
    pub activity_limitation: String,
    pub management_plan: String,
    pub conservative_detail: String,
    pub referral_made: String,
    pub referral_target_timeframe: String,
    pub management_notes: String,
    pub additional_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.status = Set(self.status.clone());
      item.assessment_date = Set(self.assessment_date);
      item.assessment_time = Set(self.assessment_time.clone());
      item.site_name = Set(self.site_name.clone());
      item.duration_of_bulge = Set(self.duration_of_bulge.clone());
      item.pain_score_0_10 = Set(self.pain_score_0_10);
      item.pain_onset = Set(self.pain_onset.clone());
      item.aggravated_by_straining = Set(self.aggravated_by_straining.clone());
      item.aggravated_by_lifting = Set(self.aggravated_by_lifting.clone());
      item.aggravated_by_coughing = Set(self.aggravated_by_coughing.clone());
      item.prior_hernia_history = Set(self.prior_hernia_history.clone());
      item.prior_hernia_repair = Set(self.prior_hernia_repair.clone());
      item.prior_hernia_repair_mesh = Set(self.prior_hernia_repair_mesh.clone());
      item.prior_hernia_repair_site = Set(self.prior_hernia_repair_site.clone());
      item.history_notes = Set(self.history_notes.clone());
      item.risk_chronic_cough = Set(self.risk_chronic_cough.clone());
      item.risk_constipation_or_straining = Set(self.risk_constipation_or_straining.clone());
      item.risk_heavy_lifting_occupation = Set(self.risk_heavy_lifting_occupation.clone());
      item.risk_obesity = Set(self.risk_obesity.clone());
      item.risk_smoking = Set(self.risk_smoking.clone());
      item.risk_family_history = Set(self.risk_family_history.clone());
      item.risk_prior_abdominal_surgery = Set(self.risk_prior_abdominal_surgery.clone());
      item.risk_pregnancy = Set(self.risk_pregnancy.clone());
      item.risk_connective_tissue_disorder = Set(self.risk_connective_tissue_disorder.clone());
      item.risk_ascites = Set(self.risk_ascites.clone());
      item.risk_factors_notes = Set(self.risk_factors_notes.clone());
      item.inspection_location = Set(self.inspection_location.clone());
      item.inspection_location_other = Set(self.inspection_location_other.clone());
      item.bulge_visible_at_rest = Set(self.bulge_visible_at_rest.clone());
      item.bulge_enlarges_on_standing_or_straining = Set(self.bulge_enlarges_on_standing_or_straining.clone());
      item.skin_changes = Set(self.skin_changes.clone());
      item.inspection_notes = Set(self.inspection_notes.clone());
      item.palpable_mass = Set(self.palpable_mass.clone());
      item.cough_impulse_positive = Set(self.cough_impulse_positive.clone());
      item.tenderness = Set(self.tenderness.clone());
      item.mass_size_as_cm = Set(self.mass_size_as_cm);
      item.palpation_notes = Set(self.palpation_notes.clone());
      item.reducibility_status = Set(self.reducibility_status.clone());
      item.reduces_spontaneously = Set(self.reduces_spontaneously.clone());
      item.reduces_with_manual_pressure = Set(self.reduces_with_manual_pressure.clone());
      item.does_not_reduce = Set(self.does_not_reduce.clone());
      item.reducibility_notes = Set(self.reducibility_notes.clone());
      item.red_flag_severe_pain = Set(self.red_flag_severe_pain.clone());
      item.red_flag_vomiting = Set(self.red_flag_vomiting.clone());
      item.red_flag_fever = Set(self.red_flag_fever.clone());
      item.red_flag_absolute_constipation = Set(self.red_flag_absolute_constipation.clone());
      item.red_flag_erythema_or_discolouration = Set(self.red_flag_erythema_or_discolouration.clone());
      item.red_flag_previously_reducible_now_irreducible = Set(self.red_flag_previously_reducible_now_irreducible.clone());
      item.red_flag_tachycardia = Set(self.red_flag_tachycardia.clone());
      item.red_flag_notes = Set(self.red_flag_notes.clone());
      item.hernia_type = Set(self.hernia_type.clone());
      item.hernia_type_other = Set(self.hernia_type_other.clone());
      item.inguinal_subtype = Set(self.inguinal_subtype.clone());
      item.laterality = Set(self.laterality.clone());
      item.ehs_size_grade = Set(self.ehs_size_grade.clone());
      item.classification_notes = Set(self.classification_notes.clone());
      item.ultrasound_performed = Set(self.ultrasound_performed.clone());
      item.ultrasound_findings = Set(self.ultrasound_findings.clone());
      item.ct_performed = Set(self.ct_performed.clone());
      item.ct_findings = Set(self.ct_findings.clone());
      item.mri_performed = Set(self.mri_performed.clone());
      item.mri_findings = Set(self.mri_findings.clone());
      item.imaging_indication = Set(self.imaging_indication.clone());
      item.imaging_notes = Set(self.imaging_notes.clone());
      item.differential_lipoma = Set(self.differential_lipoma.clone());
      item.differential_lymphadenopathy = Set(self.differential_lymphadenopathy.clone());
      item.differential_hydrocele = Set(self.differential_hydrocele.clone());
      item.differential_undescended_testis = Set(self.differential_undescended_testis.clone());
      item.differential_femoral_aneurysm = Set(self.differential_femoral_aneurysm.clone());
      item.differential_abscess = Set(self.differential_abscess.clone());
      item.differential_other = Set(self.differential_other.clone());
      item.differential_notes = Set(self.differential_notes.clone());
      item.pain_interferes_with_work_or_activity = Set(self.pain_interferes_with_work_or_activity.clone());
      item.functional_impact_scale_0_10 = Set(self.functional_impact_scale_0_10);
      item.activity_limitation = Set(self.activity_limitation.clone());
      item.management_plan = Set(self.management_plan.clone());
      item.conservative_detail = Set(self.conservative_detail.clone());
      item.referral_made = Set(self.referral_made.clone());
      item.referral_target_timeframe = Set(self.referral_target_timeframe.clone());
      item.management_notes = Set(self.management_notes.clone());
      item.additional_notes = Set(self.additional_notes.clone());
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
        .prefix("api/hernia_diagnostic_evaluations/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
