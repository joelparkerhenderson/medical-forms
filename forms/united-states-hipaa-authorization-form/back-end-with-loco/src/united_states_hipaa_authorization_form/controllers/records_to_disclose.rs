#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::records_to_discloses::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub hipaa_authorization_id: i64,
    pub include_medical_health: String,
    pub medical_health_initials: String,
    pub include_mental_health: String,
    pub mental_health_initials: String,
    pub include_substance_use: String,
    pub substance_use_initials: String,
    pub part2_redisclosure_notice_included: String,
    pub include_hiv_aids: String,
    pub hiv_aids_initials: String,
    pub hiv_aids_state_consent_included: String,
    pub include_psychotherapy_notes: String,
    pub include_genetic_information: String,
    pub include_reproductive_health: String,
    pub section_7332_notice_included: String,
    pub date_range_specified: String,
    pub date_from: Option<Date>,
    pub date_to: Option<Date>,
    pub other_description: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.hipaa_authorization_id = Set(self.hipaa_authorization_id);
      item.include_medical_health = Set(self.include_medical_health.clone());
      item.medical_health_initials = Set(self.medical_health_initials.clone());
      item.include_mental_health = Set(self.include_mental_health.clone());
      item.mental_health_initials = Set(self.mental_health_initials.clone());
      item.include_substance_use = Set(self.include_substance_use.clone());
      item.substance_use_initials = Set(self.substance_use_initials.clone());
      item.part2_redisclosure_notice_included = Set(self.part2_redisclosure_notice_included.clone());
      item.include_hiv_aids = Set(self.include_hiv_aids.clone());
      item.hiv_aids_initials = Set(self.hiv_aids_initials.clone());
      item.hiv_aids_state_consent_included = Set(self.hiv_aids_state_consent_included.clone());
      item.include_psychotherapy_notes = Set(self.include_psychotherapy_notes.clone());
      item.include_genetic_information = Set(self.include_genetic_information.clone());
      item.include_reproductive_health = Set(self.include_reproductive_health.clone());
      item.section_7332_notice_included = Set(self.section_7332_notice_included.clone());
      item.date_range_specified = Set(self.date_range_specified.clone());
      item.date_from = Set(self.date_from);
      item.date_to = Set(self.date_to);
      item.other_description = Set(self.other_description.clone());
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
        .prefix("api/records_to_discloses/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
