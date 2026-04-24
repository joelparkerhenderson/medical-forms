#!/bin/sh
set -euf

cargo loco generate scaffold patient_allergy \
    patient:references \
    allergy:references \
    --htmx
