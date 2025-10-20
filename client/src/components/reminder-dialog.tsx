import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ReminderDialog() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [interval, setInterval] = useState(3);
  const { toast } = useToast();

  const handleSave = () => {
    if (enabled) {
      toast({
        title: "Hatırlatıcı Aktif",
        description: `Her ${interval} saatte bir hatırlatma alacaksınız.`,
      });
    } else {
      toast({
        title: "Hatırlatıcı Kapalı",
        description: "Hatırlatıcılar devre dışı bırakıldı.",
      });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-open-reminder">
          <Bell className="mr-2 h-4 w-4" />
          Hatırlatıcı
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="dialog-reminder">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Besleme Hatırlatıcısı
          </DialogTitle>
          <DialogDescription>
            Besleme zamanlarını hatırlatmak için bildirimleri ayarlayın.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="reminder-enabled" className="flex-1">
              <div className="font-medium">Hatırlatıcıyı Aktif Et</div>
              <div className="text-sm text-muted-foreground">
                Düzenli aralıklarla bildirim al
              </div>
            </Label>
            <Switch
              id="reminder-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
              data-testid="switch-reminder-enabled"
            />
          </div>

          {enabled && (
            <div className="space-y-2">
              <Label htmlFor="interval">Hatırlatma Aralığı (Saat)</Label>
              <Input
                id="interval"
                type="number"
                min="1"
                max="12"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value))}
                data-testid="input-reminder-interval"
              />
              <p className="text-xs text-muted-foreground">
                Her {interval} saatte bir hatırlatma alacaksınız
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-reminder">
            İptal
          </Button>
          <Button onClick={handleSave} data-testid="button-save-reminder">
            Kaydet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
