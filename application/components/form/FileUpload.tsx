"use client";

import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Label } from "../ui/label";
import Icon from "../Icon";

export default function FileUpload({
  setValue,
  errorsForm,
  id,
  label,
  text,
}: {
  // eslint-disable-next-line
  setValue: any;
  errorsForm: string | undefined;
  id: string;
  label: React.ReactNode;
  text: string;
}) {
  const maxSize = 10 * 1024 * 1024;

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    maxSize,
  });

  const file = files[0];

  useEffect(() => {
    if (file && file.file instanceof File) {
      setValue(id, file.file, { shouldValidate: true });
    }
  }, [file, setValue]);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {/* Drop area */}
      <div
        role="button"
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        className="pointer border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
      >
        <input
          id="cv"
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload file"
          disabled={Boolean(file)}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div
            className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <Icon src="upload" className="w-5" />
          </div>
          <p className="mb-1.5 text-sm font-medium">{text}</p>
          <p className="text-muted-foreground text-xs">
            Glisser-déposer ou cliquez pour parcourir (max.{" "}
            {formatBytes(maxSize)})
          </p>
        </div>
      </div>

      {errorsForm && <p className="text-sm text-red-500">{errorsForm}</p>}
      {errors.length > 0 && <p className="text-sm text-red-500">{errors[0]}</p>}

      {/* File list */}
      {file && (
        <div className="space-y-2">
          <div
            key={file.id}
            className="flex items-center justify-between gap-2 rounded-xl border px-4 py-2"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <Icon src="attachment" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">
                  {file.file.name}
                </p>
              </div>
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
              onClick={() => removeFile(files[0]?.id)}
              aria-label="Remove file"
            >
              <Icon src="xmark" className="w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
