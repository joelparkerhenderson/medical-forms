#!/bin/sh
set -euf

cargo loco generate scaffold grading_fired_rule \
    grading_result:references \
    rule_id:string! \
    instrument:string! \
    grade:string! \
    category:string! \
    description:string! \
    --htmx
