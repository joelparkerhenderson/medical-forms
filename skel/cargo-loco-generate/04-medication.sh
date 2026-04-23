#!/bin/sh
set -euf

cargo loco generate scaffold medication \
    international_nonproprietary_name::string! \
    description::string! \
    --htmx
