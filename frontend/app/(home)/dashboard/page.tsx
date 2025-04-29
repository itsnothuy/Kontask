"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --------------------------------------------------------------------------
// Example Chart Data
// (Replace with real data to match your final design exactly.)
// --------------------------------------------------------------------------
const inquiryBreakdownData = {
  labels: ["Booked", "Flopped"],
  datasets: [
    {
      data: [36.2, 63.8],
      backgroundColor: ["#A78BFA", "#C4B5FD"],
      hoverBackgroundColor: ["#8B5CF6", "#A78BFA"],
      borderWidth: 1,
    },
  ],
};

const inquiryBreakdownOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" as const },
    title: { display: false },
  },
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const inquiriesPerMonthData = {
  labels: months,
  datasets: [
    {
      label: "Inquiries",
      data: [5, 10, 7, 12, 9, 11, 15, 14, 18, 25, 28, 22],
      backgroundColor: "#A78BFA",
    },
  ],
};
const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" as const },
    title: { display: false },
  },
};

// Example data for "Projects per Month" bar chart
const inquirySourceData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  datasets: [
    {
      label: "Inquiries",
      data: [1, 1, 3, 1, 1, 1, 8, 8, 3, 0, 1, 1],
      backgroundColor: "#A78BFA",
    },
  ],
};

const incomePerQuarterData = {
  labels: ["Q1", "Q2", "Q3", "Q4"],
  datasets: [
    {
      data: [13.1, 28.6, 28.0, 30.3],
      backgroundColor: ["#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"],
      borderWidth: 1,
    },
  ],
};

const incomePerMonthData = {
  labels: months,
  datasets: [
    {
      label: "Income",
      data: [5000, 15000, 20000, 25000, 30000, 35000, 32000, 28000, 29000, 38000, 35000, 33000],
      backgroundColor: "#A78BFA",
    },
  ],
};

const incomeSourceStackData = {
  labels: months,
  datasets: [
    {
      label: "Web",
      data: [2000, 5000, 7000, 10000, 14000, 15000, 18000, 16000, 15000, 20000, 22000, 21000],
      backgroundColor: "#A78BFA",
    },
    {
      label: "Email",
      data: [1000, 3000, 4000, 5000, 4000, 4000, 3000, 5000, 7000, 7000, 6000, 7000],
      backgroundColor: "#C4B5FD",
    },
    {
      label: "Social",
      data: [500, 1000, 2000, 1500, 1000, 3000, 4000, 3000, 2000, 5000, 4000, 3000],
      backgroundColor: "#DDD6FE",
    },
  ],
};

const incomeSourceStackOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" as const },
    title: { display: false },
  },
  scales: {
    x: { stacked: true },
    y: { stacked: true },
  },
};

export default function DashboardPage() {
  return (
    <>
      {/* 
        1) Fill the screen. 
        2) Center a fixed-size container. 
        3) Hide any overflow. 
      */}
      <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-[#F9FAFB]">
        {/* 
          Fixed-size "frame" or full size "frame" 
          Then scale it so it fits on typical laptops. 
          Tweak 'scale-90' or 'scale-75' if it doesn't fit.
        */}
        <div className="relative w-full h-full bg-white rounded-md shadow-md p-6 overflow-hidden transform scale-90">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold">Hello Olivia</h1>
                <p className="text-sm text-gray-600">
                  Select project: <strong>Dec 1, 2022</strong> - <strong>Dec 31, 2022</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="border border-gray-300 px-3 py-1 rounded text-gray-700 text-sm hover:bg-gray-100">
                New Automation
              </button>
              <button className="border border-gray-300 px-3 py-1 rounded text-gray-700 text-sm hover:bg-gray-100">
                New Template
              </button>
              <button className="border border-gray-300 px-3 py-1 rounded text-gray-700 text-sm hover:bg-gray-100">
                Filter
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-[#FAFAFE] rounded-md p-4 flex flex-col">
              <p className="text-sm text-gray-500">Total Income</p>
              <h2 className="text-xl font-bold">$250,000.00</h2>
            </div>
            <div className="bg-[#FAFAFE] rounded-md p-4 flex flex-col">
              <p className="text-sm text-gray-500">Inquiry Success Rate</p>
              <h2 className="text-xl font-bold">36.2%</h2>
            </div>
            <div className="bg-[#FAFAFE] rounded-md p-4 flex flex-col">
              <p className="text-sm text-gray-500">Number of New Clients</p>
              <h2 className="text-xl font-bold">36</h2>
            </div>
            <div className="bg-[#FAFAFE] rounded-md p-4 flex flex-col">
              <p className="text-sm text-gray-500">Number of Completed Projects</p>
              <h2 className="text-xl font-bold">29</h2>
            </div>
          </div>

          {/* Row 1: 3 Charts */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Inquiry Breakdown (Doughnut) */}
            <div className="bg-[#FAFAFE] rounded-md p-4 flex flex-col">
              <p className="text-sm font-semibold text-gray-700 mb-2">Inquiry Breakdown</p>
              {/* Center the Doughnut chart */}
              <div className="relative w-full h-[220px] flex items-center justify-center">
                <Doughnut data={inquiryBreakdownData} options={inquiryBreakdownOptions} />
              </div>
            </div>

            {/* Inquiries per Month (Bar) */}
            <div className="bg-[#FAFAFE] rounded-md p-4 flex flex-col">
              <p className="text-sm font-semibold text-gray-700 mb-2">Inquiries per Month</p>
              <div className="relative w-full h-[220px]">
                <Bar data={inquiriesPerMonthData} options={barChartOptions} />
              </div>
            </div>

            {/* Projects per Month (Bar) */}
            <div className="bg-[#FAFAFE] rounded-md p-4 flex flex-col">
              <p className="text-sm font-semibold text-gray-700 mb-2">Projects per Month</p>
              <div className="relative w-full h-[220px]">
                <Bar data={inquirySourceData} options={barChartOptions} />
              </div>
            </div>
          </div>

          {/* Row 2: 3 Charts */}
          <div className="grid grid-cols-3 gap-4">
            {/* Income per Quarter (Doughnut) */}
            <div className="bg-[#FAFAFE] rounded-md p-4 flex flex-col">
              <p className="text-sm font-semibold text-gray-700 mb-2">Income per Quarter</p>
              {/* Center the Doughnut chart */}
              <div className="relative w-full h-[220px] flex items-center justify-center">
                <Doughnut data={incomePerQuarterData} options={{ ...inquiryBreakdownOptions, maintainAspectRatio: false }} />
              </div>
            </div>

            {/* Income per Month (Bar) */}
            <div className="bg-[#FAFAFE] rounded-md p-4 flex flex-col">
              <p className="text-sm font-semibold text-gray-700 mb-2">Income per Month</p>
              <div className="relative w-full h-[220px]">
                <Bar data={incomePerMonthData} options={barChartOptions} />
              </div>
            </div>

            {/* Income Source per Month (Stacked Bar) */}
            <div className="bg-[#FAFAFE] rounded-md p-4 flex flex-col">
              <p className="text-sm font-semibold text-gray-700 mb-2">Income Source per Month</p>
              <div className="relative w-full h-[220px]">
                <Bar data={incomeSourceStackData} options={incomeSourceStackOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
