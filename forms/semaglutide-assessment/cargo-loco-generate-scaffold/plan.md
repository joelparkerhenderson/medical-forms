# Plan

Generate Loco (loco.rs) scaffolding for the `semaglutide-assessment` form.

## Steps

1. Create a new Loco project (one-time):

   ```sh
   loco new --name semaglutide-assessment --db postgres --bg async --assets serverside
   ```

2. Run the generator script inside the Loco project root:

   ```sh
   sh ../cargo-loco-generate-scaffold/generate.sh
   ```

3. Review the generated models, controllers, views, and migrations.

4. Apply migrations:

   ```sh
   cargo loco db migrate
   ```

## Scope

- 15 tables will be scaffolded.
- Scaffolding order matches `sql-migrations/*.sql` so FK targets exist
  before referencing tables are created.
