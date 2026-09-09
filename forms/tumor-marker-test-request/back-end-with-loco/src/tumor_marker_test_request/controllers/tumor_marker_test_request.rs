#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::tumor_marker_test_requests::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub status: String,
    pub site_name: String,
    pub setting: String,
    pub referral_date: Option<Date>,
    pub requested_by_date: Option<Date>,
    pub psa: bool,
    pub ca125: bool,
    pub ca19_9: bool,
    pub carcinoembryonic_antigen_cea: bool,
    pub alpha_fetoprotein_afp: bool,
    pub beta_hcg: bool,
    pub ca15_3: bool,
    pub lactate_dehydrogenase_ldh: bool,
    pub calcitonin: bool,
    pub chromogranin_a: bool,
    pub primary_indication: String,
    pub clinical_details: String,
    pub known_cancer_site: String,
    pub on_treatment: bool,
    pub previous_marker_value: Option<f64>,
    pub previous_marker_date: Option<Date>,
    pub urgency: String,
    pub supervising_consultant: String,
    pub requester_contact: String,
    pub notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.status = Set(self.status.clone());
      item.site_name = Set(self.site_name.clone());
      item.setting = Set(self.setting.clone());
      item.referral_date = Set(self.referral_date);
      item.requested_by_date = Set(self.requested_by_date);
      item.psa = Set(self.psa);
      item.ca125 = Set(self.ca125);
      item.ca19_9 = Set(self.ca19_9);
      item.carcinoembryonic_antigen_cea = Set(self.carcinoembryonic_antigen_cea);
      item.alpha_fetoprotein_afp = Set(self.alpha_fetoprotein_afp);
      item.beta_hcg = Set(self.beta_hcg);
      item.ca15_3 = Set(self.ca15_3);
      item.lactate_dehydrogenase_ldh = Set(self.lactate_dehydrogenase_ldh);
      item.calcitonin = Set(self.calcitonin);
      item.chromogranin_a = Set(self.chromogranin_a);
      item.primary_indication = Set(self.primary_indication.clone());
      item.clinical_details = Set(self.clinical_details.clone());
      item.known_cancer_site = Set(self.known_cancer_site.clone());
      item.on_treatment = Set(self.on_treatment);
      item.previous_marker_value = Set(self.previous_marker_value);
      item.previous_marker_date = Set(self.previous_marker_date);
      item.urgency = Set(self.urgency.clone());
      item.supervising_consultant = Set(self.supervising_consultant.clone());
      item.requester_contact = Set(self.requester_contact.clone());
      item.notes = Set(self.notes.clone());
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
        .prefix("api/tumor_marker_test_requests/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
