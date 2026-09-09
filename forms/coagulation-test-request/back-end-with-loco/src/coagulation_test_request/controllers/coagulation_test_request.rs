#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::coagulation_test_requests::{ActiveModel, Entity, Model};

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
    pub prothrombin_time_inr: bool,
    pub activated_partial_thromboplastin_time: bool,
    pub fibrinogen: bool,
    pub d_dimer: bool,
    pub thrombophilia_screen: bool,
    pub factor_assays: bool,
    pub anti_xa_assay: bool,
    pub mixing_studies: bool,
    pub von_willebrand_screen: bool,
    pub primary_indication: String,
    pub clinical_details: String,
    pub on_anticoagulant: bool,
    pub anticoagulant_agent: String,
    pub bleeding_history: bool,
    pub thrombosis_history: bool,
    pub specimen_collected: String,
    pub collection_datetime: Option<DateTimeWithTimeZone>,
    pub urgency: String,
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
      item.prothrombin_time_inr = Set(self.prothrombin_time_inr);
      item.activated_partial_thromboplastin_time = Set(self.activated_partial_thromboplastin_time);
      item.fibrinogen = Set(self.fibrinogen);
      item.d_dimer = Set(self.d_dimer);
      item.thrombophilia_screen = Set(self.thrombophilia_screen);
      item.factor_assays = Set(self.factor_assays);
      item.anti_xa_assay = Set(self.anti_xa_assay);
      item.mixing_studies = Set(self.mixing_studies);
      item.von_willebrand_screen = Set(self.von_willebrand_screen);
      item.primary_indication = Set(self.primary_indication.clone());
      item.clinical_details = Set(self.clinical_details.clone());
      item.on_anticoagulant = Set(self.on_anticoagulant);
      item.anticoagulant_agent = Set(self.anticoagulant_agent.clone());
      item.bleeding_history = Set(self.bleeding_history);
      item.thrombosis_history = Set(self.thrombosis_history);
      item.specimen_collected = Set(self.specimen_collected.clone());
      item.collection_datetime = Set(self.collection_datetime);
      item.urgency = Set(self.urgency.clone());
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
        .prefix("api/coagulation_test_requests/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
