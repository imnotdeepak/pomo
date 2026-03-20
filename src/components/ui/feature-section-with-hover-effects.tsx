"use client";

import { cn } from "@/lib/utils";
import { Suspense, lazy, useState } from "react";
import {
  IconClock,
  IconLayoutKanban,
  IconMusic,
  IconChartBar,
  IconAdjustments,
  IconFlame,
} from "@tabler/icons-react";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
);

export function FeaturesSection() {
  const [isHovered, setIsHovered] = useState(false);
  const features = [
    {
      title: "Focus Timer",
      description:
        "Circular Pomodoro timer with customizable focus and break durations to keep you on track.",
      icon: <IconClock />,
    },
    {
      title: "Task Board",
      description:
        "Drag-and-drop Kanban board with To Do, In Progress, and Done columns synced to your account.",
      icon: <IconLayoutKanban />,
    },
    {
      title: "Ambient Sounds",
      description:
        "Rain, brown noise, classical, and more. Fine-tune volume to build your perfect focus environment.",
      icon: <IconMusic />,
    },
    {
      title: "Progress Tracking",
      description:
        "60-day activity heatmap, daily totals, and all-time focus hours to visualize your growth.",
      icon: <IconChartBar />,
    },
    {
      title: "Customizable",
      description:
        "Adjust session lengths, break intervals, and alarm sounds to perfectly fit your workflow.",
      icon: <IconAdjustments />,
    },
    {
      title: "Streaks",
      description:
        "Build momentum with daily streaks and habit tracking that keep you coming back every day.",
      icon: <IconFlame />,
    },
  ];

  return (
    <section
      className="min-h-screen flex items-center px-4 md:px-6 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Suspense fallback={<div className="absolute inset-0 bg-muted/20" />}>
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen">
          <Dithering
            colorBack="#00000000"
            colorFront="#936dfc"
            shape="warp"
            type="4x4"
            speed={isHovered ? 0.6 : 0.2}
            className="size-full"
            minPixelRatio={1}
          />
        </div>
      </Suspense>
      <div className="max-w-5xl mx-auto px-6 w-full">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground">
            Everything in one place.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            All the tools you need to build a deep work habit.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-border",
        (index === 0 || index === 3) && "lg:border-l border-border",
        index < 3 && "lg:border-b border-border"
      )}
    >
      {index < 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-zinc-100 dark:from-zinc-800 to-transparent pointer-events-none" />
      )}
      {index >= 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-zinc-100 dark:from-zinc-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-muted-foreground">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-muted group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
          {title}
        </span>
      </div>
      <p className="text-sm text-muted-foreground max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
