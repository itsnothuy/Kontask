import { createContext, useState, useContext, ReactNode } from "react";

export interface DailySlot {
  day: string;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

export interface CalendarTimeSlot {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

export interface SetupData {
  businessName: string;
  approach: "manual" | "auto";
  file: File | null;
  description: string;
  role: string;
  skillsText: string;
  skillsArray: string[];
  timeSlots: CalendarTimeSlot[];
  weeklySlots: DailySlot[];
}

const defaultData: SetupData = {
  businessName: "",
  approach: "manual",
  file: null,
  description: "",
  role: "",
  skillsText: "",
  skillsArray: [],
  timeSlots: [],
  weeklySlots: [
    { day: "Monday",    isAvailable: true,  startTime: "09:00", endTime: "17:00" },
    { day: "Tuesday",   isAvailable: true,  startTime: "09:00", endTime: "17:00" },
    { day: "Wednesday", isAvailable: true,  startTime: "09:00", endTime: "17:00" },
    { day: "Thursday",  isAvailable: true,  startTime: "09:00", endTime: "17:00" },
    { day: "Friday",    isAvailable: true,  startTime: "09:00", endTime: "17:00" },
    { day: "Saturday",  isAvailable: false, startTime: "09:00", endTime: "17:00" },
    { day: "Sunday",    isAvailable: false, startTime: "09:00", endTime: "17:00" },
  ],
};

interface SetupContextType {
  data: SetupData;
  setData: (partial: Partial<SetupData>) => void;
  reset: () => void;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export const SetupProvider = ({ children }: { children: ReactNode }) => {
  const [data, setRawData] = useState<SetupData>(defaultData);

  const setData = (partial: Partial<SetupData>) => {
    setRawData((prev) => ({ ...prev, ...partial }));
  };

  const reset = () => setRawData(defaultData);

  return (
    <SetupContext.Provider value={{ data, setData, reset }}>
      {children}
    </SetupContext.Provider>
  );
};

export const useSetup = () => {
  const context = useContext(SetupContext);
  if (!context) {
    throw new Error("useSetup must be used within a SetupProvider");
  }
  return context;
};
