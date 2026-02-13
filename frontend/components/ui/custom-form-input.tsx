"use client";

import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CustomFormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: string;
  className?: string;
  step?: string;
  startIcon?: React.ReactNode;
}

export function CustomFormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  type = "text",
  className,
  step,
  startIcon,
}: CustomFormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              {startIcon && (
                <div className="top-1/2 left-3 absolute text-muted-foreground -translate-y-1/2">
                  {startIcon}
                </div>
              )}
              <Input
                placeholder={placeholder}
                type={type}
                step={step}
                className={cn(startIcon && "pl-9")}
                {...field}
                value={field.value || ""} // Handle null/undefined values
                onChange={(e) => {
                  const value = e.target.value;
                  if (type === "number") {
                    field.onChange(value === "" ? "" : parseFloat(value));
                  } else {
                    field.onChange(value);
                  }
                }}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
