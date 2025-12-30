// @/components/forms/FormError.tsx
"use client";

import { FieldValues, Path, UseFormReturn } from "react-hook-form";

interface FormErrorProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>; 
  className?: string;
}

export default function FormError<T extends FieldValues>({
  form,
  name,
  className = "text-red-500 text-sm mt-1",
}: FormErrorProps<T>) {
  const { errors, touchedFields } = form.formState;

  const error = errors && (errors as any)[name];
  const touched = touchedFields && (touchedFields as any)[name];

  if (!touched || !error?.message) return null;

  return <p className={className}>{String(error.message)}</p>;
}
