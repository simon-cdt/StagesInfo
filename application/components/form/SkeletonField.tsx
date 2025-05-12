import React from "react";
import { Skeleton } from "../ui/skeleton";

export default function SkeletonField() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-[100px]" />
      <Skeleton className="h-4 w-[250px]" />
    </div>
  );
}
