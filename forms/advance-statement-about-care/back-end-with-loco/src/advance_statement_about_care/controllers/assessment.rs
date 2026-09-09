#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::assessments::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub status: String,
    pub full_name: String,
    pub address: String,
    pub postcode: String,
    pub date_of_birth: Option<Date>,
    pub nhs_number: String,
    pub phone: String,
    pub email: String,
    pub gp_name: String,
    pub gp_practice: String,
    pub reason_for_statement: String,
    pub current_health_status: String,
    pub current_diagnoses: String,
    pub has_discussed_with_family: String,
    pub has_discussed_with_clinician: String,
    pub discussion_details: String,
    pub personal_values: String,
    pub quality_of_life_priorities: String,
    pub religious_beliefs: String,
    pub spiritual_needs: String,
    pub cultural_considerations: String,
    pub fears_and_concerns: String,
    pub things_that_matter_most: String,
    pub preferred_place_of_care: String,
    pub preferred_place_of_death: String,
    pub daily_routine_preferences: String,
    pub personal_care_preferences: String,
    pub food_and_drink_preferences: String,
    pub sleep_preferences: String,
    pub clothing_preferences: String,
    pub environment_preferences: String,
    pub pet_care_wishes: String,
    pub pain_management_preferences: String,
    pub attitude_to_hospital_admission: String,
    pub attitude_to_intensive_care: String,
    pub attitude_to_artificial_nutrition: String,
    pub attitude_to_artificial_hydration: String,
    pub medication_preferences: String,
    pub complementary_therapy_preferences: String,
    pub other_treatment_wishes: String,
    pub preferred_language: String,
    pub communication_aids: String,
    pub how_to_share_information: String,
    pub who_to_involve_in_decisions: String,
    pub information_sharing_restrictions: String,
    pub preferred_communication_style: String,
    pub primary_contact_name: String,
    pub primary_contact_relationship: String,
    pub primary_contact_phone: String,
    pub primary_contact_email: String,
    pub secondary_contact_name: String,
    pub secondary_contact_relationship: String,
    pub secondary_contact_phone: String,
    pub people_who_should_visit: String,
    pub people_who_should_not_visit: String,
    pub support_network_details: String,
    pub financial_arrangements: String,
    pub property_arrangements: String,
    pub insurance_details: String,
    pub will_location: String,
    pub has_lasting_power_of_attorney: String,
    pub lpa_details: String,
    pub funeral_wishes: String,
    pub burial_or_cremation: String,
    pub other_practical_matters: String,
    pub maker_signature_obtained: String,
    pub maker_signature_date: Option<Date>,
    pub witness_name: String,
    pub witness_address: String,
    pub witness_signature_obtained: String,
    pub witness_signature_date: Option<Date>,
    pub review_date: Option<Date>,
    pub review_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.status = Set(self.status.clone());
      item.full_name = Set(self.full_name.clone());
      item.address = Set(self.address.clone());
      item.postcode = Set(self.postcode.clone());
      item.date_of_birth = Set(self.date_of_birth);
      item.nhs_number = Set(self.nhs_number.clone());
      item.phone = Set(self.phone.clone());
      item.email = Set(self.email.clone());
      item.gp_name = Set(self.gp_name.clone());
      item.gp_practice = Set(self.gp_practice.clone());
      item.reason_for_statement = Set(self.reason_for_statement.clone());
      item.current_health_status = Set(self.current_health_status.clone());
      item.current_diagnoses = Set(self.current_diagnoses.clone());
      item.has_discussed_with_family = Set(self.has_discussed_with_family.clone());
      item.has_discussed_with_clinician = Set(self.has_discussed_with_clinician.clone());
      item.discussion_details = Set(self.discussion_details.clone());
      item.personal_values = Set(self.personal_values.clone());
      item.quality_of_life_priorities = Set(self.quality_of_life_priorities.clone());
      item.religious_beliefs = Set(self.religious_beliefs.clone());
      item.spiritual_needs = Set(self.spiritual_needs.clone());
      item.cultural_considerations = Set(self.cultural_considerations.clone());
      item.fears_and_concerns = Set(self.fears_and_concerns.clone());
      item.things_that_matter_most = Set(self.things_that_matter_most.clone());
      item.preferred_place_of_care = Set(self.preferred_place_of_care.clone());
      item.preferred_place_of_death = Set(self.preferred_place_of_death.clone());
      item.daily_routine_preferences = Set(self.daily_routine_preferences.clone());
      item.personal_care_preferences = Set(self.personal_care_preferences.clone());
      item.food_and_drink_preferences = Set(self.food_and_drink_preferences.clone());
      item.sleep_preferences = Set(self.sleep_preferences.clone());
      item.clothing_preferences = Set(self.clothing_preferences.clone());
      item.environment_preferences = Set(self.environment_preferences.clone());
      item.pet_care_wishes = Set(self.pet_care_wishes.clone());
      item.pain_management_preferences = Set(self.pain_management_preferences.clone());
      item.attitude_to_hospital_admission = Set(self.attitude_to_hospital_admission.clone());
      item.attitude_to_intensive_care = Set(self.attitude_to_intensive_care.clone());
      item.attitude_to_artificial_nutrition = Set(self.attitude_to_artificial_nutrition.clone());
      item.attitude_to_artificial_hydration = Set(self.attitude_to_artificial_hydration.clone());
      item.medication_preferences = Set(self.medication_preferences.clone());
      item.complementary_therapy_preferences = Set(self.complementary_therapy_preferences.clone());
      item.other_treatment_wishes = Set(self.other_treatment_wishes.clone());
      item.preferred_language = Set(self.preferred_language.clone());
      item.communication_aids = Set(self.communication_aids.clone());
      item.how_to_share_information = Set(self.how_to_share_information.clone());
      item.who_to_involve_in_decisions = Set(self.who_to_involve_in_decisions.clone());
      item.information_sharing_restrictions = Set(self.information_sharing_restrictions.clone());
      item.preferred_communication_style = Set(self.preferred_communication_style.clone());
      item.primary_contact_name = Set(self.primary_contact_name.clone());
      item.primary_contact_relationship = Set(self.primary_contact_relationship.clone());
      item.primary_contact_phone = Set(self.primary_contact_phone.clone());
      item.primary_contact_email = Set(self.primary_contact_email.clone());
      item.secondary_contact_name = Set(self.secondary_contact_name.clone());
      item.secondary_contact_relationship = Set(self.secondary_contact_relationship.clone());
      item.secondary_contact_phone = Set(self.secondary_contact_phone.clone());
      item.people_who_should_visit = Set(self.people_who_should_visit.clone());
      item.people_who_should_not_visit = Set(self.people_who_should_not_visit.clone());
      item.support_network_details = Set(self.support_network_details.clone());
      item.financial_arrangements = Set(self.financial_arrangements.clone());
      item.property_arrangements = Set(self.property_arrangements.clone());
      item.insurance_details = Set(self.insurance_details.clone());
      item.will_location = Set(self.will_location.clone());
      item.has_lasting_power_of_attorney = Set(self.has_lasting_power_of_attorney.clone());
      item.lpa_details = Set(self.lpa_details.clone());
      item.funeral_wishes = Set(self.funeral_wishes.clone());
      item.burial_or_cremation = Set(self.burial_or_cremation.clone());
      item.other_practical_matters = Set(self.other_practical_matters.clone());
      item.maker_signature_obtained = Set(self.maker_signature_obtained.clone());
      item.maker_signature_date = Set(self.maker_signature_date);
      item.witness_name = Set(self.witness_name.clone());
      item.witness_address = Set(self.witness_address.clone());
      item.witness_signature_obtained = Set(self.witness_signature_obtained.clone());
      item.witness_signature_date = Set(self.witness_signature_date);
      item.review_date = Set(self.review_date);
      item.review_notes = Set(self.review_notes.clone());
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
        .prefix("api/assessments/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
