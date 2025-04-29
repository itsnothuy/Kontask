"use client";
import React, { useState } from "react";
import { Button, Divider } from "@heroui/react";
import { useSetup } from "../../../contexts/setup/SetupContext";
import { updateProfile, updateAvailability } from "../../../services/setup";

interface SummaryPageProps {
  onEdit: () => void;
  onSubmit: () => void;
}

const SummaryPage: React.FC<SummaryPageProps> = ({ onEdit, onSubmit }) => {
  const { data } = useSetup();
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit() {
    const newErrors: Record<string, string> = {};
    if (!data.businessName.trim()) {
      newErrors.businessName = "Business name is required.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const supplierId = "21419dd2-bab8-4428-964e-32aff097bef8";
    const skillList = data.skillsText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const payload = {
      businessName: data.businessName,
      approach: data.approach,
      pdfSummary: data.description,
      skills: skillList,
      role: data.role,
      timeSlots: data.timeSlots,
      weeklySlots: data.weeklySlots,
    };

    const slotsPayload = data.weeklySlots.map((slot) => ({
      day_of_week: slot.day,
      is_available: slot.isAvailable,
      start_time: slot.startTime,
      end_time: slot.endTime,
    }));

    try {
      await updateProfile(supplierId, payload);
      await updateAvailability(supplierId, slotsPayload);
      onSubmit(); // move to the complete step
    } catch (err) {
      console.error("Error saving form data:", err);
      alert("Failed to save form data on the server. Check console.");
    }
  }

  return (
    <div className="p-4 w-1/2 mx-auto">
      <h1 className="text-2xl font-bold mb-4">Review Your Profile</h1>
      <div className="bg-white p-4 rounded shadow space-y-2">
        <p><strong>Business Name:</strong> {data.businessName}</p>
        <Divider />
        <p><strong>Description:</strong> {data.description}</p>
        <p><strong>Services:</strong> {data.role}</p>
        <p><strong>Skills:</strong> {data.skillsText}</p>
        <Divider />
        <div>
          <strong>Daily Slots:</strong>
          <ul className="list-disc list-inside">
            {data.weeklySlots.map((s) => (
              <li key={s.day}>
                {s.day}: {s.isAvailable ? `${s.startTime} - ${s.endTime}` : "Unavailable"}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6 flex gap-4">
        <Button variant="bordered" onPress={onEdit}>Edit</Button>
        <Button color="primary" onPress={handleSubmit}>Confirm & Submit</Button>
      </div>
    </div>
  );
};

export default SummaryPage;
