"use client";

import type { ValidationError } from "@repo/api";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui";
import { AlertTriangle } from "lucide-react";
import { formatValidationErrors } from "../lib/validation";

export interface ConflictAlertProps {
  errors: ValidationError[];
  warnings?: string[];
}

export function ConflictAlert({ errors, warnings = [] }: ConflictAlertProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  const formattedErrors = formatValidationErrors(errors);

  return (
    <Alert variant={errors.length > 0 ? "destructive" : "warning"}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        {errors.length > 0 ? "Configuration Issues" : "Warnings"}
      </AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1">
          {formattedErrors.map((error, index) => (
            <li key={index} className="text-sm">
              • {error}
            </li>
          ))}
          {warnings.map((warning, index) => (
            <li key={`warning-${index}`} className="text-sm text-amber-600">
              • {warning}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
