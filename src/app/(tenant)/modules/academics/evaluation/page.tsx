import SectionPage from "@/app/_components/SectionPage";

export default function EvaluationPage() {
  return (
    <SectionPage
      title="Evaluation"
      description="Assessment and evaluation workflow for academic modules."
      routePath="/modules/academics/evaluation"
      highlights={["Rubrics", "Scores", "Feedback"]}
    />
  );
}