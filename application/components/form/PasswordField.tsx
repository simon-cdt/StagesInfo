"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function PasswordField({
  id,
  register,
  label,
  errorsForm,
}: {
  id: string;
  // eslint-disable-next-line
  register: any;
  label: string;
  errorsForm: string | undefined;
}) {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <div className="flex flex-col gap-2 *:not-first:mt-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
          <Image
            src={"/icon/lock.svg"}
            alt="Icon"
            width={700}
            height={700}
            className="w-4"
          />
        </div>
        <Input
          id={id}
          className="pe-9 pl-9"
          placeholder="********"
          type={isVisible ? "text" : "password"}
          {...register(id)}
        />
        <button
          className="pointer text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={toggleVisibility}
          aria-label={
            isVisible ? "Cacher le mot de passe" : "Afficher le mot de passe"
          }
          aria-pressed={isVisible}
          aria-controls="password"
        >
          {isVisible ? (
            <EyeOffIcon size={16} aria-hidden="true" />
          ) : (
            <EyeIcon size={16} aria-hidden="true" />
          )}
        </button>
      </div>
      {errorsForm && <p className="text-sm text-red-500">{errorsForm}</p>}
    </div>
  );
}
