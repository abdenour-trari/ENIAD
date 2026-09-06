"""
Session Report PDF Generator
Produces a professional report matching the Maya Chen sample format.
Uses ReportLab for PDF generation.
"""
import io
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT


# Brand colours
TEAL  = colors.HexColor("#0D5E6B")
ORANGE = colors.HexColor("#E8841A")
CREAM  = colors.HexColor("#EEF6F8")
LIGHT_TEAL = colors.HexColor("#1A8FA0")
GRAY   = colors.HexColor("#6B7280")
DARK   = colors.HexColor("#1F2937")


def _safe_float(val, default=0.0):
    """Safely convert CSV value to float, handling empty strings."""
    try:
        return float(val) if val not in (None, "") else default
    except (ValueError, TypeError):
        return default


def _safe_int(val, default=0):
    """Safely convert CSV value to int, handling empty strings."""
    try:
        return int(float(val)) if val not in (None, "") else default
    except (ValueError, TypeError):
        return default


def generate_session_report(
    learner: Dict,
    session: Dict,
    reflex_scores: List[Dict],
    recommendations: List[Dict],
    exercises: List[Dict],
    narrative: str,
    lpi_score: int,
    trend_sessions: List[Dict],
) -> bytes:
    """Return PDF bytes for the session report."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=15 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()
    story = []

    # ── Header ────────────────────────────────────────────────────────────────
    story.append(_header_block(learner, session, lpi_score, styles))
    story.append(Spacer(1, 6 * mm))

    # ── Performance Metrics ───────────────────────────────────────────────────
    story.append(_section_title("Session Performance", styles))
    story.append(_metrics_table(session))
    story.append(Spacer(1, 5 * mm))

    # ── Primitive Reflex Assessment ───────────────────────────────────────────
    story.append(_section_title("Primitive Reflex Integration Assessment", styles))
    story.append(_reflex_table(reflex_scores, styles))
    story.append(Spacer(1, 5 * mm))

    # ── Session Narrative ─────────────────────────────────────────────────────
    story.append(_section_title("Session Summary", styles))
    story.append(_narrative_block(narrative, styles))
    story.append(Spacer(1, 5 * mm))

    # ── OT Exercise Recommendations ───────────────────────────────────────────
    actionable_recs = [r for r in recommendations if r.get("exercise_id")]
    if actionable_recs:
        story.append(_section_title("Recommended OT Exercises", styles))
        ex_map = {e["id"]: e for e in exercises}
        story.append(_exercises_table(actionable_recs, ex_map, styles))

    # ── Footer ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 8 * mm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=GRAY))
    story.append(Spacer(1, 3 * mm))
    footer_style = ParagraphStyle("footer", parent=styles["Normal"],
                                  fontSize=7, textColor=GRAY, alignment=TA_CENTER)
    story.append(Paragraph(
        "Nesture AI · LetterQuest · EdTech Platform — Not a medical record. "
        "Consult a licensed occupational therapist for clinical decisions.",
        footer_style
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()


# ── Block builders ────────────────────────────────────────────────────────────

def _header_block(learner, session, lpi, styles):
    title_style = ParagraphStyle("title", parent=styles["Title"],
                                  fontSize=20, textColor=TEAL, spaceAfter=2)
    sub_style = ParagraphStyle("sub", parent=styles["Normal"],
                                fontSize=9, textColor=GRAY)
    lpi_style = ParagraphStyle("lpi", parent=styles["Normal"],
                                fontSize=28, textColor=ORANGE, alignment=TA_RIGHT)

    start = session.get("start_time", "")[:10]
    duration_min = round(_safe_int(session.get("duration_seconds", 0)) / 60)

    left_col = [
        Paragraph("LetterQuest Session Report", title_style),
        Paragraph(f"<b>{learner.get('name', 'Learner')}</b> · {start} · {duration_min} min", sub_style),
        Paragraph(f"Report ID: {session.get('id', 'N/A')} · Generated {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", sub_style),
    ]
    right_col = [
        Paragraph(f"LPI", ParagraphStyle("lpi_label", parent=styles["Normal"],
                                          fontSize=9, textColor=GRAY, alignment=TA_RIGHT)),
        Paragraph(str(lpi), lpi_style),
        Paragraph("Learner Progress Index", ParagraphStyle("lpi_sub", parent=styles["Normal"],
                                                            fontSize=8, textColor=GRAY, alignment=TA_RIGHT)),
    ]
    table = Table([[left_col, right_col]], colWidths=["70%", "30%"])
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (-1, -1), CREAM),
        ("LEFTPADDING", (0, 0), (0, 0), 8),
        ("RIGHTPADDING", (-1, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("ROUNDEDCORNERS", [4, 4, 4, 4]),
    ]))
    return table


def _section_title(text: str, styles) -> Paragraph:
    style = ParagraphStyle("sec_title", parent=styles["Heading2"],
                           fontSize=11, textColor=TEAL,
                           spaceBefore=4, spaceAfter=3,
                           borderPad=(0, 0, 2, 0))
    return Paragraph(text, style)


def _metrics_table(session: Dict) -> Table:
    acc = round(_safe_float(session.get("accuracy_score", 0)) * 100, 1)
    rt  = round(_safe_float(session.get("avg_response_time_ms", 0)) / 1000, 1)
    total = session.get("total_attempts") or "—"
    perfect = session.get("perfect_grabs") or "—"
    smoothness = round(_safe_float(session.get("trajectory_smoothness", 0)) * 100, 1)
    fatigue = round(_safe_float(session.get("fatigue_index", 0)) * 100, 1)

    data = [
        ["Metric", "Value", "Status"],
        ["Accuracy Score", f"{acc}%", _status_text(acc, 75, 60)],
        ["Avg Response Time", f"{rt}s", _status_text(10 - rt, 4, 2)],
        ["Total Attempts", str(total), "—"],
        ["Perfect Grabs", str(perfect), "—"],
        ["Trajectory Smoothness", f"{smoothness}%", _status_text(smoothness, 65, 50)],
        ["Fatigue Index", f"{fatigue}%", _status_text(100 - fatigue, 60, 40)],
    ]
    col_widths = ["45%", "25%", "30%"]
    table = Table(data, colWidths=col_widths)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TEAL),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CREAM]),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#D1D5DB")),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (0, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return table


def _reflex_table(reflex_scores: List[Dict], styles) -> Table:
    data = [["Reflex", "Integration", "Confidence", "Status"]]
    for r in reflex_scores:
        score = _safe_int(r.get("score", 50), 50)
        filled = int(score / 10)
        bar = "#" * filled + "-" * (10 - filled)
        conf = r.get("confidence_level") or r.get("confidence", "Low")
        status = "! Action Recommended" if conf == "High" else (
            "Monitor" if conf == "Medium" else "On Track")
        data.append([
            r.get("reflex_name") or r.get("reflex", ""),
            f"[{bar}] {score}",
            conf,
            status,
        ])
    table = Table(data, colWidths=["28%", "30%", "20%", "22%"])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TEAL),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CREAM]),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#D1D5DB")),
        ("LEFTPADDING", (0, 0), (0, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return table


def _narrative_block(narrative: str, styles) -> Paragraph:
    style = ParagraphStyle("narrative", parent=styles["Normal"],
                           fontSize=10, leading=15,
                           backColor=CREAM,
                           borderPad=8, borderColor=TEAL,
                           borderWidth=0.5, borderRadius=4)
    return Paragraph(narrative, style)


def _exercises_table(recs: List[Dict], ex_map: Dict, styles) -> Table:
    data = [["Exercise", "Target Reflex", "Duration", "Instructions"]]
    for rec in recs:
        ex = ex_map.get(rec["exercise_id"], {})
        data.append([
            ex.get("name", "—"),
            rec.get("target_reflex", "—"),
            f"{ex.get('duration_minutes', '—')} min",
            ex.get("description", "—")[:80] + ("..." if len(ex.get("description", "")) > 80 else ""),
        ])
    table = Table(data, colWidths=["22%", "18%", "12%", "48%"])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), ORANGE),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CREAM]),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#D1D5DB")),
        ("LEFTPADDING", (0, 0), (0, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return table


def _status_text(value: float, good_threshold: float, warn_threshold: float) -> str:
    if value >= good_threshold:
        return "✓ Good"
    elif value >= warn_threshold:
        return "~ Fair"
    return "↓ Needs Focus"
