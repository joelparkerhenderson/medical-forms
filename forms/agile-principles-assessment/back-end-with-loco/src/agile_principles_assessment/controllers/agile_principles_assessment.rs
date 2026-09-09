#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::agile_principles_assessments::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub respondent_id: i64,
    pub status: String,
    pub is_anonymous: bool,
    pub assessment_date: Option<Date>,
    pub assessment_period: String,
    pub p01_customer_satisfaction: Option<i32>,
    pub p01_comment: String,
    pub p01_weight: f64,
    pub p02_welcome_change: Option<i32>,
    pub p02_comment: String,
    pub p02_weight: f64,
    pub p03_deliver_frequently: Option<i32>,
    pub p03_comment: String,
    pub p03_weight: f64,
    pub p04_collaboration: Option<i32>,
    pub p04_comment: String,
    pub p04_weight: f64,
    pub p05_motivated_individuals: Option<i32>,
    pub p05_comment: String,
    pub p05_weight: f64,
    pub p06_face_to_face: Option<i32>,
    pub p06_comment: String,
    pub p06_weight: f64,
    pub p07_working_software: Option<i32>,
    pub p07_comment: String,
    pub p07_weight: f64,
    pub p08_sustainable_development: Option<i32>,
    pub p08_comment: String,
    pub p08_weight: f64,
    pub p09_technical_excellence: Option<i32>,
    pub p09_comment: String,
    pub p09_weight: f64,
    pub p10_simplicity: Option<i32>,
    pub p10_comment: String,
    pub p10_weight: f64,
    pub p11_self_organising_teams: Option<i32>,
    pub p11_comment: String,
    pub p11_weight: f64,
    pub p12_regular_reflection: Option<i32>,
    pub p12_comment: String,
    pub p12_weight: f64,
    pub overall_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.respondent_id = Set(self.respondent_id);
      item.status = Set(self.status.clone());
      item.is_anonymous = Set(self.is_anonymous);
      item.assessment_date = Set(self.assessment_date);
      item.assessment_period = Set(self.assessment_period.clone());
      item.p01_customer_satisfaction = Set(self.p01_customer_satisfaction);
      item.p01_comment = Set(self.p01_comment.clone());
      item.p01_weight = Set(self.p01_weight);
      item.p02_welcome_change = Set(self.p02_welcome_change);
      item.p02_comment = Set(self.p02_comment.clone());
      item.p02_weight = Set(self.p02_weight);
      item.p03_deliver_frequently = Set(self.p03_deliver_frequently);
      item.p03_comment = Set(self.p03_comment.clone());
      item.p03_weight = Set(self.p03_weight);
      item.p04_collaboration = Set(self.p04_collaboration);
      item.p04_comment = Set(self.p04_comment.clone());
      item.p04_weight = Set(self.p04_weight);
      item.p05_motivated_individuals = Set(self.p05_motivated_individuals);
      item.p05_comment = Set(self.p05_comment.clone());
      item.p05_weight = Set(self.p05_weight);
      item.p06_face_to_face = Set(self.p06_face_to_face);
      item.p06_comment = Set(self.p06_comment.clone());
      item.p06_weight = Set(self.p06_weight);
      item.p07_working_software = Set(self.p07_working_software);
      item.p07_comment = Set(self.p07_comment.clone());
      item.p07_weight = Set(self.p07_weight);
      item.p08_sustainable_development = Set(self.p08_sustainable_development);
      item.p08_comment = Set(self.p08_comment.clone());
      item.p08_weight = Set(self.p08_weight);
      item.p09_technical_excellence = Set(self.p09_technical_excellence);
      item.p09_comment = Set(self.p09_comment.clone());
      item.p09_weight = Set(self.p09_weight);
      item.p10_simplicity = Set(self.p10_simplicity);
      item.p10_comment = Set(self.p10_comment.clone());
      item.p10_weight = Set(self.p10_weight);
      item.p11_self_organising_teams = Set(self.p11_self_organising_teams);
      item.p11_comment = Set(self.p11_comment.clone());
      item.p11_weight = Set(self.p11_weight);
      item.p12_regular_reflection = Set(self.p12_regular_reflection);
      item.p12_comment = Set(self.p12_comment.clone());
      item.p12_weight = Set(self.p12_weight);
      item.overall_notes = Set(self.overall_notes.clone());
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
        .prefix("api/agile_principles_assessments/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
