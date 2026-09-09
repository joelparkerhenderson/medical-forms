#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::toxicology_test_requests::{ActiveModel, Entity, Model};

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
    pub paracetamol_level: bool,
    pub salicylate_level: bool,
    pub alcohol_level: bool,
    pub drugs_of_abuse_screen: bool,
    pub lithium_level: bool,
    pub digoxin_level: bool,
    pub antiepileptic_drug_level: bool,
    pub carboxyhaemoglobin: bool,
    pub heavy_metals: bool,
    pub specific_drug_level: bool,
    pub primary_indication: String,
    pub clinical_details: String,
    pub suspected_agent: String,
    pub time_since_ingestion_hours: Option<f64>,
    pub deliberate_overdose: bool,
    pub symptomatic: bool,
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
      item.paracetamol_level = Set(self.paracetamol_level);
      item.salicylate_level = Set(self.salicylate_level);
      item.alcohol_level = Set(self.alcohol_level);
      item.drugs_of_abuse_screen = Set(self.drugs_of_abuse_screen);
      item.lithium_level = Set(self.lithium_level);
      item.digoxin_level = Set(self.digoxin_level);
      item.antiepileptic_drug_level = Set(self.antiepileptic_drug_level);
      item.carboxyhaemoglobin = Set(self.carboxyhaemoglobin);
      item.heavy_metals = Set(self.heavy_metals);
      item.specific_drug_level = Set(self.specific_drug_level);
      item.primary_indication = Set(self.primary_indication.clone());
      item.clinical_details = Set(self.clinical_details.clone());
      item.suspected_agent = Set(self.suspected_agent.clone());
      item.time_since_ingestion_hours = Set(self.time_since_ingestion_hours);
      item.deliberate_overdose = Set(self.deliberate_overdose);
      item.symptomatic = Set(self.symptomatic);
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
        .prefix("api/toxicology_test_requests/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
