"use client";

import { PackagesList } from "@repo/packages";
import { useRouter } from "next/navigation";

export default function PackagesPage() {
  const router = useRouter();

  const handleCreateNew = () => {
    router.push("/");
  };

  const handleEdit = (id: string) => {
    router.push(`/?edit=${id}`);
  };

  return <PackagesList onCreateNew={handleCreateNew} onEdit={handleEdit} />;
}
