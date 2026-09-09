#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::microbiology_culture_test_requests::{ActiveModel, Entity, Model};

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
    pub specimen_type: String,
    pub specimen_site_detail: String,
    pub test_culture_and_sensitivity: bool,
    pub test_gram_stain: bool,
    pub test_acid_fast_bacilli_tb: bool,
    pub test_fungal_culture: bool,
    pub test_pcr_molecular: bool,
    pub test_c_difficile_toxin: bool,
    pub test_mrsa_screen: bool,
    pub primary_indication: String,
    pub clinical_details: String,
    pub fever: bool,
    pub current_antibiotics: bool,
    pub antibiotic_name: String,
    pub recent_travel: bool,
    pub immunocompromised: bool,
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
      item.specimen_type = Set(self.specimen_type.clone());
      item.specimen_site_detail = Set(self.specimen_site_detail.clone());
      item.test_culture_and_sensitivity = Set(self.test_culture_and_sensitivity);
      item.test_gram_stain = Set(self.test_gram_stain);
      item.test_acid_fast_bacilli_tb = Set(self.test_acid_fast_bacilli_tb);
      item.test_fungal_culture = Set(self.test_fungal_culture);
      item.test_pcr_molecular = Set(self.test_pcr_molecular);
      item.test_c_difficile_toxin = Set(self.test_c_difficile_toxin);
      item.test_mrsa_screen = Set(self.test_mrsa_screen);
      item.primary_indication = Set(self.primary_indication.clone());
      item.clinical_details = Set(self.clinical_details.clone());
      item.fever = Set(self.fever);
      item.current_antibiotics = Set(self.current_antibiotics);
      item.antibiotic_name = Set(self.antibiotic_name.clone());
      item.recent_travel = Set(self.recent_travel);
      item.immunocompromised = Set(self.immunocompromised);
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
        .prefix("api/microbiology_culture_test_requests/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
