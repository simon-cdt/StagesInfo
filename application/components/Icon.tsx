import Image from "next/image";
import React from "react";

export default function Icon({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <Image
      src={`/icon/${src}.svg`}
      alt="Icon"
      width={700}
      height={700}
      className={className ? className : "w-4"}
    />
  );
}
