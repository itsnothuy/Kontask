// app/multistep.tsx (or wherever your wizard lives)
"use client";
import React, { useState } from "react";
import SetupPage from "./SetupPage";
import ProfileVerifiedPage from "../profile_verified/page";
import SummaryPage from "./SummaryPage";
import CompletePage from "./CompletePage";
import { SetupProvider } from "../../../contexts/setup/SetupContext";

type Step = "setup" | "profileVerified" | "summary" | "complete";

const MultiStepWizard = () => {
  const [step, setStep] = useState<Step>("setup");

  // After finishing Setup, go to profile verification.
  const handleNextFromSetup = () => {
    setStep("profileVerified");
  };

  // In the profile verification step, either verifying or skipping goes to summary.
  const handleSkipFromVerify = () => {
    setStep("summary");
  };

  const handleVerifyFromVerify = () => {
    // You can add any verification logic here.
    setStep("summary");
  };

  const handleEditFromSummary = () => {
    setStep("setup");
  };

  const handleSubmitFromSummary = () => {
    setStep("complete");
  };

  const handleRestart = () => {
    setStep("setup");
  };

  return (
    <SetupProvider>
      {step === "setup" && <SetupPage onNext={handleNextFromSetup} />}
      {step === "profileVerified" && (
        <ProfileVerifiedPage
          onVerify={() => setStep("summary")}
          onSkip={() => setStep("summary")}
        />
      )}
      {step === "summary" && (
        <SummaryPage onEdit={handleEditFromSummary} onSubmit={handleSubmitFromSummary} />
      )}
      {step === "complete" && <CompletePage onRestart={handleRestart} />}
    </SetupProvider>
  );
};

export default MultiStepWizard;
