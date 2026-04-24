#!/bin/sh
set -euf

cargo loco generate scaffold patient \
    deleted_at:ts \
    name:string! \
    birth_date:date \
    united_kingdom_nhs_number:string^ \
    waist_as_cm:double \
    height_as_cm:double \
    weight_as_kg:double \
    body_mass_index:double \
    waist_height_ratio:double \
    vo2_max:double \
    --htmx