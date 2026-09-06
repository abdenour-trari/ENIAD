def supervisor_router(state):
    questions_count = len(state.get("questions", []))
    answers_count = len(state.get("answers", []))
    
    if questions_count > answers_count:
        return "__end__"

    if answers_count < 5:
        return "diagnostic_agent"

    if not state.get("preliminary_summary"):
        return "diagnostic_agent"

    if not state.get("physician_feedback"):
        if state.get("next_node") == "physician_review":
            return "__end__"
        else:
            return "physician_review"

    if not state.get("final_report"):
        return "report_agent"

    return "__end__"