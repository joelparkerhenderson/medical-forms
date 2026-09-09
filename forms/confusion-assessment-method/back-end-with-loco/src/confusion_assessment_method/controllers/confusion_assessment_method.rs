#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::confusion_assessment_methods::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub assessor_name: String,
    pub assessor_role: String,
    pub assessed_at: Option<DateTimeWithTimeZone>,
    pub ward_unit: String,
    pub cam_variant: String,
    pub patient_identifier: String,
    pub age_band: String,
    pub sex: String,
    pub cognitive_baseline: String,
    pub collateral_source: String,
    pub feature_acute_onset_fluctuating: String,
    pub onset_timing: String,
    pub feature_inattention: String,
    pub attention_test: String,
    pub feature_disorganised_thinking: String,
    pub feature_altered_consciousness: String,
    pub consciousness_level: String,
    pub rass_score: Option<i32>,
    pub motoric_subtype: String,
    pub hallucinations: bool,
    pub delusions: bool,
    pub sleep_wake_disturbance: bool,
    pub deliriogenic_medication: bool,
    pub deliriogenic_medication_detail: String,
    pub suspected_precipitants: String,
    pub recommended_actions: String,
    pub clinical_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.assessor_name = Set(self.assessor_name.clone());
      item.assessor_role = Set(self.assessor_role.clone());
      item.assessed_at = Set(self.assessed_at);
      item.ward_unit = Set(self.ward_unit.clone());
      item.cam_variant = Set(self.cam_variant.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.sex = Set(self.sex.clone());
      item.cognitive_baseline = Set(self.cognitive_baseline.clone());
      item.collateral_source = Set(self.collateral_source.clone());
      item.feature_acute_onset_fluctuating = Set(self.feature_acute_onset_fluctuating.clone());
      item.onset_timing = Set(self.onset_timing.clone());
      item.feature_inattention = Set(self.feature_inattention.clone());
      item.attention_test = Set(self.attention_test.clone());
      item.feature_disorganised_thinking = Set(self.feature_disorganised_thinking.clone());
      item.feature_altered_consciousness = Set(self.feature_altered_consciousness.clone());
      item.consciousness_level = Set(self.consciousness_level.clone());
      item.rass_score = Set(self.rass_score);
      item.motoric_subtype = Set(self.motoric_subtype.clone());
      item.hallucinations = Set(self.hallucinations);
      item.delusions = Set(self.delusions);
      item.sleep_wake_disturbance = Set(self.sleep_wake_disturbance);
      item.deliriogenic_medication = Set(self.deliriogenic_medication);
      item.deliriogenic_medication_detail = Set(self.deliriogenic_medication_detail.clone());
      item.suspected_precipitants = Set(self.suspected_precipitants.clone());
      item.recommended_actions = Set(self.recommended_actions.clone());
      item.clinical_note = Set(self.clinical_note.clone());
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
        .prefix("api/confusion_assessment_methods/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
