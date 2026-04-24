#!/bin/sh
set -euf

cargo loco generate scaffold patient \
    name:string! \
    birth_date:date! \
    email:string \
    phone:string \
    postal_address_full_text:string \
    country_code_iso_3166_1_alpha_2:string \
    postcode:string \
    united_kingdom_nhs_number:string^ \
    waist_as_cm:double \
    height_as_cm:double \
    weight_as_kg:double \
    body_mass_index:double \
    waist_height_ratio:double \
    vo2_max:double \
    --htmx
