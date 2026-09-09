//! JSON controller for architecture decision records.
//!
//! Exposes the ADR register as a pure JSON API:
//!
//! - `POST /architecture_decision_records` — create an ADR (validates the
//!   `status` / `decision_group` enums, auto-assigns the next sequential
//!   number, and auto-derives a slug from the title).
//! - `GET /api/adrs` — the JSON register consumed by the dashboard.
//! - `GET /api/adrs/{slug}` — a single ADR rendered as Tyree & Akerman
//!   Markdown plus row metadata.
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use std::fmt::Write as _;
use sea_orm::{sea_query::Order, QueryOrder, QuerySelect};
use serde::{Deserialize, Serialize};

use crate::models::_entities::{
    architecture_decision_record_notes, architecture_decision_record_positions,
    architecture_decision_records::{ActiveModel, Column, Entity, Model},
    authors, organizations,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Params {
    author_id: i64,
    organization_id: i64,
    slug: Option<String>,
    number: Option<i32>,
    title: String,
    decision_date: Option<Date>,
    status: Option<String>,
    decision_group: Option<String>,
    issue: Option<String>,
    decision: Option<String>,
    assumptions: Option<String>,
    constraints: Option<String>,
    argument: Option<String>,
    implications: Option<String>,
    related_decisions: Option<String>,
    related_requirements: Option<String>,
    related_artifacts: Option<String>,
    related_principles: Option<String>,
    signed_off_by: Option<String>,
    signed_off_at: Option<DateTimeWithTimeZone>,
}

/// Permitted values for the `status` enum; mirrors the SQL CHECK constraint
/// on `architecture_decision_records.status`. An empty string is also
/// allowed since SQL defaults to it for unset rows.
const VALID_STATUSES: &[&str] = &[
    "pending",
    "decided",
    "approved",
    "superseded",
    "deprecated",
    "",
];

/// Permitted values for the `decision_group` enum; mirrors the SQL CHECK
/// constraint on `architecture_decision_records.decision_group`.
const VALID_GROUPS: &[&str] = &[
    "business",
    "data",
    "integration",
    "presentation",
    "security",
    "infrastructure",
    "operations",
    "governance",
    "other",
    "",
];

/// Derive a URL-safe slug from a free-text title.
/// Lowercases, replaces any run of non-alphanumeric chars with a single
/// hyphen, and trims leading/trailing hyphens. Examples:
///   "Use PostgreSQL for primary storage" → "use-postgresql-for-primary-storage"
///   "  Multiple   spaces & symbols!"     → "multiple-spaces-symbols"
///   ""                                   → ""
fn slugify(title: &str) -> String {
    let mut out = String::with_capacity(title.len());
    let mut prev_hyphen = true;
    for ch in title.chars() {
        if ch.is_ascii_alphanumeric() {
            for low in ch.to_lowercase() {
                out.push(low);
            }
            prev_hyphen = false;
        } else if !prev_hyphen {
            out.push('-');
            prev_hyphen = true;
        }
    }
    if out.ends_with('-') {
        out.pop();
    }
    out
}

impl Params {
    /// Validate `Params` against the SQL CHECK constraints so users get a
    /// readable error rather than a Postgres constraint-violation surface.
    fn validate(&self) -> Result<()> {
        if self.title.trim().is_empty() {
            return Err(Error::BadRequest("title is required".to_string()));
        }
        if let Some(s) = &self.status {
            if !VALID_STATUSES.contains(&s.as_str()) {
                return Err(Error::BadRequest(format!(
                    "status `{s}` is not one of {VALID_STATUSES:?}"
                )));
            }
        }
        if let Some(g) = &self.decision_group {
            if !VALID_GROUPS.contains(&g.as_str()) {
                return Err(Error::BadRequest(format!(
                    "decision_group `{g}` is not one of {VALID_GROUPS:?}"
                )));
            }
        }
        Ok(())
    }

    fn update(&self, item: &mut ActiveModel) {
        item.author_id = Set(self.author_id);
        item.organization_id = Set(self.organization_id);
        item.slug = Set(self.slug.clone().unwrap_or_default());
        item.number = Set(self.number);
        item.title = Set(self.title.clone());
        item.decision_date = Set(self.decision_date);
        item.status = Set(self.status.clone().unwrap_or_default());
        item.decision_group = Set(self.decision_group.clone().unwrap_or_default());
        item.issue = Set(self.issue.clone().unwrap_or_default());
        item.decision = Set(self.decision.clone().unwrap_or_default());
        item.assumptions = Set(self.assumptions.clone().unwrap_or_default());
        item.constraints = Set(self.constraints.clone().unwrap_or_default());
        item.argument = Set(self.argument.clone().unwrap_or_default());
        item.implications = Set(self.implications.clone().unwrap_or_default());
        item.related_decisions = Set(self.related_decisions.clone().unwrap_or_default());
        item.related_requirements = Set(self.related_requirements.clone().unwrap_or_default());
        item.related_artifacts = Set(self.related_artifacts.clone().unwrap_or_default());
        item.related_principles = Set(self.related_principles.clone().unwrap_or_default());
        item.signed_off_by = Set(self.signed_off_by.clone().unwrap_or_default());
        item.signed_off_at = Set(self.signed_off_at);
    }
}

#[debug_handler]
async fn add(State(ctx): State<AppContext>, Json(mut params): Json<Params>) -> Result<Response> {
    params.validate()?;
    // Auto-assign the next sequential ADR number when the caller omits it.
    // MAX(number) ignores rows where number IS NULL; the register starts at 1.
    if params.number.is_none() {
        let row: Option<(Option<i32>,)> = Entity::find()
            .select_only()
            .column_as(Column::Number.max(), "max")
            .into_tuple()
            .one(&ctx.db)
            .await?;
        let max = row.and_then(|(m,)| m).unwrap_or(0);
        params.number = Some(max + 1);
    }
    // Auto-derive slug from title when missing.
    if params.slug.as_deref().unwrap_or("").trim().is_empty() {
        let derived = slugify(&params.title);
        if !derived.is_empty() {
            params.slug = Some(derived);
        }
    }
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let _ = item.insert(&ctx.db).await?;
    format::redirect("/architecture_decision_records")
}

fn bullets(text: &str) -> String {
    let lines: Vec<&str> = text
        .lines()
        .map(str::trim)
        .filter(|l| !l.is_empty())
        .collect();
    if lines.is_empty() {
        "_None._\n".to_string()
    } else {
        let mut out = String::new();
        for l in lines {
            out.push_str("- ");
            out.push_str(l);
            out.push('\n');
        }
        out
    }
}

fn pad4(n: Option<i32>) -> String {
    match n {
        Some(v) => format!("{v:04}"),
        None => "NNNN".to_string(),
    }
}

/// Render an ADR (and its joined positions, notes, author, organization) as
/// a Tyree & Akerman Markdown document for the JSON `/api/adrs/{slug}`
/// viewer endpoint.
#[allow(clippy::too_many_lines)] // linear Markdown builder; splitting adds indirection, not clarity
async fn render_markdown(ctx: &AppContext, item: &Model) -> Result<String> {
    let id = item.id;
    let author = authors::Entity::find_by_id(item.author_id)
        .one(&ctx.db)
        .await?;
    let org = organizations::Entity::find_by_id(item.organization_id)
        .one(&ctx.db)
        .await?;
    let positions = architecture_decision_record_positions::Entity::find()
        .filter(
            architecture_decision_record_positions::Column::ArchitectureDecisionRecordId.eq(id),
        )
        .order_by(
            architecture_decision_record_positions::Column::Ordinal,
            Order::Asc,
        )
        .all(&ctx.db)
        .await?;
    let notes = architecture_decision_record_notes::Entity::find()
        .filter(architecture_decision_record_notes::Column::ArchitectureDecisionRecordId.eq(id))
        .order_by(architecture_decision_record_notes::Column::NotedAt, Order::Asc)
        .all(&ctx.db)
        .await?;

    let mut md = String::new();
    let heading = format!("{} — {}", pad4(item.number), item.title);
    let _ = write!(md, "# {heading}\n\n");
    let _ = writeln!(md,
        "- **Status:** {}",
        if item.status.is_empty() { "pending" } else { &item.status }
    );
    if !item.decision_group.is_empty() {
        let _ = writeln!(md, "- **Group:** {}", item.decision_group);
    }
    if let Some(d) = item.decision_date {
        let _ = writeln!(md, "- **Date:** {d}");
    }
    if let Some(a) = &author {
        let email = if a.email.is_empty() {
            String::new()
        } else {
            format!(" <{}>", a.email)
        };
        let role = if a.role.is_empty() {
            String::new()
        } else {
            format!(" ({})", a.role)
        };
        let _ = writeln!(md, "- **Author:** {}{}{}", a.name, email, role);
    }
    if let Some(o) = &org {
        let _ = writeln!(md, "- **Organization:** {}", o.name);
    }
    md.push('\n');

    let section = |md: &mut String, heading: &str, body: &str| {
        let _ = writeln!(md, "## {heading}");
        md.push_str(if body.trim().is_empty() { "_TBD_" } else { body });
        md.push_str("\n\n");
    };

    section(&mut md, "Issue", &item.issue);
    section(&mut md, "Decision", &item.decision);
    section(&mut md, "Assumptions", &item.assumptions);
    section(&mut md, "Constraints", &item.constraints);

    md.push_str("## Positions\n");
    if positions.is_empty() {
        md.push_str("_None._\n");
    } else {
        for (i, p) in positions.iter().enumerate() {
            let chosen = if p.is_chosen {
                "  ✓ chosen"
            } else {
                ""
            };
            let _ = writeln!(md, "### {}. {}{}", i + 1, p.name, chosen);
            if !p.description.is_empty() {
                md.push_str(&p.description);
                md.push('\n');
            }
            if !p.model_or_diagram_url.is_empty() {
                let _ = writeln!(md, "Model/diagram: <{}>", p.model_or_diagram_url);
            }
            if !p.pros.trim().is_empty() {
                md.push_str("\n**Pros:**\n");
                md.push_str(&bullets(&p.pros));
            }
            if !p.cons.trim().is_empty() {
                md.push_str("**Cons:**\n");
                md.push_str(&bullets(&p.cons));
            }
            md.push('\n');
        }
    }
    md.push('\n');

    section(&mut md, "Argument", &item.argument);
    section(&mut md, "Implications", &item.implications);

    md.push_str("## Related Decisions\n");
    md.push_str(&bullets(&item.related_decisions));
    md.push_str("## Related Requirements\n");
    md.push_str(&bullets(&item.related_requirements));
    md.push_str("## Related Artifacts\n");
    md.push_str(&bullets(&item.related_artifacts));
    md.push_str("## Related Principles\n");
    md.push_str(&bullets(&item.related_principles));

    md.push_str("## Notes\n");
    if notes.is_empty() {
        md.push_str("_None._\n");
    } else {
        for n in &notes {
            let when = n.noted_at.to_rfc3339();
            let who = if n.noted_by.is_empty() {
                "unknown"
            } else {
                &n.noted_by
            };
            let _ = writeln!(md, "- **{}** ({}): {}", when, who, n.body);
        }
    }
    md.push('\n');

    if !item.signed_off_by.is_empty() {
        md.push_str("---\n");
        let when = item
            .signed_off_at
            .map(|d| format!(" on {}", d.to_rfc3339()))
            .unwrap_or_default();
        let _ = writeln!(md, "Signed off by {}{}.", item.signed_off_by, when);
    }

    Ok(md)
}

/// JSON ADR view by slug. Returns the row metadata plus the rendered
/// Markdown body, so the `SvelteKit` dashboard's `[slug]` route can render
/// inline without a second round trip.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AdrViewApi {
    id: String,
    number: Option<i32>,
    slug: String,
    title: String,
    status: String,
    decision_group: String,
    decision_date: String,
    author_name: String,
    markdown: String,
}

#[debug_handler]
async fn api_show_by_slug(
    Path(slug): Path<String>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let item = Entity::find()
        .filter(Column::Slug.eq(&slug))
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;
    let id = item.id;
    let author_name = authors::Entity::find_by_id(item.author_id)
        .one(&ctx.db)
        .await?
        .map(|a| a.name)
        .unwrap_or_default();
    let md = render_markdown(&ctx, &item).await?;

    format::json(AdrViewApi {
        id: id.to_string(),
        number: item.number,
        slug: item.slug.clone(),
        title: item.title.clone(),
        status: item.status.clone(),
        decision_group: item.decision_group.clone(),
        decision_date: item
            .decision_date
            .map(|d| d.to_string())
            .unwrap_or_default(),
        author_name,
        markdown: md,
    })
}

/// JSON shape consumed by the `SvelteKit` dashboard's `AdrRow` interface.
/// Field names match the front-end's camelCase convention.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AdrRowApi {
    id: String,
    number: Option<i32>,
    slug: String,
    title: String,
    status: String,
    decision_group: String,
    decision_date: String,
    author_name: String,
}

#[debug_handler]
async fn api_index(State(ctx): State<AppContext>) -> Result<Response> {
    let rows = Entity::find()
        .order_by(Column::Number, Order::Asc)
        .order_by(Column::Id, Order::Asc)
        .all(&ctx.db)
        .await?;

    let mut out: Vec<AdrRowApi> = Vec::with_capacity(rows.len());
    for r in rows {
        let author_name = authors::Entity::find_by_id(r.author_id)
            .one(&ctx.db)
            .await?
            .map(|a| a.name)
            .unwrap_or_default();
        out.push(AdrRowApi {
            id: r.id.to_string(),
            number: r.number,
            slug: r.slug.clone(),
            title: r.title,
            status: r.status,
            decision_group: r.decision_group,
            decision_date: r.decision_date.map(|d| d.to_string()).unwrap_or_default(),
            author_name,
        });
    }
    format::json(out)
}

/// Routes for the JSON register viewer under `/api/adrs`.
pub fn api_routes() -> Routes {
    Routes::new()
        .prefix("api/adrs")
        .add("/", get(api_index))
        .add("{slug}", get(api_show_by_slug))
}

/// Routes for creating ADR rows under `/architecture_decision_records`.
pub fn routes() -> Routes {
    Routes::new()
        .prefix("architecture_decision_records/")
        .add("/", post(add))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn base_params() -> Params {
        Params {
            author_id: 1,
            organization_id: 1,
            slug: None,
            number: None,
            title: "Test".to_string(),
            decision_date: None,
            status: None,
            decision_group: None,
            issue: None,
            decision: None,
            assumptions: None,
            constraints: None,
            argument: None,
            implications: None,
            related_decisions: None,
            related_requirements: None,
            related_artifacts: None,
            related_principles: None,
            signed_off_by: None,
            signed_off_at: None,
        }
    }

    #[test]
    fn validate_accepts_known_status() {
        let mut p = base_params();
        for s in &["pending", "decided", "approved", "superseded", "deprecated", ""] {
            p.status = Some((*s).to_string());
            assert!(p.validate().is_ok(), "status {s} should validate");
        }
    }

    #[test]
    fn validate_rejects_unknown_status() {
        let mut p = base_params();
        p.status = Some("provisional".to_string());
        assert!(p.validate().is_err());
    }

    #[test]
    fn validate_accepts_known_group() {
        let mut p = base_params();
        for g in &[
            "business",
            "data",
            "integration",
            "presentation",
            "security",
            "infrastructure",
            "operations",
            "governance",
            "other",
            "",
        ] {
            p.decision_group = Some((*g).to_string());
            assert!(p.validate().is_ok(), "group {g} should validate");
        }
    }

    #[test]
    fn validate_rejects_unknown_group() {
        let mut p = base_params();
        p.decision_group = Some("legal".to_string());
        assert!(p.validate().is_err());
    }

    #[test]
    fn validate_requires_title() {
        let mut p = base_params();
        p.title = "   ".to_string();
        assert!(p.validate().is_err());
    }

    #[test]
    fn slugify_handles_common_titles() {
        assert_eq!(
            slugify("Use PostgreSQL for primary storage"),
            "use-postgresql-for-primary-storage"
        );
        assert_eq!(
            slugify("  Multiple   spaces & symbols!"),
            "multiple-spaces-symbols"
        );
        assert_eq!(slugify("ADR 0042: pick a thing"), "adr-0042-pick-a-thing");
        assert_eq!(slugify(""), "");
        assert_eq!(slugify("---"), "");
        assert_eq!(slugify("---trim-leading---"), "trim-leading");
        // Unicode letters: stripped because we restrict to ASCII alphanumeric.
        assert_eq!(slugify("Café résumé"), "caf-r-sum");
    }
}
