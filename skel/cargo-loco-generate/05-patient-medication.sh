#!/bin/sh
set -euf

cargo loco generate scaffold patient_medication \
    patient:references \
    medication:references \
    --htmx
