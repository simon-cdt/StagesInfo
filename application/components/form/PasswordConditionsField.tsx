"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function PasswordConditionsField({
  id,
  setValue,
  label,
}: {
  id: string;
  // eslint-disable-next-line
  setValue: any;
  label: string;
}) {
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: "Au moins huit caractères" },
      { regex: /[0-9]/, text: "Au moins un chiffre" },
      {
        regex: /[!@#$%^&*(),.?":{}|<>]/,
        text: "Au moins un caractère spécial",
      },
      { regex: /[A-Z]/, text: "Au moins une majuscule" },
    ];

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const strength = checkStrength(password);

  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score === 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  useEffect(() => {
    setValue(id, password, { shouldValidate: true });
  }, [password, setValue]);

  return (
    <div className="flex flex-col gap-2">
      {/* Password input field with toggle visibility button */}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={`${id}-description`}
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
      </div>

      {/* Password strength indicator */}
      <div
        className="bg-border h-1 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={strengthScore}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label="La force du mot de passe"
      >
        <div
          className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
          style={{ width: `${(strengthScore / 4) * 100}%` }}
        ></div>
      </div>

      <div className="flex flex-col gap-1">
        {/* Password strength description */}
        <p
          id={`${id}-description`}
          className="text-foreground mb-2 text-sm font-medium"
        >
          Doit contenir :
        </p>

        {/* Password requirements list */}
        <ul className="flex flex-col gap-1" aria-label="Password requirements">
          {strength.map((req, index) => (
            <li key={index} className="flex items-center gap-2">
              {req.met ? (
                <CheckIcon
                  size={16}
                  className="text-emerald-500"
                  aria-hidden="true"
                />
              ) : (
                <XIcon
                  size={16}
                  className="text-muted-foreground/80"
                  aria-hidden="true"
                />
              )}
              <span
                className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}
              >
                {req.text}
                <span className="sr-only">
                  {req.met ? " - Requirement met" : " - Requirement not met"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
