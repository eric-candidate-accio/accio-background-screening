"use client";

import { Input, Button, Label } from "@repo/ui";
import { Save, Loader2 } from "lucide-react";

export interface SavePackageFormProps {
  packageName: string;
  onPackageNameChange: (name: string) => void;
  onSave: () => void;
  isValid: boolean;
  isSaving: boolean;
  isEditing: boolean;
  serviceCount: number;
}

export function SavePackageForm({
  packageName,
  onPackageNameChange,
  onSave,
  isValid,
  isSaving,
  isEditing,
  serviceCount,
}: SavePackageFormProps) {
  const canSave = packageName.trim().length > 0 && serviceCount > 0 && isValid;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="package-name">Package Name</Label>
        <Input
          id="package-name"
          placeholder="Enter package name..."
          value={packageName}
          onChange={(e) => onPackageNameChange(e.target.value)}
        />
      </div>

      <Button
        className="w-full"
        onClick={onSave}
        disabled={!canSave || isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            {isEditing ? "Update Package" : "Save Package"}
          </>
        )}
      </Button>

      {serviceCount === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Add at least one service to save
        </p>
      )}
    </div>
  );
}
