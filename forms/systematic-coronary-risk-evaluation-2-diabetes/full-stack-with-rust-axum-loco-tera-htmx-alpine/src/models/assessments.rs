use chrono::Utc;
use sea_orm::{entity::prelude::*, ActiveValue, QueryOrder, QuerySelect};
use uuid::Uuid;

use super::_entities::assessments::{ActiveModel, Column, Entity, Model};
use crate::engine::types::{AssessmentData, GradingResult};

impl ActiveModel {
    pub fn new_draft() -> Result<Self, serde_json::Error> {
        let now = Utc::now().into();
        Ok(Self {
            id: ActiveValue::Set(Uuid::new_v4()),
            data: ActiveValue::Set(serde_json::to_value(AssessmentData::default())?),
            result: ActiveValue::Set(None),
            status: ActiveValue::Set("in_progress".to_string()),
            created_at: ActiveValue::Set(now),
            updated_at: ActiveValue::Set(now),
        })
    }

    pub fn new_with_data(data: &AssessmentData) -> Result<Self, serde_json::Error> {
        let now = Utc::now().into();
        Ok(Self {
            id: ActiveValue::Set(Uuid::new_v4()),
            data: ActiveValue::Set(serde_json::to_value(data)?),
            result: ActiveValue::Set(None),
            status: ActiveValue::Set("in_progress".to_string()),
            created_at: ActiveValue::Set(now),
            updated_at: ActiveValue::Set(now),
        })
    }
}

impl Model {
    pub fn assessment_data(&self) -> Result<AssessmentData, serde_json::Error> {
        serde_json::from_value(self.data.clone())
    }

    pub fn grading_result(&self) -> Result<Option<GradingResult>, serde_json::Error> {
        match &self.result {
            Some(v) => serde_json::from_value(v.clone()).map(Some),
            None => Ok(None),
        }
    }
}

pub async fn find_by_id(db: &DatabaseConnection, id: Uuid) -> Result<Option<Model>, DbErr> {
    Entity::find_by_id(id).one(db).await
}

pub async fn list_completed(db: &DatabaseConnection) -> Result<Vec<Model>, DbErr> {
    Entity::find()
        .filter(Column::Status.eq("completed"))
        .order_by_desc(Column::CreatedAt)
        .all(db)
        .await
}

pub async fn list_paginated(db: &DatabaseConnection, page: u64, per_page: u64) -> Result<Vec<Model>, DbErr> {
    Entity::find()
        .order_by_desc(Column::CreatedAt)
        .offset(page * per_page)
        .limit(per_page)
        .all(db)
        .await
}
