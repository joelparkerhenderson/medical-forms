#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::urinalysis_test_requests::{ActiveModel, Entity, Model};

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
    pub dipstick: bool,
    pub microscopy_culture_sensitivity: bool,
    pub albumin_creatinine_ratio: bool,
    pub protein_creatinine_ratio: bool,
    pub pregnancy_test: bool,
    pub drug_screen: bool,
    pub cytology: bool,
    pub twenty_four_hour_collection: bool,
    pub primary_indication: String,
    pub clinical_details: String,
    pub symptom_dysuria: bool,
    pub symptom_frequency: bool,
    pub symptom_visible_haematuria: bool,
    pub symptom_loin_pain: bool,
    pub symptom_fever: bool,
    pub specimen_type: String,
    pub specimen_collected: String,
    pub collection_datetime: Option<DateTimeWithTimeZone>,
    pub pregnant: bool,
    pub catheterised: bool,
    pub current_antibiotics: bool,
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
      item.dipstick = Set(self.dipstick);
      item.microscopy_culture_sensitivity = Set(self.microscopy_culture_sensitivity);
      item.albumin_creatinine_ratio = Set(self.albumin_creatinine_ratio);
      item.protein_creatinine_ratio = Set(self.protein_creatinine_ratio);
      item.pregnancy_test = Set(self.pregnancy_test);
      item.drug_screen = Set(self.drug_screen);
      item.cytology = Set(self.cytology);
      item.twenty_four_hour_collection = Set(self.twenty_four_hour_collection);
      item.primary_indication = Set(self.primary_indication.clone());
      item.clinical_details = Set(self.clinical_details.clone());
      item.symptom_dysuria = Set(self.symptom_dysuria);
      item.symptom_frequency = Set(self.symptom_frequency);
      item.symptom_visible_haematuria = Set(self.symptom_visible_haematuria);
      item.symptom_loin_pain = Set(self.symptom_loin_pain);
      item.symptom_fever = Set(self.symptom_fever);
      item.specimen_type = Set(self.specimen_type.clone());
      item.specimen_collected = Set(self.specimen_collected.clone());
      item.collection_datetime = Set(self.collection_datetime);
      item.pregnant = Set(self.pregnant);
      item.catheterised = Set(self.catheterised);
      item.current_antibiotics = Set(self.current_antibiotics);
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
        .prefix("api/urinalysis_test_requests/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
