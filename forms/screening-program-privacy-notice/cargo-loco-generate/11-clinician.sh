#!/bin/sh
set -euf

cargo loco generate scaffold clinician \
    name:string! \
    email:string \
    phone:string \
    postal_address_full_text:string \
    country_code_iso_3166_1_alpha_2:string \
    postcode:string \
    role:string! \
    registration_body:string! \
    registration_number:string! \
    united_kingdom_nhs_number:string! \
    --htmx
