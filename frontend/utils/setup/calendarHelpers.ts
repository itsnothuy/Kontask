import { Time, parseTime } from "@internationalized/date";

export function parseStringToTime(str: string): Time {
  return parseTime(str);
}

export function timeValueToString(timeVal: Time): string {
  const hh = String(timeVal.hour).padStart(2, "0");
  const mm = String(timeVal.minute).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function generateCalendarEventsFromWeeklySlots(
  weeklySlots: { day: string; isAvailable: boolean; startTime: string; endTime: string }[],
  daysAhead = 50
) {
  const newEvents = [];
  const today = new Date();
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + i
    );
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
    const slot = weeklySlots.find((s) => s.day === dayOfWeek);
    if (slot && slot.isAvailable) {
      const [startH, startM] = slot.startTime.split(":").map(Number);
      const [endH, endM] = slot.endTime.split(":").map(Number);
      const startDate = new Date(date);
      startDate.setHours(startH, startM, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(endH, endM, 0, 0);
      newEvents.push({
        id: (Date.now() + i).toString(),
        title: "Available",
        start: startDate,
        end: endDate,
      });
    }
  }
  return newEvents;
}
