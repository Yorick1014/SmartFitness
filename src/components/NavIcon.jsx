import React from "react";
import { Dumbbell, History, Settings, ChartColumn } from "lucide-react";
const icons = { Workout: Dumbbell, History, Settings, Statistics: ChartColumn };
export default function NavIcon({ name }) {
  const Icon = icons[name];
  return (
    <Icon className="nav-icon" size={24} strokeWidth={1.7} aria-hidden="true" />
  );
}
