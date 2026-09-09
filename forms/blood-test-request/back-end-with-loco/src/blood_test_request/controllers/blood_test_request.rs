#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::blood_test_requests::{ActiveModel, Entity, Model};

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
    pub full_blood_count: bool,
    pub urea_electrolytes: bool,
    pub liver_function: bool,
    pub thyroid_function: bool,
    pub hba1c: bool,
    pub lipid_profile: bool,
    pub c_reactive_protein: bool,
    pub coagulation_screen: bool,
    pub bone_profile: bool,
    pub ferritin_iron: bool,
    pub vitamin_b12_folate: bool,
    pub vitamin_d: bool,
    pub hba1c_monitoring: bool,
    pub glucose: bool,
    pub inr: bool,
    pub blood_culture: bool,
    pub group_and_save: bool,
    pub crossmatch: bool,
    pub troponin: bool,
    pub d_dimer: bool,
    pub amylase_lipase: bool,
    pub primary_indication: String,
    pub clinical_details: String,
    pub relevant_medications: String,
    pub fasting_required: bool,
    pub fasting_status: String,
    pub specimen_collected: String,
    pub collection_datetime: Option<DateTimeWithTimeZone>,
    pub known_blood_borne_virus: bool,
    pub difficult_venous_access: bool,
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
      item.full_blood_count = Set(self.full_blood_count);
      item.urea_electrolytes = Set(self.urea_electrolytes);
      item.liver_function = Set(self.liver_function);
      item.thyroid_function = Set(self.thyroid_function);
      item.hba1c = Set(self.hba1c);
      item.lipid_profile = Set(self.lipid_profile);
      item.c_reactive_protein = Set(self.c_reactive_protein);
      item.coagulation_screen = Set(self.coagulation_screen);
      item.bone_profile = Set(self.bone_profile);
      item.ferritin_iron = Set(self.ferritin_iron);
      item.vitamin_b12_folate = Set(self.vitamin_b12_folate);
      item.vitamin_d = Set(self.vitamin_d);
      item.hba1c_monitoring = Set(self.hba1c_monitoring);
      item.glucose = Set(self.glucose);
      item.inr = Set(self.inr);
      item.blood_culture = Set(self.blood_culture);
      item.group_and_save = Set(self.group_and_save);
      item.crossmatch = Set(self.crossmatch);
      item.troponin = Set(self.troponin);
      item.d_dimer = Set(self.d_dimer);
      item.amylase_lipase = Set(self.amylase_lipase);
      item.primary_indication = Set(self.primary_indication.clone());
      item.clinical_details = Set(self.clinical_details.clone());
      item.relevant_medications = Set(self.relevant_medications.clone());
      item.fasting_required = Set(self.fasting_required);
      item.fasting_status = Set(self.fasting_status.clone());
      item.specimen_collected = Set(self.specimen_collected.clone());
      item.collection_datetime = Set(self.collection_datetime);
      item.known_blood_borne_virus = Set(self.known_blood_borne_virus);
      item.difficult_venous_access = Set(self.difficult_venous_access);
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
        .prefix("api/blood_test_requests/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
