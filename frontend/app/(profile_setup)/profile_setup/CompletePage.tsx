"use client";
import React from "react";
import { Button } from "@heroui/react";
import { useSetup } from "../../../contexts/setup/SetupContext";

interface CompletePageProps {
  onRestart: () => void;
}

const CompletePage: React.FC<CompletePageProps> = ({ onRestart }) => {
  const { reset } = useSetup();

  return (
    <div className="p-4 w-1/2 mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Profile Setup Complete!</h1>
      <p>Your supplier profile is now fully set up. Thank you!</p>
      <div className="mt-6">
        <Button
          color="primary"
          onPress={() => {
            reset();
            onRestart();
          }}
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
};

export default CompletePage;
