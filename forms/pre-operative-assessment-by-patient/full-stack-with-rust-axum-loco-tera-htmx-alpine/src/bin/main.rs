use loco_rs::cli;
use migration::Migrator;
use pre_op_assessment_tera_crate::app::App;

#[tokio::main]
async fn main() -> loco_rs::Result<()> {
    cli::main::<App, Migrator>().await
}
