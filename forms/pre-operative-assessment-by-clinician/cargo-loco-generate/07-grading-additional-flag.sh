#!/bin/sh
set -euf

cargo loco generate scaffold grading_additional_flag \
    grading_result:references \
    flag_id:string! \
    category:string! \
    priority:string! \
    description:string! \
    suggested_action:string! \
    --htmx
