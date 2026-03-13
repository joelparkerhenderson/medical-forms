use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Assessments::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Assessments::Id).uuid().not_null().primary_key())
                    .col(ColumnDef::new(Assessments::Data).json_binary().not_null())
                    .col(ColumnDef::new(Assessments::Result).json_binary().null())
                    .col(ColumnDef::new(Assessments::Status).string().not_null().default("in_progress"))
                    .col(ColumnDef::new(Assessments::CreatedAt).timestamp_with_time_zone().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(Assessments::UpdatedAt).timestamp_with_time_zone().not_null().default(Expr::current_timestamp()))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(Assessments::Table).to_owned()).await
    }
}

#[derive(Iden)]
enum Assessments {
    Table,
    Id,
    Data,
    Result,
    Status,
    CreatedAt,
    UpdatedAt,
}
