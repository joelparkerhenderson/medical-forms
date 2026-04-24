use loco_rs::cli;
use migration::Migrator;
use pre_operative_assessment_by_clinician::app::App;

#[tokio::main]
async fn main() -> loco_rs::Result<()> {
    cli::main::<App, Migrator>().await
}
