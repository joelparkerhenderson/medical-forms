//! Loco application hooks: route registration, workers, tasks, and lifecycle.

use std::path::Path;

use async_trait::async_trait;
use loco_rs::{
    app::{AppContext, Hooks, Initializer},
    bgworker::Queue,
    boot::{create_app, BootResult, StartMode},
    config::Config,
    controller::AppRoutes,
    db::{self, truncate_table},
    environment::Environment,
    task::Tasks,
    Result,
};
use migration::Migrator;

use crate::models::_entities::users;

/// App.
pub struct App;

#[async_trait]
impl Hooks for App {
    fn app_name() -> &'static str {
        env!("CARGO_CRATE_NAME")
    }

    fn app_version() -> String {
        format!(
            "{} ({})",
            env!("CARGO_PKG_VERSION"),
            option_env!("BUILD_SHA")
                .or(option_env!("GITHUB_SHA"))
                .unwrap_or("dev")
        )
    }

    async fn boot(
        mode: StartMode,
        environment: &Environment,
        config: Config,
    ) -> Result<BootResult> {
        create_app::<Self, Migrator>(mode, environment, config).await
    }

    async fn initializers(_ctx: &AppContext) -> Result<Vec<Box<dyn Initializer>>> {
        Ok(vec![])
    }

    fn routes(_ctx: &AppContext) -> AppRoutes {
        AppRoutes::with_default_routes()
            .add_route(crate::controllers::openapi::routes())
            .add_route(crate::controllers::inpatient_clinical_note_grade_flag::routes())
            .add_route(crate::controllers::inpatient_clinical_note_grade_rule::routes())
            .add_route(crate::controllers::inpatient_clinical_note_grade::routes())
            .add_route(crate::controllers::inpatient_clinical_note_job::routes())
            .add_route(crate::controllers::inpatient_clinical_note_investigation::routes())
            .add_route(crate::controllers::inpatient_clinical_note_medication_change::routes())
            .add_route(crate::controllers::inpatient_clinical_note_problem::routes())
            .add_route(crate::controllers::inpatient_clinical_note::routes())
            .add_route(crate::controllers::clinician::routes())
            .add_route(crate::controllers::patient::routes())
            .add_route(crate::controllers::auth::routes())
    }

    async fn connect_workers(_ctx: &AppContext, _queue: &Queue) -> Result<()> {
        Ok(())
    }

    #[allow(unused_variables)]
    fn register_tasks(tasks: &mut Tasks) {}

    async fn truncate(ctx: &AppContext) -> Result<()> {
        truncate_table(&ctx.db, users::Entity).await?;
        Ok(())
    }

    async fn seed(ctx: &AppContext, _base: &Path) -> Result<()> {
        db::seed::<users::ActiveModel>(
            &ctx.db,
            &format!("{}/src/inpatient_clinical_note/fixtures/users.yaml", env!("CARGO_MANIFEST_DIR")),
        )
            .await?;
        Ok(())
    }
}
