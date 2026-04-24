#!/bin/sh
set -euf

cargo loco generate scaffold grading_fired_rule \
    grading_result:references \
    rule_id:string! \
    category:string! \
    description:text! \
    severity_level:string! \
    --htmx
