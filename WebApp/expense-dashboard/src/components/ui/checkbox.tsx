import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

export function Checkbox({
  checked,
  onCheckedChange,
  id,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id: string;
}) {
  return (
    <CheckboxPrimitive.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      style={{
        width: "16px",
        height: "16px",
        borderRadius: "3px",
        padding: "10px",
        backgroundColor: checked ? "#ffffff" : "#1a1a1a", // white bg if checked, dark bg if unchecked
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background-color 0.2s, border-color 0.2s",
      }}
    >
      <CheckboxPrimitive.Indicator>
        <CheckIcon size={12} color="#1f2937" /> {/* dark icon */}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
