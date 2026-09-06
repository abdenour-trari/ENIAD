import React from "react";
import { notFound } from "next/navigation";
import { courseChapters } from "@/data/courseData";
import ChapterLayout from "@/components/ChapterLayout";

// Import all visualization modules
import NeuralNetVis from "@/components/visualizations/NeuralNetVis";
import DqnSimulation from "@/components/visualizations/DqnSimulation";
import DqnImprovements from "@/components/visualizations/DqnImprovements";
import PolicyGradientVis from "@/components/visualizations/PolicyGradientVis";
import ActorCriticVis from "@/components/visualizations/ActorCriticVis";
import MultiAgentSim from "@/components/visualizations/MultiAgentSim";
import ToolsDashboard from "@/components/visualizations/ToolsDashboard";
import LiveTrainingDash from "@/components/visualizations/LiveTrainingDash";
import AlphaGoTimeline from "@/components/visualizations/AlphaGoTimeline";
import FailureScenarios from "@/components/visualizations/FailureScenarios";
import FutureWorldModel from "@/components/visualizations/FutureWorldModel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PartiePage({ params }: PageProps) {
  const resolvedParams = await params;
  const partieId = parseInt(resolvedParams.id, 10);

  if (isNaN(partieId)) {
    notFound();
  }

  const chapterIndex = courseChapters.findIndex((c) => c.id === partieId);
  if (chapterIndex === -1) {
    notFound();
  }

  const chapter = courseChapters[chapterIndex];

  // Set previous and next page IDs
  const prevChapterId = chapterIndex > 0 ? courseChapters[chapterIndex - 1].id : null;
  const nextChapterId =
    chapterIndex < courseChapters.length - 1 ? courseChapters[chapterIndex + 1].id : null;

  // Map partie IDs (1-11) to their respective interactive visual animations
  const getVisualization = (id: number) => {
    switch (id) {
      case 1:
        return <NeuralNetVis />;
      case 2:
        return <DqnSimulation />;
      case 3:
        return <DqnImprovements />;
      case 4:
        return <PolicyGradientVis />;
      case 5:
        return <ActorCriticVis />;
      case 6:
        return <MultiAgentSim />;
      case 7:
        return <ToolsDashboard />;
      case 8:
        return <LiveTrainingDash />;
      case 9:
        return <AlphaGoTimeline />;
      case 10:
        return <FailureScenarios />;
      case 11:
        return <FutureWorldModel />;
      default:
        return <div className="text-center py-6 text-gray-500">Aucun simulateur pour cette partie.</div>;
    }
  };

  return (
    <ChapterLayout
      chapter={chapter}
      prevChapterId={prevChapterId}
      nextChapterId={nextChapterId}
      visualization={getVisualization(partieId)}
    />
  );
}

// Generate static params for Next.js build optimization
export async function generateStaticParams() {
  return courseChapters.map((chapter) => ({
    id: chapter.id.toString(),
  }));
}
