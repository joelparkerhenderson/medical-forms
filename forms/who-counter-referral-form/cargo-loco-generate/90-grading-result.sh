#!/bin/sh
set -euf
cargo loco generate scaffold grading_result \
    assessment:references \
    result_category:string! \
    result_score:double \
    result_notes:text! \
    graded_at:ts! \
    --htmx
