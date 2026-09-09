#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::epilepsy_reviews::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub reviewer_name: String,
    pub reviewer_role: String,
    pub reviewed_at: Option<Date>,
    pub care_setting: String,
    pub review_type: String,
    pub months_since_last_review: Option<f64>,
    pub patient_identifier: String,
    pub age_band: String,
    pub sex: String,
    pub epilepsy_type: String,
    pub age_at_onset: Option<f64>,
    pub years_since_diagnosis: Option<f64>,
    pub learning_disability: String,
    pub seizure_types: String,
    pub seizure_frequency: String,
    pub last_seizure_date: Option<Date>,
    pub seizure_free_months: Option<f64>,
    pub seizure_trend: String,
    pub current_asms: String,
    pub asm_adherence: String,
    pub asm_side_effects: String,
    pub drug_level: Option<f64>,
    pub triggers: String,
    pub sudep_discussed: String,
    pub status_epilepticus: String,
    pub seizure_injury: String,
    pub dvla_eligible: String,
    pub currently_driving: String,
    pub bathing_advice_given: String,
    pub woman_of_childbearing_potential: String,
    pub on_valproate: String,
    pub pregnancy_prevention_programme: String,
    pub folic_acid: String,
    pub contraception_interaction_reviewed: String,
    pub mental_health_concern: String,
    pub specialist_review_needed: String,
    pub next_review_due: Option<Date>,
    pub care_plan: String,
    pub review_context: String,
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.reviewer_name = Set(self.reviewer_name.clone());
      item.reviewer_role = Set(self.reviewer_role.clone());
      item.reviewed_at = Set(self.reviewed_at);
      item.care_setting = Set(self.care_setting.clone());
      item.review_type = Set(self.review_type.clone());
      item.months_since_last_review = Set(self.months_since_last_review);
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.sex = Set(self.sex.clone());
      item.epilepsy_type = Set(self.epilepsy_type.clone());
      item.age_at_onset = Set(self.age_at_onset);
      item.years_since_diagnosis = Set(self.years_since_diagnosis);
      item.learning_disability = Set(self.learning_disability.clone());
      item.seizure_types = Set(self.seizure_types.clone());
      item.seizure_frequency = Set(self.seizure_frequency.clone());
      item.last_seizure_date = Set(self.last_seizure_date);
      item.seizure_free_months = Set(self.seizure_free_months);
      item.seizure_trend = Set(self.seizure_trend.clone());
      item.current_asms = Set(self.current_asms.clone());
      item.asm_adherence = Set(self.asm_adherence.clone());
      item.asm_side_effects = Set(self.asm_side_effects.clone());
      item.drug_level = Set(self.drug_level);
      item.triggers = Set(self.triggers.clone());
      item.sudep_discussed = Set(self.sudep_discussed.clone());
      item.status_epilepticus = Set(self.status_epilepticus.clone());
      item.seizure_injury = Set(self.seizure_injury.clone());
      item.dvla_eligible = Set(self.dvla_eligible.clone());
      item.currently_driving = Set(self.currently_driving.clone());
      item.bathing_advice_given = Set(self.bathing_advice_given.clone());
      item.woman_of_childbearing_potential = Set(self.woman_of_childbearing_potential.clone());
      item.on_valproate = Set(self.on_valproate.clone());
      item.pregnancy_prevention_programme = Set(self.pregnancy_prevention_programme.clone());
      item.folic_acid = Set(self.folic_acid.clone());
      item.contraception_interaction_reviewed = Set(self.contraception_interaction_reviewed.clone());
      item.mental_health_concern = Set(self.mental_health_concern.clone());
      item.specialist_review_needed = Set(self.specialist_review_needed.clone());
      item.next_review_due = Set(self.next_review_due);
      item.care_plan = Set(self.care_plan.clone());
      item.review_context = Set(self.review_context.clone());
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
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
        .prefix("api/epilepsy_reviews/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
