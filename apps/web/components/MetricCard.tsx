import React from "react";
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      return `${(value / 1000).toFixed(2)}s`;
    }
    return `${value.toFixed(1)}ms`;
  } else if (unit === "bytes") {
    if (value >= 1024 * 1024) {
      return `${(value / (1024 * 1024)).toFixed(2)}MB`;
    } else {
      return `${(value / 1024).toFixed(2)}KB`;
    }
  }
  return value.toString();
}

function getStatusConfig(metric: Metric) {
  if (metric.value <= metric.goodThreshold) {
    return {
      status: "Good",
      color: "text-green-500",
      bgColor: "bg-green-500",
      ringColor: "ring-green-500/20",
      bgLight: "bg-green-500/10",
    };
  } else if (metric.value <= metric.warningThreshold) {
    return {
      status: "Fair",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500",
      ringColor: "ring-yellow-500/20",
      bgLight: "bg-yellow-500/10",
    };
  } else {
    return {
      status: "Lacking",
      color: "text-red-500",
      bgColor: "bg-red-500",
      ringColor: "ring-red-500/20",
      bgLight: "bg-red-500/10",
    };
  }
}
function getProgressValue(metric: Metric): { progress: number; label: string } {
  // For metrics where lower is better (like load times)
  if (metric.unit === "ms" || metric.unit === "bytes") {
    if (metric.value <= metric.goodThreshold) {
      return {
        progress: 100,
        label: `${formatValue(metric.goodThreshold, metric.unit)} target achieved`,
      };
    } else if (metric.value <= metric.warningThreshold) {
      const progress =
        100 -
        ((metric.value - metric.goodThreshold) /
          (metric.warningThreshold - metric.goodThreshold)) *
          50;
      return {
        progress,
        label: `${formatValue(metric.goodThreshold, metric.unit)} target`,
      };
    } else {
      const progress =
        50 -
        Math.min(
          50,
          ((metric.value - metric.warningThreshold) / metric.warningThreshold) *
            50
        );
      return {
        progress,
        label: "Needs improvement",
      };
    }
  }
  // For metrics where higher is better (could be customized per metric)
  else {
    if (metric.value >= metric.goodThreshold) {
      return {
        progress: 100,
        label: "Target achieved",
      };
    } else if (metric.value >= metric.warningThreshold) {
      const progress =
        50 +
        ((metric.value - metric.warningThreshold) /
          (metric.goodThreshold - metric.warningThreshold)) *
          50;
      return {
        progress,
        label: "Near target",
      };
    } else {
      const progress = Math.min(
        50,
        (metric.value / metric.warningThreshold) * 50
      );
      return {
        progress,
        label: "Below target",
      };
    }
  }
}

export default function MetricCard({ metric }: { metric: Metric }) {
  const config = getStatusConfig(metric);
  const { progress, label } = getProgressValue(metric);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{metric.name}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{metric.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className={`text-2xl font-semibold ${config.color}`}>
              {formatValue(metric.value, metric.unit)}
            </p>
          </div>
          <div className={`p-2 rounded-full ${config.bgLight}`}>
            <metric.icon className={`h-5 w-5 ${config.color}`} />
          </div>
        </div>

        <div className="relative mt-6">
          <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`absolute h-full ${config.bgColor} transition-all duration-500 rounded-full`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className={`inline-flex items-center gap-1.5 ${config.color}`}>
              <div className={`h-2 w-2 rounded-full ${config.bgColor}`} />
              {config.status}
            </div>
            <div className="text-muted-foreground text-xs">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
