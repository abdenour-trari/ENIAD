from langgraph.graph import StateGraph, END, START
from app.state import ClinicalState
from app.nodes.supervisor import supervisor_router
from app.nodes.diagnostic_agent import diagnostic_agent
from app.nodes.physician_review import physician_review
from app.nodes.report_agent import report_agent

workflow = StateGraph(ClinicalState)

workflow.add_node("diagnostic_agent", diagnostic_agent)
workflow.add_node("physician_review", physician_review)
workflow.add_node("report_agent", report_agent)

workflow.add_conditional_edges(
    START,
    supervisor_router,
    {
        "diagnostic_agent": "diagnostic_agent",
        "physician_review": "physician_review",
        "report_agent": "report_agent",
        "__end__": END
    }
)

workflow.add_conditional_edges(
    "diagnostic_agent",
    supervisor_router,
    {
        "diagnostic_agent": "diagnostic_agent",
        "physician_review": "physician_review",
        "report_agent": "report_agent",
        "__end__": END
    }
)

workflow.add_conditional_edges(
    "physician_review",
    supervisor_router,
    {
        "diagnostic_agent": "diagnostic_agent",
        "physician_review": "physician_review",
        "report_agent": "report_agent",
        "__end__": END
    }
)

workflow.add_conditional_edges(
    "report_agent",
    supervisor_router,
    {
        "diagnostic_agent": "diagnostic_agent",
        "physician_review": "physician_review",
        "report_agent": "report_agent",
        "__end__": END
    }
)

graph = workflow.compile()
