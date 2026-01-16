"use client";

import { PackageBuilder } from "@repo/builder";
import { useRouter, useSearchParams } from "next/navigation";

export default function BuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const handlePackageSaved = (packageId: string) => {
    console.log("Package saved:", packageId);
    router.push("/packages");
  };

  const handleViewPackages = () => {
    router.push("/packages");
  };

  return (
    <PackageBuilder
      key={editId || "new"}
      editPackageId={editId}
      onPackageSaved={handlePackageSaved}
      onViewPackages={handleViewPackages}
    />
  );
}
