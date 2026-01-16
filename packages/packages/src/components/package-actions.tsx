"use client";

import { Button } from "@repo/ui";
import { Edit2, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

export interface PackageActionsProps {
  packageId: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function PackageActions({
  packageId,
  onEdit,
  onDelete,
  isDeleting,
}: PackageActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    if (showConfirm) {
      onDelete(packageId);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onEdit(packageId)}
        title="Edit package"
      >
        <Edit2 className="h-4 w-4" />
      </Button>

      {showConfirm ? (
        <div className="flex items-center gap-1">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Confirm"
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfirm(false)}
            className="h-8"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          title="Delete package"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
