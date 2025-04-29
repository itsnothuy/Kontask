"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  Input,
  Textarea,
  Button,
  RadioGroup,
  Radio,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  TimeInput,
} from "@heroui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import KNOWN_ROLES from "../../../config/roles"; // Adjust the import path as needed

import {
  parseStringToTime,
  timeValueToString,
  generateCalendarEventsFromWeeklySlots,
} from "../../../utils/setup/calendarHelpers";
import { uploadFile } from "../../../services/setup";
import { useSetup } from "../../../contexts/setup/SetupContext";
import { Time } from "@internationalized/date";

interface SetupPageProps {
  onNext: () => void;
}

const SetupPage: React.FC<SetupPageProps> = ({ onNext }) => {
  const { data, setData } = useSetup();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localFile, setLocalFile] = useState<File | null>(data.file);
  const [timeSlots, setTimeSlots] = useState(data.timeSlots);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weeklySlots, setWeeklySlots] = useState(data.weeklySlots);
  const router = useRouter();

  const supplierId = "21419dd2-bab8-4428-964e-32aff097bef8";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setLocalFile(e.target.files[0]);
      setData({ file: e.target.files[0] });
    }
  }

  async function handleFileUpload() {
    if (!localFile) return;
    try {
      const result = await uploadFile(supplierId, localFile);
      const skillsArr = result.detected_skills || [];
      const summary = result.summary || "";
      const detected = result.detected_roles || [];
      let selectedRole = "";
      if (detected.length > 0) {
        const roleDetected = detected[0];
        const matched = KNOWN_ROLES.find(
          (r) => r.toLowerCase() === roleDetected.toLowerCase()
        );
        selectedRole = matched || "";
      }
      setData({
        skillsText: skillsArr.join(", "),
        description: summary,
        role: selectedRole,
      });
      setErrors((prev) => ({ ...prev, file: "" }));
    } catch (err) {
      console.error("Error uploading file:", err);
      setErrors((prev) => ({
        ...prev,
        file: "Unable to parse file. Please try manual entry or check server logs.",
      }));
    }
  }

  function handleSelectSlot(info: any) {
    const newEvent = {
      id: Date.now().toString(),
      title: "Available",
      start: info.start,
      end: info.end,
    };
    const updatedSlots = [...timeSlots, newEvent];
    setTimeSlots(updatedSlots);
    setData({ timeSlots: updatedSlots });
  }

  function handleEventClick(info: any) {
    if (confirm("Remove this availability block?")) {
      const updatedSlots = timeSlots.filter((evt) => evt.id !== info.event.id);
      setTimeSlots(updatedSlots);
      setData({ timeSlots: updatedSlots });
    }
  }

  function openModal() {
    setIsModalOpen(true);
  }
  function closeModal() {
    setIsModalOpen(false);
  }

  function handleToggleAvailability(index: number, checked: boolean) {
    const newSlots = [...weeklySlots];
    newSlots[index].isAvailable = checked;
    setWeeklySlots(newSlots);
    setData({ weeklySlots: newSlots });
  }

  function handleTimeChange(index: number, field: "startTime" | "endTime", value: string) {
    const newSlots = [...weeklySlots];
    newSlots[index][field] = value;
    setWeeklySlots(newSlots);
    setData({ weeklySlots: newSlots });
  }

  function handleSaveDailyAvailability() {
    const newEvents = generateCalendarEventsFromWeeklySlots(weeklySlots, 50);
    setTimeSlots(newEvents);
    setData({ timeSlots: newEvents, weeklySlots });
    closeModal();
  }

  function goToNextStep() {
    const newErrors: Record<string, string> = {};
    if (!data.businessName.trim()) {
      newErrors.businessName = "Business name is required.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    // Instead of going directly to summary, go to the profile verification page.
    router.push("/profile_verified");
  }

  return (
    <div className="flex flex-col w-screen h-screen min-h-0">
      <div className="flex-1 min-h-0 overflow-auto">
        <Form
          onSubmit={(e) => e.preventDefault()}
          validationErrors={errors}
          className="p-4 max-w-2xl mx-auto space-y-6"
        >
          <h1 className="text-2xl font-bold">Set Up Your Supplier Profile</h1>
          <Input
            label="Business Name"
            isRequired
            errorMessage={errors.businessName}
            placeholder="Enter your business name"
            value={data.businessName}
            onValueChange={(val) => setData({ businessName: val })}
          />
          <RadioGroup
            label="How would you like to fill out your details?"
            orientation="horizontal"
            value={data.approach}
            onValueChange={(val) => setData({ approach: val as "manual" | "auto" })}
          >
            <Radio value="manual">Manual</Radio>
            <Radio value="auto">Auto (Upload a File)</Radio>
          </RadioGroup>
          {data.approach === "auto" && (
            <div className="space-y-2 w-full">
              <p className="text-sm text-gray-500">
                Upload a PDF, DOC, DOCX, PPT, or PPTX file containing your business info.
              </p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFileChange}
                  />
                  {localFile && (
                    <p className="text-sm text-gray-600">
                      Selected File: {localFile.name}
                    </p>
                  )}
                </div>
                <Button type="button" variant="bordered" onPress={handleFileUpload} isDisabled={!localFile}>
                  Parse & Auto-Fill
                </Button>
              </div>
              {errors.file && <p className="text-danger text-sm">{errors.file}</p>}
            </div>
          )}
          <Textarea
            label="Business Description"
            labelPlacement="outside"
            placeholder="Describe your business..."
            value={data.description}
            onValueChange={(val) => setData({ description: val })}
          />
          <Select
            label="Services"
            labelPlacement="outside"
            placeholder="Select your role"
            selectedKeys={data.role ? new Set([data.role]) : new Set()}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0];
              setData({ role: val as string });
            }}
          >
            {KNOWN_ROLES.map((r) => (
              <SelectItem key={r} textValue={r}>
                {r}
              </SelectItem>
            ))}
          </Select>
          <Textarea
            label="Skills"
            labelPlacement="outside"
            placeholder="List your relevant skills (e.g. react, nodejs, design)"
            value={data.skillsText}
            onValueChange={(val) => setData({ skillsText: val })}
          />
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-semibold mb-2">Calendar Availability</h2>
            <Button variant="bordered" onPress={openModal}>
              Edit Availability
            </Button>
          </div>
          <div className="w-full h-full">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              selectable={true}
              select={handleSelectSlot}
              events={timeSlots}
              eventClick={handleEventClick}
            />
          </div>
          <Divider className="my-4" />
          <div className="flex justify-end">
            <Button color="primary" onPress={goToNextStep}>
              Next: Review
            </Button>
          </div>
          <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
            <ModalContent>
              <ModalHeader>
                <h3 className="text-lg font-semibold">Set Daily Availability</h3>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {weeklySlots.map((slot, index) => (
                    <div key={slot.day}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={slot.isAvailable}
                            onChange={(e) => handleToggleAvailability(index, e.target.checked)}
                          />
                          <span className="font-medium">{slot.day}</span>
                        </div>
                        {!slot.isAvailable ? (
                          <span className="text-sm text-gray-500">Unavailable</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <TimeInput
                              labelPlacement="outside"
                              value={parseStringToTime(slot.startTime) as any}
                              onChange={(timeVal) =>
                                timeVal instanceof Time &&
                                handleTimeChange(index, "startTime", timeValueToString(timeVal))
                              }
                            />
                            <span>-</span>
                            <TimeInput
                              labelPlacement="outside"
                              value={parseStringToTime(slot.endTime) as any}
                              onChange={(timeVal) =>
                                timeVal instanceof Time &&
                                handleTimeChange(index, "endTime", timeValueToString(timeVal))
                              }
                            />
                          </div>
                        )}
                      </div>
                      <Divider className="my-2" />
                    </div>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={closeModal}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSaveDailyAvailability}>
                  Save
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Form>
      </div>
    </div>
  );
};

export default SetupPage;
