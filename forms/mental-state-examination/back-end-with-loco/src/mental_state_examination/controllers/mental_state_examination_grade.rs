#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::mental_state_examination_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub mental_state_examination_id: i64,
    pub status: String,
    pub risk_level: String,
    pub completeness_percent: Option<i32>,
    pub appearance_behaviour_documented: String,
    pub speech_documented: String,
    pub emotion_documented: String,
    pub perception_documented: String,
    pub thought_documented: String,
    pub insight_documented: String,
    pub cognition_documented: String,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.mental_state_examination_id = Set(self.mental_state_examination_id);
      item.status = Set(self.status.clone());
      item.risk_level = Set(self.risk_level.clone());
      item.completeness_percent = Set(self.completeness_percent);
      item.appearance_behaviour_documented = Set(self.appearance_behaviour_documented.clone());
      item.speech_documented = Set(self.speech_documented.clone());
      item.emotion_documented = Set(self.emotion_documented.clone());
      item.perception_documented = Set(self.perception_documented.clone());
      item.thought_documented = Set(self.thought_documented.clone());
      item.insight_documented = Set(self.insight_documented.clone());
      item.cognition_documented = Set(self.cognition_documented.clone());
      item.graded_at = Set(self.graded_at);
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
        .prefix("api/mental_state_examination_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
