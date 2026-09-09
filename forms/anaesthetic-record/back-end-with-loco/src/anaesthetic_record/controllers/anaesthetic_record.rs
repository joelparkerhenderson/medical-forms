#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::anaesthetic_records::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub theatre: String,
    pub operation_date: Option<Date>,
    pub anaesthetist_name: String,
    pub assistant_name: String,
    pub surgeon_name: String,
    pub planned_procedure: String,
    pub urgency: String,
    pub machine_checked: String,
    pub who_sign_in: String,
    pub who_time_out: String,
    pub consent_confirmed: String,
    pub fasting_confirmed: String,
    pub iv_access: String,
    pub allergy_band_checked: String,
    pub documented_allergies: String,
    pub asa_status: String,
    pub asa_emergency_modifier: String,
    pub mallampati_class: Option<i32>,
    pub mouth_opening_cm: Option<f64>,
    pub thyromental_distance_cm: Option<f64>,
    pub dentition: String,
    pub anticipated_difficult_airway: String,
    pub prior_difficult_intubation: String,
    pub airway_technique: String,
    pub device_size: String,
    pub tube_depth_cm: Option<f64>,
    pub cuffed: String,
    pub cormack_lehane_grade: Option<i32>,
    pub intubation_attempts: Option<i32>,
    pub capnography_confirmed: String,
    pub monitoring_modalities: String,
    pub anaesthetic_technique: String,
    pub crystalloid_ml: Option<f64>,
    pub colloid_ml: Option<f64>,
    pub blood_products_ml: Option<f64>,
    pub estimated_blood_loss_ml: Option<f64>,
    pub urine_output_ml: Option<f64>,
    pub cell_salvage_ml: Option<f64>,
    pub regional_technique: String,
    pub regional_level: String,
    pub regional_drug: String,
    pub regional_dose_mg: Option<f64>,
    pub block_height: String,
    pub regional_complications: String,
    pub recovery_destination: String,
    pub handover_airway_status: String,
    pub analgesia_plan: String,
    pub antiemetic_plan: String,
    pub oxygen_plan: String,
    pub outstanding_tasks: String,
    pub handover_at: Option<DateTimeWithTimeZone>,
    pub receiving_practitioner: String,
    pub anaesthetist_signature: String,
    pub signed_at: Option<DateTimeWithTimeZone>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.theatre = Set(self.theatre.clone());
      item.operation_date = Set(self.operation_date);
      item.anaesthetist_name = Set(self.anaesthetist_name.clone());
      item.assistant_name = Set(self.assistant_name.clone());
      item.surgeon_name = Set(self.surgeon_name.clone());
      item.planned_procedure = Set(self.planned_procedure.clone());
      item.urgency = Set(self.urgency.clone());
      item.machine_checked = Set(self.machine_checked.clone());
      item.who_sign_in = Set(self.who_sign_in.clone());
      item.who_time_out = Set(self.who_time_out.clone());
      item.consent_confirmed = Set(self.consent_confirmed.clone());
      item.fasting_confirmed = Set(self.fasting_confirmed.clone());
      item.iv_access = Set(self.iv_access.clone());
      item.allergy_band_checked = Set(self.allergy_band_checked.clone());
      item.documented_allergies = Set(self.documented_allergies.clone());
      item.asa_status = Set(self.asa_status.clone());
      item.asa_emergency_modifier = Set(self.asa_emergency_modifier.clone());
      item.mallampati_class = Set(self.mallampati_class);
      item.mouth_opening_cm = Set(self.mouth_opening_cm);
      item.thyromental_distance_cm = Set(self.thyromental_distance_cm);
      item.dentition = Set(self.dentition.clone());
      item.anticipated_difficult_airway = Set(self.anticipated_difficult_airway.clone());
      item.prior_difficult_intubation = Set(self.prior_difficult_intubation.clone());
      item.airway_technique = Set(self.airway_technique.clone());
      item.device_size = Set(self.device_size.clone());
      item.tube_depth_cm = Set(self.tube_depth_cm);
      item.cuffed = Set(self.cuffed.clone());
      item.cormack_lehane_grade = Set(self.cormack_lehane_grade);
      item.intubation_attempts = Set(self.intubation_attempts);
      item.capnography_confirmed = Set(self.capnography_confirmed.clone());
      item.monitoring_modalities = Set(self.monitoring_modalities.clone());
      item.anaesthetic_technique = Set(self.anaesthetic_technique.clone());
      item.crystalloid_ml = Set(self.crystalloid_ml);
      item.colloid_ml = Set(self.colloid_ml);
      item.blood_products_ml = Set(self.blood_products_ml);
      item.estimated_blood_loss_ml = Set(self.estimated_blood_loss_ml);
      item.urine_output_ml = Set(self.urine_output_ml);
      item.cell_salvage_ml = Set(self.cell_salvage_ml);
      item.regional_technique = Set(self.regional_technique.clone());
      item.regional_level = Set(self.regional_level.clone());
      item.regional_drug = Set(self.regional_drug.clone());
      item.regional_dose_mg = Set(self.regional_dose_mg);
      item.block_height = Set(self.block_height.clone());
      item.regional_complications = Set(self.regional_complications.clone());
      item.recovery_destination = Set(self.recovery_destination.clone());
      item.handover_airway_status = Set(self.handover_airway_status.clone());
      item.analgesia_plan = Set(self.analgesia_plan.clone());
      item.antiemetic_plan = Set(self.antiemetic_plan.clone());
      item.oxygen_plan = Set(self.oxygen_plan.clone());
      item.outstanding_tasks = Set(self.outstanding_tasks.clone());
      item.handover_at = Set(self.handover_at);
      item.receiving_practitioner = Set(self.receiving_practitioner.clone());
      item.anaesthetist_signature = Set(self.anaesthetist_signature.clone());
      item.signed_at = Set(self.signed_at);
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
        .prefix("api/anaesthetic_records/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
