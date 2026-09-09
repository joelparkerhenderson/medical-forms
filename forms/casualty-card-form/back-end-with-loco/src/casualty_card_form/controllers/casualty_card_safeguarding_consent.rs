#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::casualty_card_safeguarding_consents::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub casualty_card_id: i64,
    pub safeguarding_concern: String,
    pub safeguarding_type: String,
    pub referral_made: String,
    pub mental_capacity_assessment: String,
    pub mental_health_act_status: String,
    pub consent_for_treatment: String,
    pub completed_by_name: String,
    pub completed_by_role: String,
    pub completed_by_gmc_number: String,
    pub senior_reviewing_clinician: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.casualty_card_id = Set(self.casualty_card_id);
      item.safeguarding_concern = Set(self.safeguarding_concern.clone());
      item.safeguarding_type = Set(self.safeguarding_type.clone());
      item.referral_made = Set(self.referral_made.clone());
      item.mental_capacity_assessment = Set(self.mental_capacity_assessment.clone());
      item.mental_health_act_status = Set(self.mental_health_act_status.clone());
      item.consent_for_treatment = Set(self.consent_for_treatment.clone());
      item.completed_by_name = Set(self.completed_by_name.clone());
      item.completed_by_role = Set(self.completed_by_role.clone());
      item.completed_by_gmc_number = Set(self.completed_by_gmc_number.clone());
      item.senior_reviewing_clinician = Set(self.senior_reviewing_clinician.clone());
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
        .prefix("api/casualty_card_safeguarding_consents/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
