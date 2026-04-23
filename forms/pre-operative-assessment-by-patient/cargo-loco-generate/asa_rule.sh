#!/bin/sh
set -euf

cargo loco generate scaffold asa_rule \
    system:text! \
    description:text! \
    grade:int! \
    --htmx
