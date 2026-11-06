import React from "react";
import * as Select from "@radix-ui/react-select";

import { ChevronDown, ChevronUp, Check } from "lucide-react";
function Chevron({ up = false }) {
  const Icon = up ? ChevronUp : ChevronDown;
  return <Icon size={16} strokeWidth={1.6} aria-hidden="true" />;
}

export default function FilterSelect({ label, value, onChange, options }) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="filter-select-trigger" aria-label={label}>
        <Select.Value />
        <Select.Icon className="filter-select-chevron">
          <Chevron />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="filter-select-menu"
          position="popper"
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={12}
        >
          <Select.ScrollUpButton className="filter-select-scroll">
            <Chevron up />
          </Select.ScrollUpButton>
          <Select.Viewport className="filter-select-viewport">
            {options.map((option) => (
              <Select.Item
                className="filter-select-option"
                value={option.value}
                key={option.value}
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="filter-select-check">
                  <Check size={16} strokeWidth={1.5} aria-hidden="true" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="filter-select-scroll">
            <Chevron />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
