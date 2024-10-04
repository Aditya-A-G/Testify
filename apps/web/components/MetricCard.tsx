"use client";

import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Metric } from "@/app/page";

function formatValue(value: number, unit: string): string {
  if (unit === "ms") {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} s`;
    }
    return `${value.toFixed(1)} ms`;
  } else if (unit === "bytes") {
    if (value >= 1024 * 1024) {
      return `${(value / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(value / 1024).toFixed(2)} KB`;
    }
  }
  return value.toString();
}

function getColorForMetric(metric: Metric): string {
  if (metric.value <= metric.goodThreshold) {
    return "hsl(var(--success))";
  } else if (metric.value <= metric.warningThreshold) {
    return "hsl(var(--warning))";
  } else {
    return "hsl(var(--destructive))";
  }
}

export function MetricCard({ metric }: { metric: Metric }) {
  const color = getColorForMetric(metric);

  const data = [
    {
      name: "Value",
      value: metric.value,
      fill: color,
    },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {metric.name}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{metric.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <metric.icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-1 justify-between items-center pt-4">
        <div className="text-2xl font-bold" style={{ color }}>
          {formatValue(metric.value, metric.unit)}
        </div>
        <div className="h-24 w-24 relative">
          <RadialBarChart
            width={96}
            height={96}
            cx={48}
            cy={48}
            innerRadius={30}
            outerRadius={48}
            barSize={10}
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, metric.max]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar background dataKey="value" cornerRadius={30 / 2} />
          </RadialBarChart>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-lg" style={{ color }}>
              {metric.value <= metric.goodThreshold && "Good"}
              {metric.value > metric.goodThreshold &&
                metric.value <= metric.warningThreshold &&
                "Ok"}
              {metric.value > metric.warningThreshold && "Bad"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
