"use client";
import React, { useState } from "react";

export default function DebugCheck() {
  const [slots, setSlots] = useState([
    { day: "Monday", isAvailable: true },
    { day: "Tuesday", isAvailable: false },
  ]);

  const toggle = (i: number) => {
    setSlots((prev) => {
      const copy = [...prev];
      copy[i].isAvailable = !copy[i].isAvailable;
      return copy;
    });
  };

  return (
    <div>
      {slots.map((s, i) => (
        <div key={s.day}>
          <input
            type="checkbox"
            checked={s.isAvailable}
            onChange={() => toggle(i)}
          />
          {s.day} &gt; {s.isAvailable ? "Available" : "Unavailable"}
        </div>
      ))}
    </div>
  );
}
