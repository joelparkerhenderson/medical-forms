#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::hernia_diagnostic_evaluation_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub hernia_diagnostic_evaluation_id: i64,
    pub hernia_type: String,
    pub hernia_subtype: String,
    pub ehs_classification: String,
    pub ehs_size_grade: String,
    pub reducibility_status: String,
    pub computed_urgency: String,
    pub final_urgency: String,
    pub override_reason: String,
    pub recommendation: String,
    pub clinician_notes: String,
    pub signed_by_name: String,
    pub signed_at: Option<DateTimeWithTimeZone>,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.hernia_diagnostic_evaluation_id = Set(self.hernia_diagnostic_evaluation_id);
      item.hernia_type = Set(self.hernia_type.clone());
      item.hernia_subtype = Set(self.hernia_subtype.clone());
      item.ehs_classification = Set(self.ehs_classification.clone());
      item.ehs_size_grade = Set(self.ehs_size_grade.clone());
      item.reducibility_status = Set(self.reducibility_status.clone());
      item.computed_urgency = Set(self.computed_urgency.clone());
      item.final_urgency = Set(self.final_urgency.clone());
      item.override_reason = Set(self.override_reason.clone());
      item.recommendation = Set(self.recommendation.clone());
      item.clinician_notes = Set(self.clinician_notes.clone());
      item.signed_by_name = Set(self.signed_by_name.clone());
      item.signed_at = Set(self.signed_at);
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
        .prefix("api/hernia_diagnostic_evaluation_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
