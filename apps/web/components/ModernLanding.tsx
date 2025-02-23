"use client";

import React, { useEffect, useState } from "react";
import {
  Shield,
  Zap,
  Globe,
  Server,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Result } from "@/app/page";

const RecentTests = () => {
  const [recentTests, setRecentTests] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecentTests = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/recent-tests`
      );
      const data = await response.json();
      setRecentTests(data.recentTests);
    };

    fetchRecentTests();
    const intervalId = setInterval(fetchRecentTests, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Live Tests</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
          Updated Live
        </span>
      </div>
      <ScrollArea className="h-[120px]">
        {recentTests.map((test) => (
          <div
            key={test.id}
            className="flex items-center justify-between py-2 border-b last:border-0"
          >
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              <span className="text-sm font-medium">{test.websiteUrl}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">{test.region}</span>
              <span className="font-medium">{test.loadTime} ms</span>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

interface ModernLandingProps {
  children: React.ReactNode;
  results?: React.ReactNode;
  result?: Result | null;
}

const ModernLanding: React.FC<ModernLandingProps> = ({
  children: inputForm,
  results,
  result,
}) => {
  // Add to your metrics display section
  const shareResults = async () => {
    try {
      if (result === null || result === undefined) return;

      await navigator.share({
        title: "Website Performance Test Results",
        text: `Performance test results for ${result.websiteUrl}:\nLoad Time: ${result.performanceTest.loadTime}ms\nTTFB: ${result.performanceTest.firstByteTime}ms`,
        url: window.location.href,
      });
    } catch (err) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(
        `${window.location.href}?results=${encodeURIComponent(JSON.stringify(result))}`
      );
      toast({
        title: "Link copied to clipboard",
        description: "You can now share these results with others.",
      });
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b bg-black/5 dark:bg-white/5">
        <div className="w-full max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Test Your Website Performance
              <span className="text-primary"> Globally</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get instant insights into your website's performance across
              different regions
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {inputForm}

            <div className="flex justify-center gap-8 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 mr-1 text-primary" />
                2,500+ Websites Tested
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 mr-1 text-primary" />
                Global Testing Locations
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 mr-1 text-primary" />
                Real Browser Testing
              </div>
            </div>
          </div>

          {!results && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
              <ChevronDown className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 py-12">
        {results ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Results</h2>
              <Button variant="outline" size="sm" onClick={shareResults}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Share Results
              </Button>
            </div>
            {results}
          </div>
        ) : (
          <div className="space-y-16">
            <div>
              <h2 className="text-2xl font-bold text-center mb-8">
                Comprehensive Performance Metrics
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Zap className="w-8 h-8 text-primary mb-4" />
                      <h3 className="font-semibold mb-2">Speed Metrics</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Load time, Time to First Byte (TTFB), and Time to
                      Interactive measurements.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Server className="w-8 h-8 text-primary mb-4" />
                      <h3 className="font-semibold mb-2">Resource Analysis</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Page size, number of requests, and resource optimization
                      suggestions.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Globe className="w-8 h-8 text-primary mb-4" />
                      <h3 className="font-semibold mb-2">Global Testing</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Test from multiple locations to ensure consistent
                      performance worldwide.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">How It Works</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-primary font-semibold">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Enter Your Website</h3>
                      <p className="text-muted-foreground text-sm">
                        Simply input your website URL and choose a testing
                        region
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-primary font-semibold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        Real Browser Testing
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        We test your site using real browsers in different
                        locations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-primary font-semibold">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        Get Detailed Results
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Receive comprehensive performance metrics and analysis
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Card className="p-6">
                <RecentTests />
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernLanding;
