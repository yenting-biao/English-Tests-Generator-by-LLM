"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { listeningClozeSchema as formSchema } from "@/lib/validators/genQA";
import React from "react";
import { Input } from "@/components/ui/input";

export function ListeningClozeForm({
  setResult,
  streaming,
  setStreaming,
  resultRef,
}: {
  setResult: React.Dispatch<React.SetStateAction<string>>;
  streaming: boolean;
  setStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  resultRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numBlanks: 8,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // The form values are type-safe and validated.
    console.log(values);
    if (
      (values.transcript === "" || values.transcript === undefined) &&
      values.audioFile === undefined
    ) {
      toast({
        variant: "destructive",
        title: "Your form is incomplete.",
        description: "Please provide either an audio file or a transcript.",
        duration: 3000,
      });
      return;
    } else if (
      values.transcript &&
      values.transcript !== "" &&
      values.audioFile
    ) {
      toast({
        variant: "default",
        title: "Your audio file will be ignored.",
        description:
          "You have provided both an audio file and a transcript. The audio file will be ignored. We will use the transcript tp generate the cloze test.",
        duration: 3000,
      });
    }

    const formData = new FormData();
    formData.append("numBlanks", values.numBlanks.toString());
    if (values.audioFile) {
      formData.append("audioFile", values.audioFile);
    }
    if (values.transcript && values.transcript !== "") {
      formData.append("transcript", values.transcript);
    }

    setStreaming(true);

    try {
      const res = await fetch("/api/listening-cloze", {
        method: "POST",
        body: formData,
      });
      if (res.status === 400) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description:
            "Please make sure you provided a valid Youtube link and the form is filled correctly.",
          duration: 3000,
        });
        return;
      } else if (!res.ok || !res.body) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description:
            "Failed to generate questions due to server error. Please try again later.",
          duration: 3000,
        });
        return;
      }

      setResult("");
      resultRef.current?.scrollIntoView({
        behavior: "auto",
        block: "start",
        inline: "nearest",
      });

      const reader = res.body.getReader();
      let count = 0;
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        result += new TextDecoder().decode(value);
        setResult(result);
        count++;
        if (count > 2048) {
          break;
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setStreaming(false);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid md:grid-cols-1 gap-4 max-w-3xl w-full"
      >
        <NumBlanksField form={form} />
        <AudioFileField form={form} />
        <div className="md:col-span-1">
          <TranscriptField form={form} />
        </div>
        <Button
          type="submit"
          className="w-fit md:col-span-1 disabled:cursor-not-allowed"
          disabled={streaming}
        >
          Generate!
        </Button>
      </form>
    </Form>
  );
}

function NumBlanksField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  return (
    <FormField
      control={form.control}
      name="numBlanks"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Number of Blanks</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(Number(value))}
            defaultValue={field.value.toString()}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select the number of blanks" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Array.from({ length: 20 }, (_, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Select the number of blanks to let the students fill in.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function AudioFileField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  return (
    <FormField
      control={form.control}
      name="audioFile"
      // eslint-disable-next-line no-unused-vars
      render={({ field: { value, onChange, ...fieldProps } }) => (
        <FormItem>
          <FormLabel>
            Audio File <span className="font-extralight">(Optional)</span>
          </FormLabel>
          <FormControl>
            <Input
              {...fieldProps}
              placeholder="Audio File"
              type="file"
              accept="audio/*"
              onChange={(event) => {
                onChange(event.target.files && event.target.files[0]);
                console.log(event.target.files);
              }}
            />
          </FormControl>
          <FormDescription>
            Upload the audio file you want to generate listening cloze tests. If
            you already have a transcript, you can leave this field blank and
            paste the transcript in the field below.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TranscriptField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  return (
    <FormField
      control={form.control}
      name="transcript"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Transcript <span className="font-extralight">(Optional)</span>
          </FormLabel>
          <Textarea
            placeholder=""
            className="resize-none md:resize-y h-60"
            {...field}
          />
          <FormDescription>
            If you already have a transcript, you can paste it here.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
