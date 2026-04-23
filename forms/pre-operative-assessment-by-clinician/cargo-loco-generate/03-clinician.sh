#!/bin/sh
set -euf

cargo loco generate scaffold clinican \
    name:string! \
    role:string! \
    registration_body:string! \
    registration_number:string! \
    united_kingdom_nhs_number:string! \
    --htmx

