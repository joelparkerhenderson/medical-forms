#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::patients::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub name: String,
    pub birth_date: Date,
    pub sex: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub postal_address_as_full_text: Option<String>,
    pub country_as_iso_3166_1_alpha_2: Option<String>,
    pub postcode: Option<String>,
    pub united_kingdom_nhs_number: Option<String>,
    pub job_title: String,
    pub role_description: String,
    pub contracted_hours_per_week: Option<f64>,
    pub shift_pattern: String,
    pub safety_critical_role: String,
    pub dvla_group_1_licence_held: String,
    pub dvla_group_2_licence_held: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.name = Set(self.name.clone());
      item.birth_date = Set(self.birth_date);
      item.sex = Set(self.sex.clone());
      item.email = Set(self.email.clone());
      item.phone = Set(self.phone.clone());
      item.postal_address_as_full_text = Set(self.postal_address_as_full_text.clone());
      item.country_as_iso_3166_1_alpha_2 = Set(self.country_as_iso_3166_1_alpha_2.clone());
      item.postcode = Set(self.postcode.clone());
      item.united_kingdom_nhs_number = Set(self.united_kingdom_nhs_number.clone());
      item.job_title = Set(self.job_title.clone());
      item.role_description = Set(self.role_description.clone());
      item.contracted_hours_per_week = Set(self.contracted_hours_per_week);
      item.shift_pattern = Set(self.shift_pattern.clone());
      item.safety_critical_role = Set(self.safety_critical_role.clone());
      item.dvla_group_1_licence_held = Set(self.dvla_group_1_licence_held.clone());
      item.dvla_group_2_licence_held = Set(self.dvla_group_2_licence_held.clone());
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
        .prefix("api/patients/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
