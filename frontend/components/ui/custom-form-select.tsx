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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Option {
  label: string | React.ReactNode;
  value: string;
}

interface CustomFormSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: string;
  options: Option[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  headerContent?: React.ReactNode;
}

export function CustomFormSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  options,
  isLoading,
  emptyMessage = "No options found.",
  className,
  headerContent,
}: CustomFormSelectProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="flex justify-between items-center">
            <FormLabel>{label}</FormLabel>
            {headerContent}
          </div>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value || undefined}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {isLoading ? (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : options.length > 0 ? (
                options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-muted-foreground text-sm text-center">
                  {emptyMessage}
                </div>
              )}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
