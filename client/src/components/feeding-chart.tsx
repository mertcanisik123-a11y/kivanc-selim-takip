import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FeedingRecord } from "@shared/schema";
import { format, startOfDay, startOfHour, startOfWeek, subDays, subHours, subWeeks } from "date-fns";
import { tr } from "date-fns/locale";

interface FeedingChartProps {
  records: FeedingRecord[];
}

export function FeedingChart({ records }: FeedingChartProps) {
  const hourlyData = useMemo(() => {
    const now = new Date();
    const last24Hours = subHours(now, 24);
    const hourlyMap = new Map<string, number>();

    for (let i = 0; i < 24; i++) {
      const hour = subHours(now, 23 - i);
      const key = format(startOfHour(hour), "HH:00");
      hourlyMap.set(key, 0);
    }

    records
      .filter((r) => new Date(r.feedingTime) >= last24Hours)
      .forEach((r) => {
        const key = format(startOfHour(new Date(r.feedingTime)), "HH:00");
        hourlyMap.set(key, (hourlyMap.get(key) || 0) + r.amount);
      });

    return Array.from(hourlyMap.entries()).map(([hour, amount]) => ({
      hour,
      amount,
    }));
  }, [records]);

  const dailyData = useMemo(() => {
    const dailyMap = new Map<string, { amount: number; count: number }>();

    for (let i = 0; i < 7; i++) {
      const day = subDays(new Date(), 6 - i);
      const key = format(startOfDay(day), "dd MMM", { locale: tr });
      dailyMap.set(key, { amount: 0, count: 0 });
    }

    records
      .filter((r) => new Date(r.feedingTime) >= subDays(new Date(), 7))
      .forEach((r) => {
        const key = format(startOfDay(new Date(r.feedingTime)), "dd MMM", { locale: tr });
        const current = dailyMap.get(key) || { amount: 0, count: 0 };
        dailyMap.set(key, {
          amount: current.amount + r.amount,
          count: current.count + 1,
        });
      });

    return Array.from(dailyMap.entries()).map(([day, data]) => ({
      day,
      amount: data.amount,
      count: data.count,
    }));
  }, [records]);

  const weeklyData = useMemo(() => {
    const weeklyMap = new Map<string, { amount: number; count: number }>();

    for (let i = 0; i < 4; i++) {
      const week = subWeeks(new Date(), 3 - i);
      const key = `Hafta ${i + 1}`;
      weeklyMap.set(key, { amount: 0, count: 0 });
    }

    records
      .filter((r) => new Date(r.feedingTime) >= subWeeks(new Date(), 4))
      .forEach((r) => {
        const weekStart = startOfWeek(new Date(r.feedingTime), { locale: tr });
        const weekIndex = Math.floor((new Date().getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (weekIndex < 4) {
          const key = `Hafta ${4 - weekIndex}`;
          const current = weeklyMap.get(key) || { amount: 0, count: 0 };
          weeklyMap.set(key, {
            amount: current.amount + r.amount,
            count: current.count + 1,
          });
        }
      });

    return Array.from(weeklyMap.entries()).map(([week, data]) => ({
      week,
      amount: data.amount,
      count: data.count,
    }));
  }, [records]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Besleme Grafikleri</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hourly" data-testid="tab-hourly">Saatlik</TabsTrigger>
            <TabsTrigger value="daily" data-testid="tab-daily">Günlük</TabsTrigger>
            <TabsTrigger value="weekly" data-testid="tab-weekly">Haftalık</TabsTrigger>
          </TabsList>

          <TabsContent value="hourly" className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-1))' }}
                  name="Miktar (ml)"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="daily" className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="amount" 
                  fill="hsl(var(--chart-1))" 
                  radius={[8, 8, 0, 0]}
                  name="Toplam Miktar (ml)"
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="count" 
                  fill="hsl(var(--chart-2))" 
                  radius={[8, 8, 0, 0]}
                  name="Besleme Sayısı"
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="amount" 
                  fill="hsl(var(--chart-3))" 
                  radius={[8, 8, 0, 0]}
                  name="Toplam Miktar (ml)"
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="count" 
                  fill="hsl(var(--chart-4))" 
                  radius={[8, 8, 0, 0]}
                  name="Besleme Sayısı"
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
