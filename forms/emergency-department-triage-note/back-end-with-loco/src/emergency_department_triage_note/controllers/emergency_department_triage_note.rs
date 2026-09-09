#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::emergency_department_triage_notes::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub status: String,
    pub nurse_name: String,
    pub triaged_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub arrival_mode: String,
    pub arrived_at: Option<DateTimeWithTimeZone>,
    pub referral_source: String,
    pub patient_identifier: String,
    pub age_band: String,
    pub presenting_complaint: String,
    pub brief_history: String,
    pub symptom_onset: String,
    pub respiratory_rate: Option<i32>,
    pub spo2: Option<i32>,
    pub on_oxygen: String,
    pub systolic_bp: Option<i32>,
    pub pulse: Option<i32>,
    pub consciousness_acvpu: String,
    pub temperature: Option<f64>,
    pub glasgow_coma_scale: Option<i32>,
    pub pain_score: Option<i32>,
    pub airway_threat: String,
    pub breathing_inadequate: String,
    pub circulation_shock: String,
    pub haemorrhage_major: String,
    pub consciousness_reduced: String,
    pub seizure_active: String,
    pub focal_neurology: String,
    pub sepsis_features: String,
    pub chest_pain_cardiac: String,
    pub stroke_features: String,
    pub paediatric_red_flag: String,
    pub clinical_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.status = Set(self.status.clone());
      item.nurse_name = Set(self.nurse_name.clone());
      item.triaged_at = Set(self.triaged_at);
      item.care_setting = Set(self.care_setting.clone());
      item.arrival_mode = Set(self.arrival_mode.clone());
      item.arrived_at = Set(self.arrived_at);
      item.referral_source = Set(self.referral_source.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.presenting_complaint = Set(self.presenting_complaint.clone());
      item.brief_history = Set(self.brief_history.clone());
      item.symptom_onset = Set(self.symptom_onset.clone());
      item.respiratory_rate = Set(self.respiratory_rate);
      item.spo2 = Set(self.spo2);
      item.on_oxygen = Set(self.on_oxygen.clone());
      item.systolic_bp = Set(self.systolic_bp);
      item.pulse = Set(self.pulse);
      item.consciousness_acvpu = Set(self.consciousness_acvpu.clone());
      item.temperature = Set(self.temperature);
      item.glasgow_coma_scale = Set(self.glasgow_coma_scale);
      item.pain_score = Set(self.pain_score);
      item.airway_threat = Set(self.airway_threat.clone());
      item.breathing_inadequate = Set(self.breathing_inadequate.clone());
      item.circulation_shock = Set(self.circulation_shock.clone());
      item.haemorrhage_major = Set(self.haemorrhage_major.clone());
      item.consciousness_reduced = Set(self.consciousness_reduced.clone());
      item.seizure_active = Set(self.seizure_active.clone());
      item.focal_neurology = Set(self.focal_neurology.clone());
      item.sepsis_features = Set(self.sepsis_features.clone());
      item.chest_pain_cardiac = Set(self.chest_pain_cardiac.clone());
      item.stroke_features = Set(self.stroke_features.clone());
      item.paediatric_red_flag = Set(self.paediatric_red_flag.clone());
      item.clinical_notes = Set(self.clinical_notes.clone());
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
        .prefix("api/emergency_department_triage_notes/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
