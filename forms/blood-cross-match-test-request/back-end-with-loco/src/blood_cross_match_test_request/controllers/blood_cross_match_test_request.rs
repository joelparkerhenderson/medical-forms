#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::blood_cross_match_test_requests::{ActiveModel, Entity, Model};

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
    pub request_type: String,
    pub component: String,
    pub units_required: Option<i32>,
    pub primary_indication: String,
    pub clinical_details: String,
    pub patient_blood_group: String,
    pub known_antibodies: bool,
    pub antibody_detail: String,
    pub previous_transfusion: bool,
    pub previous_transfusion_reaction: bool,
    pub pregnant: bool,
    pub sample_collected: String,
    pub collection_datetime: Option<DateTimeWithTimeZone>,
    pub two_sample_rule_met: bool,
    pub required_by_datetime: Option<DateTimeWithTimeZone>,
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
      item.request_type = Set(self.request_type.clone());
      item.component = Set(self.component.clone());
      item.units_required = Set(self.units_required);
      item.primary_indication = Set(self.primary_indication.clone());
      item.clinical_details = Set(self.clinical_details.clone());
      item.patient_blood_group = Set(self.patient_blood_group.clone());
      item.known_antibodies = Set(self.known_antibodies);
      item.antibody_detail = Set(self.antibody_detail.clone());
      item.previous_transfusion = Set(self.previous_transfusion);
      item.previous_transfusion_reaction = Set(self.previous_transfusion_reaction);
      item.pregnant = Set(self.pregnant);
      item.sample_collected = Set(self.sample_collected.clone());
      item.collection_datetime = Set(self.collection_datetime);
      item.two_sample_rule_met = Set(self.two_sample_rule_met);
      item.required_by_datetime = Set(self.required_by_datetime);
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
        .prefix("api/blood_cross_match_test_requests/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
