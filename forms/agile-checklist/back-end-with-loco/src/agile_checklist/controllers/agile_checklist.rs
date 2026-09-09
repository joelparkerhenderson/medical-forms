#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::agile_checklists::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub respondent_id: i64,
    pub status: String,
    pub assessment_date: Option<Date>,
    pub assessment_period: String,
    pub t01_problems_to_solve: String,
    pub t02_decisions_without_manager: String,
    pub t03_adopt_and_improve_practices: String,
    pub t04_actively_coordinate: String,
    pub t05_openly_share_ideas: String,
    pub t06_decide_how_to_execute: String,
    pub t07_act_on_feedback: String,
    pub t08_rarely_wait: String,
    pub t09_fully_complete_work: String,
    pub t10_manage_own_performance: String,
    pub t11_understand_agile: String,
    pub t12_high_quality: String,
    pub t13_welcome_change: String,
    pub t14_collaborate_to_finish: String,
    pub t15_admit_mistakes: String,
    pub t16_work_outside_specialty: String,
    pub t17_seek_new_skills: String,
    pub t18_improve_skills: String,
    pub t19_improve_ways_of_working: String,
    pub t20_various_ways_communicating: String,
    pub t21_received_basic_training: String,
    pub t22_safe_to_dissent: String,
    pub t23_start_with_open_issues: String,
    pub t24_motivated: String,
    pub t25_pride_in_craft: String,
    pub s01_know_priority_factors: String,
    pub s02_accept_plan_ranges: String,
    pub s03_accept_plan_changes: String,
    pub s04_evaluate_product: String,
    pub s05_champion_agile: String,
    pub s06_respect_quality: String,
    pub s07_delegate_authority: String,
    pub s08_keep_authority_delegated: String,
    pub s09_support_experiments: String,
    pub s10_no_punish_experiments: String,
    pub s11_communicate_agile_goals: String,
    pub s12_encourage_new_skills: String,
    pub s13_encourage_new_ways: String,
    pub s14_develop_people: String,
    pub p01_early_good_release: String,
    pub p02_educated_sponsor: String,
    pub p03_quick_decisions: String,
    pub p04_plans_data_based: String,
    pub p05_proactive_dependencies: String,
    pub p06_good_intentions: String,
    pub p07_reciprocal_trust: String,
    pub p08_docs_plus_conversations: String,
    pub p09_update_plans: String,
    pub p10_non_punitive: String,
    pub p11_outside_groups_aware: String,
    pub p12_finished_over_wip: String,
    pub p13_quality_over_deadline: String,
    pub p14_solution_over_blame: String,
    pub p15_change_agents_in_place: String,
    pub p16_agile_beyond_origin: String,
    pub p17_one_team: String,
    pub p18_honor_commitments: String,
    pub overall_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.respondent_id = Set(self.respondent_id);
      item.status = Set(self.status.clone());
      item.assessment_date = Set(self.assessment_date);
      item.assessment_period = Set(self.assessment_period.clone());
      item.t01_problems_to_solve = Set(self.t01_problems_to_solve.clone());
      item.t02_decisions_without_manager = Set(self.t02_decisions_without_manager.clone());
      item.t03_adopt_and_improve_practices = Set(self.t03_adopt_and_improve_practices.clone());
      item.t04_actively_coordinate = Set(self.t04_actively_coordinate.clone());
      item.t05_openly_share_ideas = Set(self.t05_openly_share_ideas.clone());
      item.t06_decide_how_to_execute = Set(self.t06_decide_how_to_execute.clone());
      item.t07_act_on_feedback = Set(self.t07_act_on_feedback.clone());
      item.t08_rarely_wait = Set(self.t08_rarely_wait.clone());
      item.t09_fully_complete_work = Set(self.t09_fully_complete_work.clone());
      item.t10_manage_own_performance = Set(self.t10_manage_own_performance.clone());
      item.t11_understand_agile = Set(self.t11_understand_agile.clone());
      item.t12_high_quality = Set(self.t12_high_quality.clone());
      item.t13_welcome_change = Set(self.t13_welcome_change.clone());
      item.t14_collaborate_to_finish = Set(self.t14_collaborate_to_finish.clone());
      item.t15_admit_mistakes = Set(self.t15_admit_mistakes.clone());
      item.t16_work_outside_specialty = Set(self.t16_work_outside_specialty.clone());
      item.t17_seek_new_skills = Set(self.t17_seek_new_skills.clone());
      item.t18_improve_skills = Set(self.t18_improve_skills.clone());
      item.t19_improve_ways_of_working = Set(self.t19_improve_ways_of_working.clone());
      item.t20_various_ways_communicating = Set(self.t20_various_ways_communicating.clone());
      item.t21_received_basic_training = Set(self.t21_received_basic_training.clone());
      item.t22_safe_to_dissent = Set(self.t22_safe_to_dissent.clone());
      item.t23_start_with_open_issues = Set(self.t23_start_with_open_issues.clone());
      item.t24_motivated = Set(self.t24_motivated.clone());
      item.t25_pride_in_craft = Set(self.t25_pride_in_craft.clone());
      item.s01_know_priority_factors = Set(self.s01_know_priority_factors.clone());
      item.s02_accept_plan_ranges = Set(self.s02_accept_plan_ranges.clone());
      item.s03_accept_plan_changes = Set(self.s03_accept_plan_changes.clone());
      item.s04_evaluate_product = Set(self.s04_evaluate_product.clone());
      item.s05_champion_agile = Set(self.s05_champion_agile.clone());
      item.s06_respect_quality = Set(self.s06_respect_quality.clone());
      item.s07_delegate_authority = Set(self.s07_delegate_authority.clone());
      item.s08_keep_authority_delegated = Set(self.s08_keep_authority_delegated.clone());
      item.s09_support_experiments = Set(self.s09_support_experiments.clone());
      item.s10_no_punish_experiments = Set(self.s10_no_punish_experiments.clone());
      item.s11_communicate_agile_goals = Set(self.s11_communicate_agile_goals.clone());
      item.s12_encourage_new_skills = Set(self.s12_encourage_new_skills.clone());
      item.s13_encourage_new_ways = Set(self.s13_encourage_new_ways.clone());
      item.s14_develop_people = Set(self.s14_develop_people.clone());
      item.p01_early_good_release = Set(self.p01_early_good_release.clone());
      item.p02_educated_sponsor = Set(self.p02_educated_sponsor.clone());
      item.p03_quick_decisions = Set(self.p03_quick_decisions.clone());
      item.p04_plans_data_based = Set(self.p04_plans_data_based.clone());
      item.p05_proactive_dependencies = Set(self.p05_proactive_dependencies.clone());
      item.p06_good_intentions = Set(self.p06_good_intentions.clone());
      item.p07_reciprocal_trust = Set(self.p07_reciprocal_trust.clone());
      item.p08_docs_plus_conversations = Set(self.p08_docs_plus_conversations.clone());
      item.p09_update_plans = Set(self.p09_update_plans.clone());
      item.p10_non_punitive = Set(self.p10_non_punitive.clone());
      item.p11_outside_groups_aware = Set(self.p11_outside_groups_aware.clone());
      item.p12_finished_over_wip = Set(self.p12_finished_over_wip.clone());
      item.p13_quality_over_deadline = Set(self.p13_quality_over_deadline.clone());
      item.p14_solution_over_blame = Set(self.p14_solution_over_blame.clone());
      item.p15_change_agents_in_place = Set(self.p15_change_agents_in_place.clone());
      item.p16_agile_beyond_origin = Set(self.p16_agile_beyond_origin.clone());
      item.p17_one_team = Set(self.p17_one_team.clone());
      item.p18_honor_commitments = Set(self.p18_honor_commitments.clone());
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
        .prefix("api/agile_checklists/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
