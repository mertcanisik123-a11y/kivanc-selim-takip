import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Milk, Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { insertFeedingRecordSchema } from "@shared/schema";

const formSchema = insertFeedingRecordSchema.extend({
  amount: z.coerce.number().min(1, "Miktar en az 1 ml olmalı").max(500, "Miktar en fazla 500 ml olabilir"),
});

type FormValues = z.infer<typeof formSchema>;

interface FeedingFormProps {
  babyId: string;
  onSubmit: (data: FormValues) => void;
  isLoading?: boolean;
}

export function FeedingForm({ babyId, onSubmit, isLoading }: FeedingFormProps) {
  const [amount, setAmount] = useState(100);
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState(format(new Date(), "HH:mm"));

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      babyId,
      amount: 100,
      feedingTime: new Date(),
      notes: "",
    },
  });

  const handleSubmit = (data: FormValues) => {
    const [hours, minutes] = time.split(":");
    const feedingDateTime = new Date(date);
    feedingDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    onSubmit({
      ...data,
      amount,
      feedingTime: feedingDateTime,
    });
  };

  const adjustAmount = (delta: number) => {
    const newAmount = Math.max(10, Math.min(500, amount + delta));
    setAmount(newAmount);
    form.setValue("amount", newAmount);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={() => (
            <FormItem>
              <FormLabel>Süt Miktarı (ml)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustAmount(-10)}
                    data-testid="button-decrease-amount"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <div className="text-4xl font-mono font-bold text-primary" data-testid="text-amount">
                      {amount}
                      <span className="text-lg text-muted-foreground ml-1">ml</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustAmount(10)}
                    data-testid="button-increase-amount"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Tarih</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  data-testid="button-select-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: tr }) : "Tarih seçin"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FormItem>

          <FormItem>
            <FormLabel>Saat</FormLabel>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              data-testid="input-time"
            />
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar (İsteğe Bağlı)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Örn: İyi içti, huzurlu..."
                  {...field}
                  value={field.value || ""}
                  data-testid="input-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
          data-testid="button-submit-feeding"
        >
          <Milk className="mr-2 h-4 w-4" />
          {isLoading ? "Kaydediliyor..." : "Besleme Kaydı Ekle"}
        </Button>
      </form>
    </Form>
  );
}
