#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::abdominal_aortic_aneurysm_screenings::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub technician_name: String,
    pub technician_role: String,
    pub clinic_site: String,
    pub scanned_at: Option<DateTimeWithTimeZone>,
    pub device_identifier: String,
    pub patient_identifier: String,
    pub age: Option<i32>,
    pub sex: String,
    pub eligibility_route: String,
    pub scan_type: String,
    pub consent_given: String,
    pub leaflet_provided: String,
    pub consent_note: String,
    pub aorta_visualised: String,
    pub max_aortic_diameter_cm: Option<f64>,
    pub prior_max_diameter_cm: Option<f64>,
    pub prior_scan_date: Option<Date>,
    pub symptomatic: String,
    pub incidental_findings: String,
    pub result_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.technician_name = Set(self.technician_name.clone());
      item.technician_role = Set(self.technician_role.clone());
      item.clinic_site = Set(self.clinic_site.clone());
      item.scanned_at = Set(self.scanned_at);
      item.device_identifier = Set(self.device_identifier.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age = Set(self.age);
      item.sex = Set(self.sex.clone());
      item.eligibility_route = Set(self.eligibility_route.clone());
      item.scan_type = Set(self.scan_type.clone());
      item.consent_given = Set(self.consent_given.clone());
      item.leaflet_provided = Set(self.leaflet_provided.clone());
      item.consent_note = Set(self.consent_note.clone());
      item.aorta_visualised = Set(self.aorta_visualised.clone());
      item.max_aortic_diameter_cm = Set(self.max_aortic_diameter_cm);
      item.prior_max_diameter_cm = Set(self.prior_max_diameter_cm);
      item.prior_scan_date = Set(self.prior_scan_date);
      item.symptomatic = Set(self.symptomatic.clone());
      item.incidental_findings = Set(self.incidental_findings.clone());
      item.result_note = Set(self.result_note.clone());
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
        .prefix("api/abdominal_aortic_aneurysm_screenings/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
