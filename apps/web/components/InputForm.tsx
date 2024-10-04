"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

const regions = [
  { label: "us", value: "us" },
  { label: "eu", value: "eu" },
  { label: "asia", value: "asia" },
  { label: "india", value: "india" },
] as const;

const FormSchema = z.object({
  websiteUrl: z.string().url({
    message: "Please enter a valid URL.",
  }),
  region: z.string({
    required_error: "Please select a region",
  }),
});

export function InputForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      websiteUrl: "",
      region: "india",
    },
  });

  const [jobId, setJobId] = useState<string | null>(null);
  const [polling, setPolling] = useState<boolean>(false);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit URL");
      }

      const result = await response.json();

      setJobId(result.jobId);
      setPolling(true);

      toast({
        title: "Success!",
        description: "Your URL has been submitted for testing.",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error.message || "An error occurred while submitting the URL.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unknown error occurred!",
        });
      }
    }
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function checkTestResult() {
      if (!jobId || !polling) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tests/${jobId}/results`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch test results");
        }

        const data = await response.json();

        if (data.status === "completed") {
          console.log("Test completed");
          toast({
            title: "Test Completed",
            description: "Test result is ready.",
          });
          setPolling(false);
        } else if (data.status === "pending") {
          console.log("Test is pending");
        } else if (data.status === "failed") {
          console.log("Test failed");
          setPolling(false);
          toast({
            variant: "destructive",
            title: "Test Failed",
            description: "Please try again later.",
          });
        } else if (data.status === "not found") {
          console.log(data.message);
        } else if (data.status === "error") {
          console.log(data.message);
          setPolling(false);
        }
      } catch (error) {
        console.error("Error during polling:", error);
        setPolling(false);
      }
    }

    if (polling) {
      intervalId = setInterval(checkTestResult, 12000);
    }
    return () => clearInterval(intervalId);
  }, [jobId, polling]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-2/4 space-x-4 flex items-start"
      >
        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem className="flex-grow flex-shrink-0">
              <FormControl>
                <Input placeholder="https://adityacodes.tech" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? regions.find((region) => region.value === field.value)
                            ?.label
                        : "Select region"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search region..." />
                    <CommandList>
                      <CommandEmpty>No regionr found.</CommandEmpty>
                      <CommandGroup>
                        {regions.map((region) => (
                          <CommandItem
                            value={region.label}
                            key={region.value}
                            onSelect={() => {
                              form.setValue("region", region.value);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                region.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {region.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="px-10">
          Test
        </Button>
      </form>
    </Form>
  );
}
