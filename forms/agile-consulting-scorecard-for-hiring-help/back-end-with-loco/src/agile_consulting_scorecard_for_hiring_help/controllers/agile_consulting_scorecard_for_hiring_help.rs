#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::agile_consulting_scorecard_for_hiring_helps::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub organization_id: i64,
    pub respondent_id: i64,
    pub status: String,
    pub assessment_date: Date,
    pub submitted_at: Option<DateTimeWithTimeZone>,
    pub finalized_at: Option<DateTimeWithTimeZone>,
    pub m1_done: Option<bool>,
    pub m1_evidence: String,
    pub m2_done: Option<bool>,
    pub m2_evidence: String,
    pub m3_done: Option<bool>,
    pub m3_evidence: String,
    pub m4_done: Option<bool>,
    pub m4_evidence: String,
    pub p1_done: Option<bool>,
    pub p1_evidence: String,
    pub p2_done: Option<bool>,
    pub p2_evidence: String,
    pub p3_done: Option<bool>,
    pub p3_evidence: String,
    pub p4_done: Option<bool>,
    pub p4_evidence: String,
    pub p5_done: Option<bool>,
    pub p5_evidence: String,
    pub p6_done: Option<bool>,
    pub p6_evidence: String,
    pub p7_done: Option<bool>,
    pub p7_evidence: String,
    pub p8_done: Option<bool>,
    pub p8_evidence: String,
    pub p9_done: Option<bool>,
    pub p9_evidence: String,
    pub p10_done: Option<bool>,
    pub p10_evidence: String,
    pub p11_done: Option<bool>,
    pub p11_evidence: String,
    pub p12_done: Option<bool>,
    pub p12_evidence: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.organization_id = Set(self.organization_id);
      item.respondent_id = Set(self.respondent_id);
      item.status = Set(self.status.clone());
      item.assessment_date = Set(self.assessment_date);
      item.submitted_at = Set(self.submitted_at);
      item.finalized_at = Set(self.finalized_at);
      item.m1_done = Set(self.m1_done);
      item.m1_evidence = Set(self.m1_evidence.clone());
      item.m2_done = Set(self.m2_done);
      item.m2_evidence = Set(self.m2_evidence.clone());
      item.m3_done = Set(self.m3_done);
      item.m3_evidence = Set(self.m3_evidence.clone());
      item.m4_done = Set(self.m4_done);
      item.m4_evidence = Set(self.m4_evidence.clone());
      item.p1_done = Set(self.p1_done);
      item.p1_evidence = Set(self.p1_evidence.clone());
      item.p2_done = Set(self.p2_done);
      item.p2_evidence = Set(self.p2_evidence.clone());
      item.p3_done = Set(self.p3_done);
      item.p3_evidence = Set(self.p3_evidence.clone());
      item.p4_done = Set(self.p4_done);
      item.p4_evidence = Set(self.p4_evidence.clone());
      item.p5_done = Set(self.p5_done);
      item.p5_evidence = Set(self.p5_evidence.clone());
      item.p6_done = Set(self.p6_done);
      item.p6_evidence = Set(self.p6_evidence.clone());
      item.p7_done = Set(self.p7_done);
      item.p7_evidence = Set(self.p7_evidence.clone());
      item.p8_done = Set(self.p8_done);
      item.p8_evidence = Set(self.p8_evidence.clone());
      item.p9_done = Set(self.p9_done);
      item.p9_evidence = Set(self.p9_evidence.clone());
      item.p10_done = Set(self.p10_done);
      item.p10_evidence = Set(self.p10_evidence.clone());
      item.p11_done = Set(self.p11_done);
      item.p11_evidence = Set(self.p11_evidence.clone());
      item.p12_done = Set(self.p12_done);
      item.p12_evidence = Set(self.p12_evidence.clone());
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
        .prefix("api/agile_consulting_scorecard_for_hiring_helps/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
