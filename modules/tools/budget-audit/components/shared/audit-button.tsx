import { forwardRef } from "react";
import { LoaderCircle } from "lucide-react";
import { Button as ShadcnButton } from "@/components/ui/button";

type Props = Omit<
  React.ComponentProps<typeof ShadcnButton>,
  "variant" | "size"
> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => (
    <ShadcnButton
      ref={ref}
      variant={
        variant === "primary"
          ? "default"
          : variant === "danger"
            ? "destructive"
            : variant
      }
      size={size === "md" ? "default" : size}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <LoaderCircle className="animate-spin" />}
      {children}
    </ShadcnButton>
  ),
);
Button.displayName = "Button";
