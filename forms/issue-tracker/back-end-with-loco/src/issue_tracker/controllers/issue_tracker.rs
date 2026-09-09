#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::issue_trackers::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub reporter_id: i64,
    pub status: String,
    pub reported_at: DateTimeWithTimeZone,
    pub discovered_at: Option<DateTimeWithTimeZone>,
    pub started_at: Option<DateTimeWithTimeZone>,
    pub resolved_at: Option<DateTimeWithTimeZone>,
    pub issue_category: String,
    pub environment: String,
    pub system_name: String,
    pub component: String,
    pub customer_or_project_tag: String,
    pub external_reference: String,
    pub cc_summary: String,
    pub cc_long_description: String,
    pub cc_reported_by_name: String,
    pub cc_reported_via: String,
    pub pt_discoverer_name: String,
    pub pt_affected_users_count: Option<i32>,
    pub pt_affected_user_groups: String,
    pub pt_assignees: String,
    pub pt_stakeholders_to_inform: String,
    pub pt_observers: String,
    pub sx_external_signals: String,
    pub sx_alert_ids: String,
    pub sx_error_messages: String,
    pub sx_screenshots_url: String,
    pub sx_logs_url: String,
    pub sx_first_observed_at: Option<DateTimeWithTimeZone>,
    pub fx_broken_components: String,
    pub fx_failed_services: String,
    pub fx_stuck_processes: String,
    pub fx_hardware_faults: String,
    pub fx_data_corruption: String,
    pub hx_related_issues: String,
    pub hx_prior_occurrences: Option<i32>,
    pub hx_recent_change_url: String,
    pub hx_references: String,
    pub hx_timeline: String,
    pub ix_hypotheses: String,
    pub ix_repro_steps: String,
    pub ix_diagnostic_queries: String,
    pub ix_tests_run: String,
    pub ix_blocking_unknowns: String,
    pub dx_root_cause: String,
    pub dx_contributing_causes: String,
    pub dx_scope: String,
    pub dx_confirmed: String,
    pub tx_mitigation_steps: String,
    pub tx_fix_plan: String,
    pub tx_workaround: String,
    pub tx_rollback_plan: String,
    pub tx_communication_plan: String,
    pub px_expected_resolution_at: Option<DateTimeWithTimeZone>,
    pub px_residual_risk: String,
    pub px_monitoring_plan: String,
    pub px_recurrence_likelihood: String,
    pub px_lessons_learned: String,
    pub score_by_priority_rank: Option<i32>,
    pub score_by_severity_of_impact: Option<i32>,
    pub score_by_magnitude_of_damage: Option<i32>,
    pub score_by_harm_grade: Option<i32>,
    pub score_by_failure_condition: String,
    pub score_by_moscow_requirement: Option<i32>,
    pub score_by_frequency_percent: Option<f64>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.reporter_id = Set(self.reporter_id);
      item.status = Set(self.status.clone());
      item.reported_at = Set(self.reported_at);
      item.discovered_at = Set(self.discovered_at);
      item.started_at = Set(self.started_at);
      item.resolved_at = Set(self.resolved_at);
      item.issue_category = Set(self.issue_category.clone());
      item.environment = Set(self.environment.clone());
      item.system_name = Set(self.system_name.clone());
      item.component = Set(self.component.clone());
      item.customer_or_project_tag = Set(self.customer_or_project_tag.clone());
      item.external_reference = Set(self.external_reference.clone());
      item.cc_summary = Set(self.cc_summary.clone());
      item.cc_long_description = Set(self.cc_long_description.clone());
      item.cc_reported_by_name = Set(self.cc_reported_by_name.clone());
      item.cc_reported_via = Set(self.cc_reported_via.clone());
      item.pt_discoverer_name = Set(self.pt_discoverer_name.clone());
      item.pt_affected_users_count = Set(self.pt_affected_users_count);
      item.pt_affected_user_groups = Set(self.pt_affected_user_groups.clone());
      item.pt_assignees = Set(self.pt_assignees.clone());
      item.pt_stakeholders_to_inform = Set(self.pt_stakeholders_to_inform.clone());
      item.pt_observers = Set(self.pt_observers.clone());
      item.sx_external_signals = Set(self.sx_external_signals.clone());
      item.sx_alert_ids = Set(self.sx_alert_ids.clone());
      item.sx_error_messages = Set(self.sx_error_messages.clone());
      item.sx_screenshots_url = Set(self.sx_screenshots_url.clone());
      item.sx_logs_url = Set(self.sx_logs_url.clone());
      item.sx_first_observed_at = Set(self.sx_first_observed_at);
      item.fx_broken_components = Set(self.fx_broken_components.clone());
      item.fx_failed_services = Set(self.fx_failed_services.clone());
      item.fx_stuck_processes = Set(self.fx_stuck_processes.clone());
      item.fx_hardware_faults = Set(self.fx_hardware_faults.clone());
      item.fx_data_corruption = Set(self.fx_data_corruption.clone());
      item.hx_related_issues = Set(self.hx_related_issues.clone());
      item.hx_prior_occurrences = Set(self.hx_prior_occurrences);
      item.hx_recent_change_url = Set(self.hx_recent_change_url.clone());
      item.hx_references = Set(self.hx_references.clone());
      item.hx_timeline = Set(self.hx_timeline.clone());
      item.ix_hypotheses = Set(self.ix_hypotheses.clone());
      item.ix_repro_steps = Set(self.ix_repro_steps.clone());
      item.ix_diagnostic_queries = Set(self.ix_diagnostic_queries.clone());
      item.ix_tests_run = Set(self.ix_tests_run.clone());
      item.ix_blocking_unknowns = Set(self.ix_blocking_unknowns.clone());
      item.dx_root_cause = Set(self.dx_root_cause.clone());
      item.dx_contributing_causes = Set(self.dx_contributing_causes.clone());
      item.dx_scope = Set(self.dx_scope.clone());
      item.dx_confirmed = Set(self.dx_confirmed.clone());
      item.tx_mitigation_steps = Set(self.tx_mitigation_steps.clone());
      item.tx_fix_plan = Set(self.tx_fix_plan.clone());
      item.tx_workaround = Set(self.tx_workaround.clone());
      item.tx_rollback_plan = Set(self.tx_rollback_plan.clone());
      item.tx_communication_plan = Set(self.tx_communication_plan.clone());
      item.px_expected_resolution_at = Set(self.px_expected_resolution_at);
      item.px_residual_risk = Set(self.px_residual_risk.clone());
      item.px_monitoring_plan = Set(self.px_monitoring_plan.clone());
      item.px_recurrence_likelihood = Set(self.px_recurrence_likelihood.clone());
      item.px_lessons_learned = Set(self.px_lessons_learned.clone());
      item.score_by_priority_rank = Set(self.score_by_priority_rank);
      item.score_by_severity_of_impact = Set(self.score_by_severity_of_impact);
      item.score_by_magnitude_of_damage = Set(self.score_by_magnitude_of_damage);
      item.score_by_harm_grade = Set(self.score_by_harm_grade);
      item.score_by_failure_condition = Set(self.score_by_failure_condition.clone());
      item.score_by_moscow_requirement = Set(self.score_by_moscow_requirement);
      item.score_by_frequency_percent = Set(self.score_by_frequency_percent);
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
        .prefix("api/issue_trackers/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
