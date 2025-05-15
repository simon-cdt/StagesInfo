"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import Icon from "../Icon";

export default function SelectWithSearch({
  id,
  label,
  placeHolderSelect,
  placeHolderInput,
  notFoundItem,
  items,
  setValue,
  isLoading,
  isError,
  errorsForm,
}: {
  id: string;
  label: string;
  placeHolderSelect: string;
  placeHolderInput: string;
  notFoundItem: string;
  items:
    | {
        label: string;
        value: string;
      }[]
    | undefined;
  //eslint-disable-next-line
  setValue: any;
  isLoading: boolean;
  isError: boolean;
  errorsForm: string | undefined;
}) {
  const [selectValue, setSelectValue] = useState<string>("");

  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select onValueChange={(value) => setValue(id, value)}>
        <SelectTrigger className="pointer">
          <SelectValue placeholder={placeHolderSelect} />
        </SelectTrigger>
        <SelectContent className="flex w-max flex-col p-2" autoFocus={false}>
          <div className="relative">
            <Icon
              src="search"
              className="absolute top-1/2 left-3 w-4 -translate-y-1/2"
            />
            <Input
              type="text"
              placeholder={placeHolderInput}
              className="w-full pl-9"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value || "")}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="h-3" />
          <Separator />
          <div className="h-2" />
          <div className="flex flex-col gap-1">
            {isLoading && (
              <p className="text-sm text-black/70">Chargement...</p>
            )}
            {isError && (
              <p className="text-sm text-red-500">Erreur de chargement</p>
            )}
            {items && items.length < 1 ? (
              <p className="text-sm text-black/70">{notFoundItem}</p>
            ) : items &&
              items.filter((item) => {
                const search = selectValue.toLowerCase();
                return item.label.toLowerCase().includes(search);
              }).length === 0 ? (
              <p className="text-sm text-black/70">
                La recherche n&apos;a rien donnée...
              </p>
            ) : (
              items &&
              items
                .filter((item) => {
                  const search = selectValue.toLowerCase();
                  return item.label.toLowerCase().includes(search);
                })
                .map((item) => (
                  <SelectItem
                    autoFocus={false}
                    key={item.value}
                    value={item.value}
                    className="pointer"
                  >
                    {item.label}
                  </SelectItem>
                ))
            )}
          </div>
        </SelectContent>
      </Select>
      {errorsForm && <small className="text-red-500">{errorsForm}</small>}
    </div>
  );
}
