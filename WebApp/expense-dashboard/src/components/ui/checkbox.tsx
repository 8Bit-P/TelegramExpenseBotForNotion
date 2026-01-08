import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

// 1. Define the props by extending the Radix Root props
type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;

// 2. Accept ...props to capture disabled, required, className, etc.
export function Checkbox({ style, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      {...props} // 3. Spread the props here. This passes 'disabled' to Radix.
      style={{
        width: "16px",
        height: "16px",
        borderRadius: "3px",
        padding: "10px",
        // Logic to handle disabled styling if needed:
        opacity: props.disabled ? 0.5 : 1, 
        pointerEvents: props.disabled ? 'none' : 'auto',
        backgroundColor: props.checked ? "#ffffff" : "#1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background-color 0.2s, border-color 0.2s",
        ...style, // Allow overriding styles if passed
      }}
    >
      <CheckboxPrimitive.Indicator>
        <CheckIcon size={12} color="#1f2937" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}