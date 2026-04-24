# XML representations

Example XML instances and matching DTD schemas for each SQL table entity, so
that a form's data can be exported, transmitted, or validated outside of the
PostgreSQL database. Generated from `sql-migrations/`.

Slug: xml-representations

- Search pattern: `forms/*/sql-migrations/*.sql`
- Search pattern: `forms/*/xml-representations/*.xml`
- Search pattern: `forms/*/xml-representations/*.dtd`

## Directory structure

One XML + DTD pair per top-level SQL entity. The assessment's per-section
sub-tables (`assessment_<section>`) are consolidated into a single nested
`assessment.xml` / `assessment.dtd` pair rather than one file per sub-table —
one form has exactly one `assessment.*` pair.

```
xml-representations/
  <entity>.xml          # Example XML instance for an entity
  <entity>.dtd          # External DTD describing that entity
  ...
```

Typical entities per form:

```
patient.xml / patient.dtd                   # patient identity
assessment.xml / assessment.dtd             # top-level assessment + nested per-section blocks
grading_result.xml / grading_result.dtd
grading_fired_rule.xml / grading_fired_rule.dtd
grading_additional_flag.xml / grading_additional_flag.dtd
```

The merged `assessment.xml` nests each body-system section inside the root
`<assessment>` element, with the `assessment_` prefix stripped from the
container tag. If stripping would clash with a child-leaf element name
anywhere in the document (DTD forbids redeclaring an element), the original
`<assessment_<section>>` tag is kept.

Example merged structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE assessment SYSTEM "assessment.dtd">
<assessment>
  <id>...</id>
  <patient_id>...</patient_id>
  <!-- top-level assessment columns -->
  <demographics>
    <id>...</id>
    <assessment_id>...</assessment_id>
    <!-- demographics columns -->
  </demographics>
  <cardiovascular>
    <!-- cardiovascular columns -->
  </cardiovascular>
  <!-- ...one nested block per assessment_<section> table -->
</assessment>
```

## XML conventions

- XML declaration with `version="1.0"` and `encoding="UTF-8"`
- External DTD reference via `<!DOCTYPE ... SYSTEM "<entity>.dtd">`
- One root element per file, matching the entity name (snake_case)
- Child element order matches the column order in the corresponding SQL CREATE TABLE
- UUIDs serialised as hyphenated lowercase strings
- Timestamps serialised as ISO 8601 in UTC (e.g. `2026-04-17T10:30:00Z`)
- NULL values represented by an empty element (e.g. `<middle_name/>`)

Example XML:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE example SYSTEM "example.dtd">
<example>
  <foo>Hello</foo>
  <bar>World</bar>
</example>
```

Example external DTD:

```xml
<!ELEMENT example (foo, bar)>
<!ELEMENT foo (#PCDATA)>
<!ELEMENT bar (#PCDATA)>
```

## XML tools

Use the `xmllint` command-line tool (part of `libxml2`).

### Format XML

Make unformatted XML readable:

```sh
xmllint --format file.xml
```

### Validate XML

Check that an XML file is well-formed:

```sh
xmllint --noout file.xml
```

Validate an XML file against its DTD (via `DOCTYPE` reference):

```sh
xmllint --valid --noout file.xml
```

Validate with an explicit external DTD:

```sh
xmllint --noout --dtdvalid document.dtd file.xml
```

Validate against an XML Schema:

```sh
xmllint --schema schema.xsd file.xml
```

## Regenerate

Regenerate all XML + DTD files from the current SQL migrations:

```sh
python3 bin/generate-xml-representations.py
```

## Verify

Validate every XML file in the monorepo against its DTD:

```sh
for xml in forms/*/xml-representations/*.xml; do
  xmllint --valid --noout "$xml" || echo "FAIL: $xml"
done
```
