#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::child_safeguarding_referrals::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub referrer_organisation: String,
    pub referred_at: Option<DateTimeWithTimeZone>,
    pub relationship_to_child: String,
    pub child_age: Option<f64>,
    pub child_setting: String,
    pub child_reference: String,
    pub child_ethnicity: String,
    pub child_first_language: String,
    pub child_disability: String,
    pub carers: String,
    pub household_members: String,
    pub other_children: String,
    pub professionals_involved: String,
    pub concern_description: String,
    pub concern_onset: String,
    pub child_disclosed: String,
    pub referrer_observations: String,
    pub primary_category: String,
    pub additional_categories: String,
    pub presenting_evidence: String,
    pub immediate_danger: String,
    pub child_whereabouts: String,
    pub who_with_child: String,
    pub alleged_person_in_contact: String,
    pub other_children_at_risk: String,
    pub consent_sought: String,
    pub consent_status: String,
    pub sharing_basis_without_consent: String,
    pub family_aware: String,
    pub unsafe_to_inform_reason: String,
    pub agencies_contacted: String,
    pub strategy_discussion_held: String,
    pub previous_safeguarding_history: String,
    pub requested_action: String,
    pub referrer_declaration: String,
    pub notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.referrer_organisation = Set(self.referrer_organisation.clone());
      item.referred_at = Set(self.referred_at);
      item.relationship_to_child = Set(self.relationship_to_child.clone());
      item.child_age = Set(self.child_age);
      item.child_setting = Set(self.child_setting.clone());
      item.child_reference = Set(self.child_reference.clone());
      item.child_ethnicity = Set(self.child_ethnicity.clone());
      item.child_first_language = Set(self.child_first_language.clone());
      item.child_disability = Set(self.child_disability.clone());
      item.carers = Set(self.carers.clone());
      item.household_members = Set(self.household_members.clone());
      item.other_children = Set(self.other_children.clone());
      item.professionals_involved = Set(self.professionals_involved.clone());
      item.concern_description = Set(self.concern_description.clone());
      item.concern_onset = Set(self.concern_onset.clone());
      item.child_disclosed = Set(self.child_disclosed.clone());
      item.referrer_observations = Set(self.referrer_observations.clone());
      item.primary_category = Set(self.primary_category.clone());
      item.additional_categories = Set(self.additional_categories.clone());
      item.presenting_evidence = Set(self.presenting_evidence.clone());
      item.immediate_danger = Set(self.immediate_danger.clone());
      item.child_whereabouts = Set(self.child_whereabouts.clone());
      item.who_with_child = Set(self.who_with_child.clone());
      item.alleged_person_in_contact = Set(self.alleged_person_in_contact.clone());
      item.other_children_at_risk = Set(self.other_children_at_risk.clone());
      item.consent_sought = Set(self.consent_sought.clone());
      item.consent_status = Set(self.consent_status.clone());
      item.sharing_basis_without_consent = Set(self.sharing_basis_without_consent.clone());
      item.family_aware = Set(self.family_aware.clone());
      item.unsafe_to_inform_reason = Set(self.unsafe_to_inform_reason.clone());
      item.agencies_contacted = Set(self.agencies_contacted.clone());
      item.strategy_discussion_held = Set(self.strategy_discussion_held.clone());
      item.previous_safeguarding_history = Set(self.previous_safeguarding_history.clone());
      item.requested_action = Set(self.requested_action.clone());
      item.referrer_declaration = Set(self.referrer_declaration.clone());
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
        .prefix("api/child_safeguarding_referrals/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
