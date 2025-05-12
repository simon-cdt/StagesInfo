import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "react-hook-form";

interface FormFieldProps {
  label: string;
  name: string;
  type: "text" | "password" | "email" | "file";
  placeholder?: string;
  // eslint-disable-next-line
  register: any;
  error?: FieldError;
  icon?: React.ReactNode;
  defaultValue?: string;
}

export const FormField = ({
  label,
  name,
  type,
  placeholder,
  register,
  error,
  icon,
  defaultValue,
}: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        {icon && (
          <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
            {icon}
          </div>
        )}
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          {...register(name)}
          className={icon ? "pl-9" : ""}
          defaultValue={defaultValue}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
};
