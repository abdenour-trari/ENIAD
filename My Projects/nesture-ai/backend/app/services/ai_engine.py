"""
Nesture AI – Primitive Reflex Analysis Engine
Rule-based system. Maps session gesture data to reflex integration scores
and generates OT exercise recommendations.
In production: replace rule thresholds with trained ML model.
"""
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass


# ── Reflex detection rules ────────────────────────────────────────────────────
@dataclass
class ReflexRule:
    name: str
    impact: str
    indicators: List[str]
    exercises: List[str]


REFLEX_RULES: List[ReflexRule] = [
    ReflexRule(
        name="Moro",
        impact="Startle / hypersensitivity",
        indicators=["high_fail_rate", "frequent_withdrawal", "high_head_hand_coupling"],
        exercises=["ex-001", "ex-002", "ex-003"],
    ),
    ReflexRule(
        name="ATNR",
        impact="Midline crossing difficulty",
        indicators=["midline_avoidance", "left_right_asymmetry", "head_hand_coupling"],
        exercises=["ex-004", "ex-005", "ex-006"],
    ),
    ReflexRule(
        name="STNR",
        impact="Posture / sitting stability",
        indicators=["frequent_breaks", "postural_fatigue", "early_fatigue"],
        exercises=["ex-007", "ex-008"],
    ),
    ReflexRule(
        name="TLR",
        impact="Balance / postural tone",
        indicators=["slow_response", "spatial_drift", "poor_trajectory"],
        exercises=["ex-009", "ex-010"],
    ),
    ReflexRule(
        name="Spinal Galant",
        impact="Trunk coordination",
        indicators=["erratic_control", "high_variability", "high_invalid_rate"],
        exercises=["ex-011", "ex-012"],
    ),
    ReflexRule(
        name="Palmar Grasp",
        impact="Fine motor / grip precision",
        indicators=["slow_timing", "missed_accurate_grabs", "precision_difficulty"],
        exercises=["ex-013", "ex-014", "ex-015"],
    ),
]


def analyse_session(session: Dict[str, Any], gestures: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Main analysis entry point.
    Takes session summary + raw gesture list → returns structured AI analysis.
    """
    metrics = _calculate_metrics(session, gestures)
    indicators = _detect_indicators(metrics)
    reflex_scores = _score_reflexes(indicators, metrics)
    recommendations = _generate_recommendations(reflex_scores)
    narrative = _generate_narrative(metrics, reflex_scores)
    lpi = _calculate_lpi(metrics, reflex_scores)

    return {
        "metrics": metrics,
        "reflex_scores": reflex_scores,
        "recommendations": recommendations,
        "narrative": narrative,
        "lpi_score": lpi,
        "scenario": "happy_path" if metrics["accuracy"] >= 0.70 else "alternate_path",
    }


def _safe_float(val, default=0.0):
    try:
        return float(val) if val not in (None, "") else default
    except (ValueError, TypeError):
        return default

def _safe_int(val, default=0):
    try:
        return int(float(val)) if val not in (None, "") else default
    except (ValueError, TypeError):
        return default

def _calculate_metrics(session: Dict, gestures: List[Dict]) -> Dict[str, Any]:
    total = _safe_int(session.get("total_attempts", 0)) or 1
    perfect = _safe_int(session.get("perfect_grabs", 0))
    failed = _safe_int(session.get("failed_grabs", 0))
    skipped = _safe_int(session.get("skipped", 0))
    accuracy = perfect / total
    avg_rt = _safe_float(session.get("avg_response_time_ms", 4000), 4000)
    smoothness = _safe_float(session.get("trajectory_smoothness", 0.5), 0.5)
    fatigue = _safe_float(session.get("fatigue_index", 0.5), 0.5)
    midline = _safe_int(session.get("midline_crossings", 0))

    # Head-hand coupling: average from gestures if available
    if gestures:
        hhc_vals = [_safe_float(g.get("head_hand_coupling", 0.5), 0.5) for g in gestures if g.get("head_hand_coupling")]
        avg_hhc = sum(hhc_vals) / len(hhc_vals) if hhc_vals else 0.5
    else:
        avg_hhc = _safe_float(session.get("head_hand_coupling", 0.5), 0.5)

    return {
        "accuracy": accuracy,
        "fail_rate": failed / total,
        "skip_rate": skipped / total,
        "avg_response_time_ms": avg_rt,
        "trajectory_smoothness": smoothness,
        "fatigue_index": fatigue,
        "midline_crossings": midline,
        "avg_head_hand_coupling": avg_hhc,
        "total_attempts": total,
        "perfect_grabs": perfect,
        "failed_grabs": failed,
        "skipped": skipped,
        "duration_seconds": _safe_int(session.get("duration_seconds", 0)),
    }


def _detect_indicators(m: Dict) -> Dict[str, bool]:
    return {
        # Moro
        "high_fail_rate":           m["fail_rate"] > 0.50,
        "frequent_withdrawal":      m["skip_rate"] > 0.15,
        "high_head_hand_coupling":  m["avg_head_hand_coupling"] > 0.70,
        # ATNR
        "midline_avoidance":        m["midline_crossings"] < 5,
        "left_right_asymmetry":     False,  # requires per-gesture lateral analysis
        "head_hand_coupling":       m["avg_head_hand_coupling"] > 0.60,
        # STNR
        "frequent_breaks":          m["skip_rate"] > 0.12,
        "postural_fatigue":         m["fatigue_index"] > 0.55,
        "early_fatigue":            m["fatigue_index"] > 0.65,
        # TLR
        "slow_response":            m["avg_response_time_ms"] > 8000,
        "spatial_drift":            m["trajectory_smoothness"] < 0.45,
        "poor_trajectory":          m["trajectory_smoothness"] < 0.40,
        # Spinal Galant
        "erratic_control":          m["trajectory_smoothness"] < 0.42,
        "high_variability":         m["fatigue_index"] > 0.60,
        "high_invalid_rate":        (m["total_attempts"] > 0 and
                                     m.get("invalid", 0) / m["total_attempts"] > 0.15),
        # Palmar
        "slow_timing":              m["avg_response_time_ms"] > 6000,
        "missed_accurate_grabs":    m["fail_rate"] > 0.30 and m["trajectory_smoothness"] > 0.55,
        "precision_difficulty":     m["fail_rate"] > 0.25,
    }


def _score_reflexes(indicators: Dict[str, bool], metrics: Dict) -> List[Dict]:
    results = []
    for rule in REFLEX_RULES:
        found = [ind for ind in rule.indicators if indicators.get(ind, False)]
        count = len(found)
        confidence = "High" if count >= 3 else ("Medium" if count == 2 else "Low")

        # Integration score: 0-100, higher = better integrated
        # Base starts at 100, then we apply continuous penalties based on metrics
        # and discrete penalties for triggered indicators.
        acc_penalty = (1 - metrics["accuracy"]) * 25
        smooth_penalty = (1 - metrics["trajectory_smoothness"]) * 15
        
        # RT penalty (assume >2s starts incurring small penalties, max penalty 10 at 7s)
        rt_s = metrics["avg_response_time_ms"] / 1000
        rt_penalty = min(10, max(0, (rt_s - 2.0) * 2))

        indicator_penalty = count * 15

        base_score = 100 - acc_penalty - smooth_penalty - rt_penalty - indicator_penalty
        score = max(10, min(100, round(base_score)))

        results.append({
            "reflex": rule.name,
            "impact": rule.impact,
            "confidence": confidence,
            "score": score,
            "indicators_found": found,
            "exercises": rule.exercises,
            "actionable": confidence in ("High", "Medium"),
        })
    return results


def _generate_recommendations(reflex_scores: List[Dict]) -> List[Dict]:
    """Return 3–5 exercise IDs with reasons, only for Medium+ confidence reflexes."""
    recs = []
    seen_exercises = set()

    # Sort by severity (High first, then Medium)
    priority = [r for r in reflex_scores if r["confidence"] == "High"]
    priority += [r for r in reflex_scores if r["confidence"] == "Medium"]

    for reflex in priority:
        for ex_id in reflex["exercises"]:
            if ex_id not in seen_exercises:
                recs.append({
                    "exercise_id": ex_id,
                    "target_reflex": reflex["reflex"],
                    "reason": f"Supports {reflex['reflex']} reflex integration ({reflex['impact']})",
                })
                seen_exercises.add(ex_id)
            if len(recs) >= 5:
                break
        if len(recs) >= 5:
            break

    return recs[:5]


def _generate_narrative(metrics: Dict, reflex_scores: List[Dict]) -> str:
    accuracy_pct = round(metrics["accuracy"] * 100)
    rt_s = round(metrics["avg_response_time_ms"] / 1000, 1)
    high_flags = [r for r in reflex_scores if r["confidence"] == "High"]
    medium_flags = [r for r in reflex_scores if r["confidence"] == "Medium"]

    if metrics["accuracy"] >= 0.80:
        tone = "excellent"
        summary = (
            f"Great session! Accuracy reached {accuracy_pct}% with an average response time of {rt_s} seconds — "
            f"both showing meaningful improvement. "
        )
    elif metrics["accuracy"] >= 0.65:
        tone = "good"
        summary = (
            f"Solid session with {accuracy_pct}% accuracy and a {rt_s}s average response time. "
            f"Motor coordination is progressing steadily. "
        )
    else:
        tone = "needs_attention"
        summary = (
            f"This session showed some challenges — accuracy was {accuracy_pct}% "
            f"with a {rt_s}s average response time. That's okay — every session gives us data to work with. "
        )

    if high_flags:
        names = " and ".join(r["reflex"] for r in high_flags[:2])
        summary += f"The AI flagged the {names} reflex pattern as the main area to focus on this week. "
    elif medium_flags:
        names = " and ".join(r["reflex"] for r in medium_flags[:2])
        summary += f"The {names} reflex patterns are showing some activity worth monitoring. "
    else:
        summary += "No significant reflex concerns were detected this session. "

    summary += "The recommended exercises below are tailored to today's specific motor patterns."
    return summary


def _calculate_lpi(metrics: Dict, reflex_scores: List[Dict]) -> int:
    """Learner Progress Index — composite 0-100 score."""
    acc_component = metrics["accuracy"] * 40
    rt_component = max(0, (1 - metrics["avg_response_time_ms"] / 10000)) * 25
    smooth_component = metrics["trajectory_smoothness"] * 20
    reflex_avg = sum(r["score"] for r in reflex_scores) / len(reflex_scores)
    reflex_component = (reflex_avg / 100) * 15
    return min(100, round(acc_component + rt_component + smooth_component + reflex_component))
