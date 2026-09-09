#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::pet_scan_test_requests::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub status: String,
    pub site_name: String,
    pub setting: String,
    pub referral_date: Option<Date>,
    pub requested_by_date: Option<Date>,
    pub scan_type: String,
    pub primary_indication: String,
    pub clinical_question: String,
    pub relevant_history: String,
    pub primary_tumour_site: String,
    pub diabetes: bool,
    pub blood_glucose_mmol_l: Option<f64>,
    pub pregnancy_status: String,
    pub breastfeeding: bool,
    pub egfr: Option<f64>,
    pub recent_chemo_radiotherapy: String,
    pub claustrophobia: bool,
    pub weight_kg: Option<f64>,
    pub urgency: String,
    pub ir_me_r_justification: String,
    pub supervising_consultant: String,
    pub requester_contact: String,
    pub notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.status = Set(self.status.clone());
      item.site_name = Set(self.site_name.clone());
      item.setting = Set(self.setting.clone());
      item.referral_date = Set(self.referral_date);
      item.requested_by_date = Set(self.requested_by_date);
      item.scan_type = Set(self.scan_type.clone());
      item.primary_indication = Set(self.primary_indication.clone());
      item.clinical_question = Set(self.clinical_question.clone());
      item.relevant_history = Set(self.relevant_history.clone());
      item.primary_tumour_site = Set(self.primary_tumour_site.clone());
      item.diabetes = Set(self.diabetes);
      item.blood_glucose_mmol_l = Set(self.blood_glucose_mmol_l);
      item.pregnancy_status = Set(self.pregnancy_status.clone());
      item.breastfeeding = Set(self.breastfeeding);
      item.egfr = Set(self.egfr);
      item.recent_chemo_radiotherapy = Set(self.recent_chemo_radiotherapy.clone());
      item.claustrophobia = Set(self.claustrophobia);
      item.weight_kg = Set(self.weight_kg);
      item.urgency = Set(self.urgency.clone());
      item.ir_me_r_justification = Set(self.ir_me_r_justification.clone());
      item.supervising_consultant = Set(self.supervising_consultant.clone());
      item.requester_contact = Set(self.requester_contact.clone());
      item.notes = Set(self.notes.clone());
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
        .prefix("api/pet_scan_test_requests/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
