#!/bin/sh
set -euf

cargo loco generate scaffold assessment \
    patient:references \
    status:string! \
    --htmx
