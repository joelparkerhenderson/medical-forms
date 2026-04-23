#!/bin/sh
set -euf

cargo loco generate scaffold grading_result \
    assessment:references \
    computed_asa_grade:string! \
    final_asa_grade:string! \
    asa_emergency_suffix:string! \
    override_reason:string! \
    mallampati_class:string! \
    rcri_score:int \
    stopbang_score:int \
    frailty_scale:int \
    composite_risk:string! \
    recommendation:string! \
    clinician_notes:text! \
    signed_at:ts \
    graded_at:ts! \
    --htmx
