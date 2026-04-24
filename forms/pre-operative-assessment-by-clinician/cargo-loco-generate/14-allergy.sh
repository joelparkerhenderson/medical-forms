#!/bin/sh
set -euf

cargo loco generate scaffold allergy \
    scientific_name:string \
    european_union_name:string \
    united_states_name:string \
    cosmetic_name:string \
    --htmx
