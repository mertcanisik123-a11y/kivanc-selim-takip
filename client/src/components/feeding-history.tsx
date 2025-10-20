import { FeedingRecord } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Milk, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface FeedingHistoryProps {
  records: FeedingRecord[];
  onEdit?: (record: FeedingRecord) => void;
  onDelete?: (id: string) => void;
}

export function FeedingHistory({ records, onEdit, onDelete }: FeedingHistoryProps) {
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.feedingTime).getTime() - new Date(a.feedingTime).getTime()
  );

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Besleme Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Milk className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Henüz besleme kaydı yok.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              İlk besleme kaydınızı ekleyerek başlayın!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Besleme Geçmişi</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sortedRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-4 p-4 rounded-lg border hover-elevate"
                data-testid={`record-${record.id}`}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Milk className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-semibold text-lg" data-testid={`amount-${record.id}`}>
                      {record.amount} ml
                    </span>
                    <span className="text-sm text-muted-foreground" data-testid={`time-${record.id}`}>
                      {format(new Date(record.feedingTime), "HH:mm")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(record.feedingTime), "d MMMM yyyy", { locale: tr })}
                  </p>
                  {record.notes && (
                    <p className="text-sm mt-1 text-muted-foreground truncate" data-testid={`notes-${record.id}`}>
                      {record.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(record)}
                      data-testid={`button-edit-${record.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(record.id)}
                      data-testid={`button-delete-${record.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
