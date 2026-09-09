#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::casualty_card_presenting_complaints::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub casualty_card_id: i64,
    pub chief_complaint: String,
    pub history_of_presenting_complaint: String,
    pub onset: String,
    pub duration: String,
    pub character: String,
    pub severity: String,
    pub location: String,
    pub radiation: String,
    pub aggravating_factors: String,
    pub relieving_factors: String,
    pub associated_symptoms: String,
    pub previous_episodes: String,
    pub treatment_prior_to_arrival: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.casualty_card_id = Set(self.casualty_card_id);
      item.chief_complaint = Set(self.chief_complaint.clone());
      item.history_of_presenting_complaint = Set(self.history_of_presenting_complaint.clone());
      item.onset = Set(self.onset.clone());
      item.duration = Set(self.duration.clone());
      item.character = Set(self.character.clone());
      item.severity = Set(self.severity.clone());
      item.location = Set(self.location.clone());
      item.radiation = Set(self.radiation.clone());
      item.aggravating_factors = Set(self.aggravating_factors.clone());
      item.relieving_factors = Set(self.relieving_factors.clone());
      item.associated_symptoms = Set(self.associated_symptoms.clone());
      item.previous_episodes = Set(self.previous_episodes.clone());
      item.treatment_prior_to_arrival = Set(self.treatment_prior_to_arrival.clone());
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
        .prefix("api/casualty_card_presenting_complaints/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
