#!/bin/sh
set -euf

cargo loco generate scaffold grading_additional_flag \
    grading_result:references \
    flag_id:string! \
    category:string! \
    description:text! \
    priority:string! \
    --htmx
