#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::arc42_documentations::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub architecture_id: i64,
    pub author_name: String,
    pub author_role: String,
    pub document_date: Option<Date>,
    pub introduction: String,
    pub business_context_description: String,
    pub technical_context_description: String,
    pub solution_strategy_summary: String,
    pub top_level_decomposition_summary: String,
    pub building_block_overview: String,
    pub runtime_overview: String,
    pub deployment_overview: String,
    pub crosscutting_overview: String,
    pub quality_tree_summary: String,
    pub recommendation: String,
    pub additional_notes: String,
    pub signed_by: String,
    pub signed_at: Option<DateTimeWithTimeZone>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.architecture_id = Set(self.architecture_id);
      item.author_name = Set(self.author_name.clone());
      item.author_role = Set(self.author_role.clone());
      item.document_date = Set(self.document_date);
      item.introduction = Set(self.introduction.clone());
      item.business_context_description = Set(self.business_context_description.clone());
      item.technical_context_description = Set(self.technical_context_description.clone());
      item.solution_strategy_summary = Set(self.solution_strategy_summary.clone());
      item.top_level_decomposition_summary = Set(self.top_level_decomposition_summary.clone());
      item.building_block_overview = Set(self.building_block_overview.clone());
      item.runtime_overview = Set(self.runtime_overview.clone());
      item.deployment_overview = Set(self.deployment_overview.clone());
      item.crosscutting_overview = Set(self.crosscutting_overview.clone());
      item.quality_tree_summary = Set(self.quality_tree_summary.clone());
      item.recommendation = Set(self.recommendation.clone());
      item.additional_notes = Set(self.additional_notes.clone());
      item.signed_by = Set(self.signed_by.clone());
      item.signed_at = Set(self.signed_at);
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
        .prefix("api/arc42_documentations/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
