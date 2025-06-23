
import React from "react";
import { StudentTestTakeView } from "@/components/qstudy/StudentTestTakeView";
import { QStudyHero } from "@/components/qstudy/QStudyHero";
import { QStudyDashboard } from "@/components/qstudy/QStudyDashboard";

/**
 * Q.Study - Student Quiz Page
 * Features:
 * - Hero section with motivational stats and theme
 * - Personal dashboard
 * - Robust test UI
 */
const QStudy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-4 px-2 sm:px-4">
      <QStudyHero />
      <QStudyDashboard />
      <div className="mt-6">
        <StudentTestTakeView />
      </div>
    </div>
  );
};

export default QStudy;
