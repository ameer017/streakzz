import React from "react";

interface StreakGraphProps {
  streakData: { [key: string]: number };
}

const StreakGraph: React.FC<StreakGraphProps> = ({ streakData }) => {
  const getContributionLevel = (count: number): number => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4;
  };

  const getTooltipText = (date: string, count: number): string => {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (count === 0) {
      return `No projects on ${formattedDate}`;
    }
    return `${count} project${count > 1 ? "s" : ""} on ${formattedDate}`;
  };

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 200 * 24 * 60 * 60 * 1000);

  const weeks: string[][] = [];
  let currentWeek: string[] = [];

  // Generate weeks array for the last 30 days
  for (
    let d = new Date(thirtyDaysAgo);
    d <= today;
    d.setDate(d.getDate() + 1)
  ) {
    const dayOfWeek = d.getDay();
    const dateKey = d.toISOString().split("T")[0];

    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push(dateKey);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="flex gap-2 justify-center">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const date = week[dayIndex];
              if (!date) {
                return <div key={dayIndex} className="w-4 h-4" />;
              }

              const count = streakData[date] || 0;
              const level = getContributionLevel(count);

              return (
                <div
                  key={date}
                  className={`contribution-cell contribution-${level} w-4 h-4 rounded-sm`}
                  title={getTooltipText(date, count)}
                />
              );
            })}
          </div>
        ))}
      </div>
  );
};

export default StreakGraph;
