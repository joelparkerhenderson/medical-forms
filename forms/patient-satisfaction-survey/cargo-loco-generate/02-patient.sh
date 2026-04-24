#!/bin/sh
set -euf

cargo loco generate scaffold patient \
    name:string! \
    birth_date:date! \
    united_kingdom_nhs_number:string^ \
    --htmx
