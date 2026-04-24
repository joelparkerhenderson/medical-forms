# Loco generator

Rust Loco.rs generate

Example:

```sh
cargo loco generate scaffold post title:text author:references
```

Rust web framework. 

The generate subcommand scaffolds code and boilerplate using predefined templates, so you can skip writing infrastructure by hand.

The generate command performs "code generation creates a set of files and code templates based on a predefined set of rules." 

You run it from inside a Loco project via cargo loco generate <COMPONENT> [args] (or the short form cargo loco g).

Subcommands

Command:

- cargo loco generate scaffold — generates a full CRUD resource (model + migration + controller + tests) in one shot.

Example:

- `cargo loco generate scaffold <name> [field:type ...] --htmx`

Field suffixes: ! marks a field as required (NOT NULL), ^ marks it unique; no suffix means nullable. created_at and updated_at timestamps are added automatically. Loco

Naming patterns are meaningful: AddNameAndAgeToUsers (the Users part becomes the table name), AddUserRefToPosts for references, and 

CreateJoinTable___And___ for join tables between two tables. Loco You can also use cargo loco db down to rollback.

Common types accepted in the field:type arguments: string, text, int, int!, bigint, float, double, bool, date, ts (timestamp), uuid, json, jsonb, blob, and relational types like references or references:<column_name> for a custom FK column name.
