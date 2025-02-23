"use client";
import { InputForm } from "@/components/InputForm";
import { Clock, Download, FileText, Zap, Globe, Wifi } from "lucide-react";

import { useState } from "react";

import MetricCard from "@/components/MetricCard";
import ModernLanding from "@/components/ModernLanding";

export interface Result {
  region: string;
  websiteUrl: string;
  performanceTest: {
    loadTime: number;
    domContentLoaded: number;
    firstByteTime: number;
    firstPaintTime: number;
    firstContentfulPaintTime: number;
    timeToInteractive: number;
    numberOfRequests: number;
    pageSize: number;
  };
}

export type Metric = {
  name: string;
  value: number;
  max: number;
  unit: string;
  icon: React.ElementType;
  goodThreshold: number;
  warningThreshold: number;
  description: string;
};

export default function Home() {
  const [result, setResult] = useState<Result | null>();

  const metrics: Metric[] = result
    ? [
        {
          name: "Load Time",
          value: result.performanceTest.loadTime,
          max: 10000,
          unit: "ms",
          icon: Clock,
          goodThreshold: 4000,
          warningThreshold: 6000,
          description:
            "The time it takes for the entire page to load, including all resources.",
        },
        {
          name: "DOM Content Loaded",
          value: result.performanceTest.domContentLoaded,
          max: 5000,
          unit: "ms",
          icon: FileText,
          goodThreshold: 1200,
          warningThreshold: 2000,
          description:
            "The time it takes for the DOM to be fully loaded and parsed, without waiting for external resources.",
        },
        {
          name: "First Byte Time",
          value: result.performanceTest.firstByteTime,
          max: 3000,
          unit: "ms",
          icon: Zap,
          goodThreshold: 200,
          warningThreshold: 300,
          description:
            "The time it takes for the server to send the first byte of the response to the browser.",
        },
        {
          name: "First Paint Time",
          value: result.performanceTest.firstPaintTime,
          max: 4000,
          unit: "ms",
          icon: Zap,
          goodThreshold: 1000,
          warningThreshold: 2000,
          description:
            "The time it takes for the browser to render the first pixel on the screen.",
        },
        {
          name: "First Contentful Paint",
          value: result.performanceTest.firstContentfulPaintTime,
          max: 4000,
          unit: "ms",
          icon: Zap,
          goodThreshold: 1000,
          warningThreshold: 2000,
          description:
            "The time it takes for the browser to render the first bit of content from the DOM.",
        },
        {
          name: "Time to Interactive",
          value: result.performanceTest.timeToInteractive,
          max: 10000,
          unit: "ms",
          icon: Clock,
          goodThreshold: 4000,
          warningThreshold: 6000,
          description:
            "The time it takes for the page to become fully interactive and responsive to user input.",
        },
        {
          name: "Number of Requests",
          value: result.performanceTest.numberOfRequests,
          max: 300,
          unit: "",
          icon: FileText,
          goodThreshold: 70,
          warningThreshold: 100,
          description:
            "The total number of HTTP requests made to load the page.",
        },
        {
          name: "Page Size",
          value: result.performanceTest.pageSize,
          max: 30000000,
          unit: "bytes",
          icon: Download,
          goodThreshold: 10000000,
          warningThreshold: 15000000,
          description:
            "The total size of all resources downloaded to load the page.",
        },
      ]
    : [];

  const ResultsGrid = result && (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.name} metric={metric} />
      ))}
    </div>
  );

  return (
    <ModernLanding results={ResultsGrid} result={result}>
      <InputForm setResult={setResult} />
    </ModernLanding>
  );
}
