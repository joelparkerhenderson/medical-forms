# XML representations

Ultrathink. XML and XML DTD for the forms.

Research the SQL in the folder `sql-migrations`.

Slug: xml-representations

- Search pattern: "forms/\*/sql-migrations/\*.sql"
- Search pattern: "forms/\*/xml-representations/\*.xml"
- Search pattern: "forms/\*/xml-representations/\*.dtd"

## XML representation naming

Create corresponding XML and DTD for each SQL table entity.

Each DTD defines the element structure matching the SQL columns exactly.

```
xml-representations/
  <entity>.xml          # Example XML for an entity
  <entity>.dtd          # Example XML DTD for an entity
  ...
```

## XML conventions

Example XML:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE example SYSTEM "example.dtd">
<example>
<foo>Hello</foo>
<bar>World</bar>
</example>
```

Example DTD (external DTD file format):

```xml
<!ELEMENT example (foo,bar)>
<!ELEMENT foo (#PCDATA)>
<!ELEMENT bar (#PCDATA)>
```

## XML tools

Use command `xmllint`.

### Format XML

Make unformatted XML readable:

```sh
xmllint --format file.xml
```

### Validate XML

Check if XML is well-formed:

```sh
xmllint --noout file.xml
```

Validate XML against its DTD:

```sh
xmllint --valid --noout file.xml
```

Validate with external DTD:

```sh
xmllint --noout --dtdvalid document.dtd file.xml
```

Validate with XML schema:

```sh
xmllint --schema schema.xsd file.xml
```

## Regenerate

```sh
python3 bin/generate-xml-representations.py
```

## Verify

Validate all XML files against their DTDs:

```sh
for xml in forms/*/xml-representations/*.xml; do
  xmllint --valid --noout "$xml"
done
```
