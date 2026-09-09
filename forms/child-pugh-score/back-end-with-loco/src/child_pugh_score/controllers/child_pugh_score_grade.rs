#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::child_pugh_score_grades::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub child_pugh_score_id: i64,
    pub bilirubin_points: Option<i32>,
    pub albumin_points: Option<i32>,
    pub coagulation_points: Option<i32>,
    pub ascites_points: Option<i32>,
    pub encephalopathy_points: Option<i32>,
    pub total_score: Option<i32>,
    pub child_pugh_class: String,
    pub one_year_survival: String,
    pub two_year_survival: String,
    pub surgical_risk: String,
    pub graded_at: DateTimeWithTimeZone,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.child_pugh_score_id = Set(self.child_pugh_score_id);
      item.bilirubin_points = Set(self.bilirubin_points);
      item.albumin_points = Set(self.albumin_points);
      item.coagulation_points = Set(self.coagulation_points);
      item.ascites_points = Set(self.ascites_points);
      item.encephalopathy_points = Set(self.encephalopathy_points);
      item.total_score = Set(self.total_score);
      item.child_pugh_class = Set(self.child_pugh_class.clone());
      item.one_year_survival = Set(self.one_year_survival.clone());
      item.two_year_survival = Set(self.two_year_survival.clone());
      item.surgical_risk = Set(self.surgical_risk.clone());
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
        .prefix("api/child_pugh_score_grades/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
