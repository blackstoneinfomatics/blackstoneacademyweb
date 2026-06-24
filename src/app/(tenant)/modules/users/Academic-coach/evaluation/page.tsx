"use client";

import EvaluationSteps from "@/EvaluationSteps/EvaluationSteps";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const EvaluationPage = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("AcademicCoachPortalId");
    const token = localStorage.getItem("AcademicCoachAuthToken");

    if (!token) {
      toast.error(AppValidationMessages.ERROR_MESSAGES.MISSING_AUTH_TOKEN);
      return;
    }

    if (!id) {
      toast.error(AppValidationMessages.ERROR_MESSAGES.MISSING_ACADEMIC_COACH_ID);
      return;
    }

    setUserId(id);
  }, []);

  if (!userId) {
    return null;
  }

  return <EvaluationSteps userId={userId} />;
};

export default EvaluationPage;
