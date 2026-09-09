#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::mental_health_act_assessments::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub location: String,
    pub referral_source: String,
    pub reason_for_assessment: String,
    pub person_identifier: String,
    pub age_band: String,
    pub sex: String,
    pub first_language: String,
    pub amhp_name: String,
    pub amhp_approved: String,
    pub doctor1_name: String,
    pub doctor1_gmc_number: String,
    pub doctor1_section12_approved: String,
    pub doctor1_examined_at: Option<DateTimeWithTimeZone>,
    pub doctor2_name: String,
    pub doctor2_gmc_number: String,
    pub doctor2_section12_approved: String,
    pub doctor2_examined_at: Option<DateTimeWithTimeZone>,
    pub prior_acquaintance: String,
    pub mental_disorder_present: String,
    pub mental_disorder_evidence: String,
    pub risk_to_own_health: String,
    pub risk_to_own_safety: String,
    pub risk_to_others: String,
    pub risk_evidence: String,
    pub risk_imminence: String,
    pub least_restrictive_met: String,
    pub alternatives_considered: String,
    pub appropriate_treatment_available: String,
    pub treatment_plan_summary: String,
    pub nearest_relative_identified: String,
    pub nearest_relative_consulted: String,
    pub nearest_relative_objection: String,
    pub consultation_record: String,
    pub recommended_section: String,
    pub outcome: String,
    pub bed_identified: String,
    pub conveyance: String,
    pub clinical_legal_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.assessed_at = Set(self.assessed_at);
      item.location = Set(self.location.clone());
      item.referral_source = Set(self.referral_source.clone());
      item.reason_for_assessment = Set(self.reason_for_assessment.clone());
      item.person_identifier = Set(self.person_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.sex = Set(self.sex.clone());
      item.first_language = Set(self.first_language.clone());
      item.amhp_name = Set(self.amhp_name.clone());
      item.amhp_approved = Set(self.amhp_approved.clone());
      item.doctor1_name = Set(self.doctor1_name.clone());
      item.doctor1_gmc_number = Set(self.doctor1_gmc_number.clone());
      item.doctor1_section12_approved = Set(self.doctor1_section12_approved.clone());
      item.doctor1_examined_at = Set(self.doctor1_examined_at);
      item.doctor2_name = Set(self.doctor2_name.clone());
      item.doctor2_gmc_number = Set(self.doctor2_gmc_number.clone());
      item.doctor2_section12_approved = Set(self.doctor2_section12_approved.clone());
      item.doctor2_examined_at = Set(self.doctor2_examined_at);
      item.prior_acquaintance = Set(self.prior_acquaintance.clone());
      item.mental_disorder_present = Set(self.mental_disorder_present.clone());
      item.mental_disorder_evidence = Set(self.mental_disorder_evidence.clone());
      item.risk_to_own_health = Set(self.risk_to_own_health.clone());
      item.risk_to_own_safety = Set(self.risk_to_own_safety.clone());
      item.risk_to_others = Set(self.risk_to_others.clone());
      item.risk_evidence = Set(self.risk_evidence.clone());
      item.risk_imminence = Set(self.risk_imminence.clone());
      item.least_restrictive_met = Set(self.least_restrictive_met.clone());
      item.alternatives_considered = Set(self.alternatives_considered.clone());
      item.appropriate_treatment_available = Set(self.appropriate_treatment_available.clone());
      item.treatment_plan_summary = Set(self.treatment_plan_summary.clone());
      item.nearest_relative_identified = Set(self.nearest_relative_identified.clone());
      item.nearest_relative_consulted = Set(self.nearest_relative_consulted.clone());
      item.nearest_relative_objection = Set(self.nearest_relative_objection.clone());
      item.consultation_record = Set(self.consultation_record.clone());
      item.recommended_section = Set(self.recommended_section.clone());
      item.outcome = Set(self.outcome.clone());
      item.bed_identified = Set(self.bed_identified.clone());
      item.conveyance = Set(self.conveyance.clone());
      item.clinical_legal_note = Set(self.clinical_legal_note.clone());
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
        .prefix("api/mental_health_act_assessments/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
