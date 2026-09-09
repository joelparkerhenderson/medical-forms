#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::diabetes_eye_screenings::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub grader_name: String,
    pub grader_role: String,
    pub graded_at: Option<Date>,
    pub image_captured_at: Option<Date>,
    pub imaging_media: String,
    pub patient_identifier: String,
    pub age_band: String,
    pub diabetes_type: String,
    pub years_since_diagnosis: Option<f64>,
    pub previous_screen_date: Option<Date>,
    pub previous_screen_result: String,
    pub right_retinopathy_grade: String,
    pub right_maculopathy_grade: String,
    pub right_photocoagulation: String,
    pub right_ungradable: String,
    pub right_visual_acuity: String,
    pub left_retinopathy_grade: String,
    pub left_maculopathy_grade: String,
    pub left_photocoagulation: String,
    pub left_ungradable: String,
    pub left_visual_acuity: String,
    pub clinical_context: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.grader_name = Set(self.grader_name.clone());
      item.grader_role = Set(self.grader_role.clone());
      item.graded_at = Set(self.graded_at);
      item.image_captured_at = Set(self.image_captured_at);
      item.imaging_media = Set(self.imaging_media.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.diabetes_type = Set(self.diabetes_type.clone());
      item.years_since_diagnosis = Set(self.years_since_diagnosis);
      item.previous_screen_date = Set(self.previous_screen_date);
      item.previous_screen_result = Set(self.previous_screen_result.clone());
      item.right_retinopathy_grade = Set(self.right_retinopathy_grade.clone());
      item.right_maculopathy_grade = Set(self.right_maculopathy_grade.clone());
      item.right_photocoagulation = Set(self.right_photocoagulation.clone());
      item.right_ungradable = Set(self.right_ungradable.clone());
      item.right_visual_acuity = Set(self.right_visual_acuity.clone());
      item.left_retinopathy_grade = Set(self.left_retinopathy_grade.clone());
      item.left_maculopathy_grade = Set(self.left_maculopathy_grade.clone());
      item.left_photocoagulation = Set(self.left_photocoagulation.clone());
      item.left_ungradable = Set(self.left_ungradable.clone());
      item.left_visual_acuity = Set(self.left_visual_acuity.clone());
      item.clinical_context = Set(self.clinical_context.clone());
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
        .prefix("api/diabetes_eye_screenings/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
