"use client";

import { Label } from "react-aria-components";

import {
  DateField as DateFieldImport,
  DateInput,
} from "@/components/ui/datefield-rac";
import { useEffect, useState } from "react";
import Image from "next/image";
import Icon from "../Icon";

export default function DateField({
  label,
  id,
  setValue,
  errorForm,
}: {
  label: string;
  id: string;
  // eslint-disable-next-line
  setValue: any;
  errorForm: string | undefined;
}) {
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      date.setHours(0, 0, 0, 0);
      setValue(id, date, { shouldValidate: true });
    }
  }, [date, setValue]);

  return (
    <DateFieldImport
      className="flex w-full flex-col gap-2 *:not-first:mt-2"
      onChange={(e) => {
        if (!e) {
          setDate(undefined);
        } else {
          const parsedDate = new Date(e.toString());
          if (!isNaN(parsedDate.getTime())) {
            setDate(parsedDate);
          }
        }
      }}
    >
      <Label className="text-foreground text-sm font-medium">{label}</Label>
      <div className="relative">
        <div className="text-muted-foreground absolute top-1/2 left-3 z-10 -translate-y-1/2">
          <Icon src="calendar" />
        </div>
        <DateInput className="w-full pl-9" />
      </div>
      {errorForm && <p className="mt-1 text-sm text-red-500">{errorForm}</p>}
    </DateFieldImport>
  );
}
