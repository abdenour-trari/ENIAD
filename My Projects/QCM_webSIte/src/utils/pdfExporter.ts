import { jsPDF } from 'jspdf';
import type { Question, ExamResult } from '../types';
import { arraysEqual } from './helpers';

export function exportToPDF(
  questions: Question[],
  answers: Record<number, number[] | string>,
  result: ExamResult
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = 20;

  // Helper to add new page if needed
  const checkPageBounds = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Header Title
  doc.setFillColor(15, 23, 42); // slate-900 background for top banner
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('QCM Generator Pro', margin, 18);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Rapport d'Examen Universitaire & Évaluation IA", margin, 26);

  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Généré le ${dateStr}`, pageWidth - margin - doc.getTextWidth(`Généré le ${dateStr}`), 26);

  y = 52;

  // Score Summary Card
  checkPageBounds(40);
  doc.setFillColor(248, 250, 252); // slate-50 background
  doc.setDrawColor(226, 232, 240); // slate-200 border
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RÉSUMÉ DES RÉSULTATS DE L\'EXAMEN', margin + 8, y + 8);

  // Score badge
  doc.setFontSize(26);
  doc.setTextColor(59, 130, 246); // blue-500
  const scoreStr = `${result.score} / ${result.mcqTotal + result.openTotal}`;
  doc.text(scoreStr, margin + 8, y + 23);

  // Percentage badge
  doc.setFontSize(24);
  if (result.percentage >= 80) {
    doc.setTextColor(34, 197, 94); // emerald-500
  } else if (result.percentage >= 50) {
    doc.setTextColor(59, 130, 246); // blue-500
  } else {
    doc.setTextColor(239, 68, 68); // rose-500
  }
  doc.text(`${result.percentage}%`, margin + 120, y + 23);

  // Stats text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  
  const m = Math.floor(result.timeSpent / 60);
  const s = result.timeSpent % 60;
  const timeStr = m > 0 ? `${m} min ${s} s` : `${s} s`;

  doc.text(`Partie MCQ/SCQ : ${result.mcqScore} / ${result.mcqTotal}`, margin + 55, y + 14);
  doc.text(`Partie Questions Ouvertes : ${result.openScore} / ${result.openTotal}`, margin + 55, y + 20);
  doc.text(`Durée écoulée : ${timeStr} | Validations : ${result.goodAnswers} / ${result.totalQuestions}`, margin + 55, y + 26);

  y += 44;

  // Category Breakdown
  const categories = Object.keys(result.categoryStats);
  if (categories.length > 0 && !(categories.length === 1 && categories[0] === 'Général')) {
    checkPageBounds(30 + categories.length * 8);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('PERFORMANCE PAR CATÉGORIE', margin, y);
    y += 6;

    categories.forEach((cat) => {
      checkPageBounds(8);
      const stat = result.categoryStats[cat];
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text(cat, margin + 4, y);
      
      const catScore = `${stat.correct} / ${stat.total} (${stat.percentage}%)`;
      
      // Draw a small custom progress bar
      doc.setFillColor(226, 232, 240); // bg-bar
      doc.rect(margin + 75, y - 3, 50, 4, 'F');
      if (stat.percentage >= 80) doc.setFillColor(34, 197, 94);
      else if (stat.percentage >= 50) doc.setFillColor(59, 130, 246);
      else doc.setFillColor(239, 68, 68);
      doc.rect(margin + 75, y - 3, (stat.percentage / 100) * 50, 4, 'F');

      doc.setTextColor(15, 23, 42);
      doc.text(catScore, pageWidth - margin - doc.getTextWidth(catScore) - 4, y);
      y += 8;
    });
    y += 6;
  }

  // Detailed Correction Section Header
  checkPageBounds(15);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CORRECTION ET APPRÉCIATIONS DÉTAILLÉES', margin, y);
  y += 8;

  // Loop through questions
  questions.forEach((q, idx) => {
    const userAnswer = answers[q.id];
    const isMCQ = ['QCU', 'QCM'].includes(q.type);

    if (isMCQ) {
      // 1. MCQ Question Block
      const selIndices = userAnswer as number[] || [];
      const isCorrect = arraysEqual(selIndices, q.correct || []);
      const qLines = doc.splitTextToSize(`${idx + 1}. [${q.type}] ${q.question}`, contentWidth - 10);
      
      const explanationText = result.mcqExplanations?.[q.id];
      const explanationOnlyLines = explanationText 
        ? doc.splitTextToSize(explanationText, contentWidth - 12) 
        : [];

      let estimatedHeight = qLines.length * 6 + (q.options?.length || 0) * 6 + 18;
      if (explanationText) {
        estimatedHeight += 4.5 + explanationOnlyLines.length * 4.5 + 4;
      }

      checkPageBounds(estimatedHeight);

      doc.setFillColor(252, 253, 254);
      doc.setDrawColor(isCorrect ? 187 : 254, isCorrect ? 247 : 202, isCorrect ? 208 : 202);
      doc.roundedRect(margin, y, contentWidth, estimatedHeight - 5, 2, 2, 'FD');

      // Indicator Badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      if (isCorrect) {
        doc.setFillColor(240, 253, 244);
        doc.setTextColor(22, 163, 74);
        doc.text('CORRECT (10/10)', pageWidth - margin - 32, y + 6);
      } else {
        doc.setFillColor(254, 242, 242);
        doc.setTextColor(220, 38, 38);
        doc.text('INCORRECT (0/10)', pageWidth - margin - 34, y + 6);
      }

      // Question Text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      
      let textY = y + 7;
      qLines.forEach((line: string) => {
        doc.text(line, margin + 6, textY);
        textY += 5.5;
      });
      textY += 2;

      // Options
      q.options?.forEach((opt, optIdx) => {
        const isOptionSelected = selIndices.includes(optIdx);
        const isOptionCorrect = q.correct?.includes(optIdx);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        let prefix = '[ ] ';
        if (q.type === 'QCU') prefix = '( ) ';
        if (isOptionSelected) prefix = q.type === 'QCU' ? '(*) ' : '[x] ';

        if (isOptionCorrect) {
          doc.setTextColor(22, 163, 74);
          prefix = '✅ ' + prefix;
        } else if (isOptionSelected && !isOptionCorrect) {
          doc.setTextColor(220, 38, 38);
          prefix = '❌ ' + prefix;
        } else {
          doc.setTextColor(71, 85, 105);
        }

        const optText = `${prefix}${opt}`;
        const optLines = doc.splitTextToSize(optText, contentWidth - 16);
        optLines.forEach((line: string, lineIdx: number) => {
          const indent = lineIdx === 0 ? margin + 8 : margin + 12;
          doc.text(line, indent, textY);
          textY += 5;
        });
      });

      // Render AI Explanation if present
      if (explanationText && explanationOnlyLines.length > 0) {
        textY += 3;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(59, 130, 246); // blue-500
        doc.text("Explication de l'IA :", margin + 6, textY);
        textY += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85); // slate-700
        explanationOnlyLines.forEach((line: string) => {
          doc.text(line, margin + 6, textY);
          textY += 4.5;
        });
      }

      y = textY + 6;

    } else {
      // 2. Open-ended Question Block with AI evaluations
      const essayAnswer = userAnswer as string || '';
      const originalGrade = result.openGrades[q.id];
      const adjustedGrade = result.teacherAdjustments?.[q.id];

      // Merge values
      const score = adjustedGrade?.score !== undefined ? adjustedGrade.score : (originalGrade?.score || 0);
      const feedback = adjustedGrade?.feedback !== undefined ? adjustedGrade.feedback : (originalGrade?.feedback || '');
      const strengths = adjustedGrade?.strengths !== undefined ? adjustedGrade.strengths : (originalGrade?.strengths || []);
      const missingPoints = adjustedGrade?.missing_points !== undefined ? adjustedGrade.missing_points : (originalGrade?.missing_points || []);

      const qLines = doc.splitTextToSize(`${idx + 1}. [${q.type}] ${q.question}`, contentWidth - 10);
      
      // Split essay answer, model answer, and feedback
      const ansLines = doc.splitTextToSize(`Votre réponse : ${essayAnswer.trim() || 'Aucune réponse.'}`, contentWidth - 12);
      const expectedLines = doc.splitTextToSize(`Réponse modèle : ${q.expected_answer || ''}`, contentWidth - 12);
      const feedbackLines = doc.splitTextToSize(`Appréciation de l'IA : ${feedback}`, contentWidth - 12);
      
      // Scenario lines if case study
      const scenarioLines = q.type === 'CASE_STUDY' && q.scenario 
        ? doc.splitTextToSize(`Situation : ${q.scenario}`, contentWidth - 12) 
        : [];

      // Calculate approximate height
      const linesCount = qLines.length + scenarioLines.length + ansLines.length + expectedLines.length + feedbackLines.length;
      const listsCount = strengths.length + missingPoints.length;
      const estimatedHeight = linesCount * 5.5 + listsCount * 5 + 32;

      checkPageBounds(estimatedHeight);

      doc.setFillColor(253, 254, 255);
      doc.setDrawColor(score >= 10 ? 187 : 254, score >= 10 ? 247 : 202, score >= 10 ? 208 : 202);
      doc.roundedRect(margin, y, contentWidth, estimatedHeight - 5, 2, 2, 'FD');

      // Score rating badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setFillColor(score >= 10 ? 240 : 254, score >= 10 ? 253 : 242, score >= 10 ? 244 : 242);
      if (score >= 10) {
        doc.setTextColor(22, 163, 74);
        doc.text(`NOTE : ${score}/20 (Validé)`, pageWidth - margin - 38, y + 6);
      } else {
        doc.setTextColor(220, 38, 38);
        doc.text(`NOTE : ${score}/20 (Insuffisant)`, pageWidth - margin - 42, y + 6);
      }

      // Question Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      let textY = y + 7;
      qLines.forEach((line: string) => {
        doc.text(line, margin + 6, textY);
        textY += 5.5;
      });
      textY += 2;

      // Scenario if CASE_STUDY
      if (scenarioLines.length > 0) {
        doc.setFont('helvetica', 'oblique');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        scenarioLines.forEach((line: string) => {
          doc.text(line, margin + 6, textY);
          textY += 5;
        });
        textY += 2;
      }

      // Student Answer text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      ansLines.forEach((line: string) => {
        doc.text(line, margin + 6, textY);
        textY += 5;
      });
      textY += 2;

      // Model Answer text
      doc.setFont('helvetica', 'oblique');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      expectedLines.forEach((line: string) => {
        doc.text(line, margin + 6, textY);
        textY += 4.5;
      });
      textY += 2;

      // AI Appraisal/Feedback
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(79, 70, 229); // indigo-600
      feedbackLines.forEach((line: string) => {
        doc.text(line, margin + 6, textY);
        textY += 5;
      });
      textY += 2.5;

      // Strengths & Omissions lists
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      
      // Strengths
      if (strengths.length > 0) {
        doc.setTextColor(22, 163, 74);
        doc.text("Points Forts :", margin + 6, textY);
        textY += 4.5;
        strengths.forEach((str) => {
          doc.setTextColor(51, 65, 85);
          doc.text(`+ ${str}`, margin + 10, textY);
          textY += 4.5;
        });
      }

      // Omissions
      if (missingPoints.length > 0) {
        doc.setTextColor(220, 38, 38);
        doc.text("Éléments manquants / imprécis :", margin + 6, textY);
        textY += 4.5;
        missingPoints.forEach((mis) => {
          doc.setTextColor(51, 65, 85);
          doc.text(`- ${mis}`, margin + 10, textY);
          textY += 4.5;
        });
      }

      y = textY + 6;
    }
  });

  // Save PDF file
  doc.save(`resultats-qcm-pro-${new Date().getTime()}.pdf`);
}
