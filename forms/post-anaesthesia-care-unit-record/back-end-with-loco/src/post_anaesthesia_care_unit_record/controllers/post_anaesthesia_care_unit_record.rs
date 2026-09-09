#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::post_anaesthesia_care_unit_records::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub nurse_name: String,
    pub nurse_role: String,
    pub anaesthetist_name: String,
    pub admitted_at: Option<DateTimeWithTimeZone>,
    pub anaesthetic_technique: String,
    pub procedure: String,
    pub patient_identifier: String,
    pub age_band: String,
    pub sex: String,
    pub asa_status: String,
    pub baseline_systolic_bp: Option<f64>,
    pub ambulatory_case: String,
    pub activity: String,
    pub respiration: String,
    pub circulation: String,
    pub consciousness: String,
    pub oxygen_saturation: String,
    pub airway_status: String,
    pub pain_score: Option<f64>,
    pub ponv_severity: String,
    pub analgesia_given: String,
    pub antiemetics_given: String,
    pub padss_vital_signs: String,
    pub padss_ambulation: String,
    pub padss_nausea_vomiting: String,
    pub padss_pain: String,
    pub padss_surgical_bleeding: String,
    pub recovery_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.nurse_name = Set(self.nurse_name.clone());
      item.nurse_role = Set(self.nurse_role.clone());
      item.anaesthetist_name = Set(self.anaesthetist_name.clone());
      item.admitted_at = Set(self.admitted_at);
      item.anaesthetic_technique = Set(self.anaesthetic_technique.clone());
      item.procedure = Set(self.procedure.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.sex = Set(self.sex.clone());
      item.asa_status = Set(self.asa_status.clone());
      item.baseline_systolic_bp = Set(self.baseline_systolic_bp);
      item.ambulatory_case = Set(self.ambulatory_case.clone());
      item.activity = Set(self.activity.clone());
      item.respiration = Set(self.respiration.clone());
      item.circulation = Set(self.circulation.clone());
      item.consciousness = Set(self.consciousness.clone());
      item.oxygen_saturation = Set(self.oxygen_saturation.clone());
      item.airway_status = Set(self.airway_status.clone());
      item.pain_score = Set(self.pain_score);
      item.ponv_severity = Set(self.ponv_severity.clone());
      item.analgesia_given = Set(self.analgesia_given.clone());
      item.antiemetics_given = Set(self.antiemetics_given.clone());
      item.padss_vital_signs = Set(self.padss_vital_signs.clone());
      item.padss_ambulation = Set(self.padss_ambulation.clone());
      item.padss_nausea_vomiting = Set(self.padss_nausea_vomiting.clone());
      item.padss_pain = Set(self.padss_pain.clone());
      item.padss_surgical_bleeding = Set(self.padss_surgical_bleeding.clone());
      item.recovery_note = Set(self.recovery_note.clone());
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
        .prefix("api/post_anaesthesia_care_unit_records/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
