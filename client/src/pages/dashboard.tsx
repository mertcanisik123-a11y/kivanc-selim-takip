import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Baby, FeedingRecord } from "@shared/schema";
import { BabyProfileCard } from "@/components/baby-profile-card";
import { StatsCard } from "@/components/stats-card";
import { FeedingForm } from "@/components/feeding-form";
import { FeedingChart } from "@/components/feeding-chart";
import { FeedingHistory } from "@/components/feeding-history";
import { ReminderDialog } from "@/components/reminder-dialog";
import { BabyDialog } from "@/components/baby-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Milk, Baby as BabyIcon, Clock, TrendingUp, Plus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { startOfDay, subDays, format } from "date-fns";
import { tr } from "date-fns/locale";

export default function Dashboard() {
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const [feedingDialogOpen, setFeedingDialogOpen] = useState(false);
  const [babyDialogOpen, setBabyDialogOpen] = useState(false);
  const [editingBaby, setEditingBaby] = useState<Baby | undefined>();
  const { toast } = useToast();

  const { data: babies = [], isLoading: babiesLoading } = useQuery<Baby[]>({
    queryKey: ["/api/babies"],
  });

  useEffect(() => {
    if (babies.length > 0 && !selectedBabyId) {
      setSelectedBabyId(babies[0].id);
    }
  }, [babies, selectedBabyId]);

  const { data: feedingRecords = [], isLoading: recordsLoading } = useQuery<FeedingRecord[]>({
    queryKey: ["/api/feeding-records", selectedBabyId],
    queryFn: async () => {
      const res = await fetch("/api/feeding-records", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      return res.json();
    },
    enabled: !!selectedBabyId,
  });

  const currentBaby = babies.find((b) => b.id === selectedBabyId) || babies[0];
  const currentRecords = feedingRecords.filter((r) => r.babyId === currentBaby?.id);

  const createBabyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/babies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/babies"] });
      setBabyDialogOpen(false);
      toast({
        title: "Başarılı!",
        description: "Bebek bilgileri kaydedildi.",
      });
    },
  });

  const updateBabyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/babies/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/babies"] });
      setBabyDialogOpen(false);
      setEditingBaby(undefined);
      toast({
        title: "Başarılı!",
        description: "Bebek bilgileri güncellendi.",
      });
    },
  });

  const createFeedingMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/feeding-records", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feeding-records"], exact: false });
      setFeedingDialogOpen(false);
      toast({
        title: "Başarılı!",
        description: "Besleme kaydı eklendi.",
      });
    },
  });

  const deleteFeedingMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/feeding-records/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feeding-records"], exact: false });
      toast({
        title: "Başarılı!",
        description: "Besleme kaydı silindi.",
      });
    },
  });

  const stats = useMemo(() => {
    if (!currentRecords.length) {
      return {
        totalToday: 0,
        countToday: 0,
        avgAmount: 0,
        lastFeeding: null,
      };
    }

    const today = startOfDay(new Date());
    const todayRecords = currentRecords.filter(
      (r) => startOfDay(new Date(r.feedingTime)).getTime() === today.getTime()
    );

    const totalToday = todayRecords.reduce((sum, r) => sum + r.amount, 0);
    const countToday = todayRecords.length;
    const avgAmount = currentRecords.length > 0
      ? Math.round(currentRecords.reduce((sum, r) => sum + r.amount, 0) / currentRecords.length)
      : 0;
    
    const sortedRecords = [...currentRecords].sort(
      (a, b) => new Date(b.feedingTime).getTime() - new Date(a.feedingTime).getTime()
    );
    const lastFeeding = sortedRecords[0]?.feedingTime;

    return { totalToday, countToday, avgAmount, lastFeeding };
  }, [currentRecords]);

  const handleBabySubmit = (data: any) => {
    if (editingBaby) {
      updateBabyMutation.mutate({ id: editingBaby.id, data });
    } else {
      createBabyMutation.mutate(data);
    }
  };

  const handleEditBaby = (baby: Baby) => {
    setEditingBaby(baby);
    setBabyDialogOpen(true);
  };

  if (babiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BabyIcon className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (babies.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Milk className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-serif font-semibold">Bebek Süt Takip</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <BabyIcon className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-serif font-semibold mb-2">Hoş Geldiniz!</h2>
            <p className="text-muted-foreground mb-6">
              Bebeğinizin beslenmesini takip etmeye başlamak için önce bebek bilgilerini ekleyin.
            </p>
            <Button
              size="lg"
              onClick={() => setBabyDialogOpen(true)}
              data-testid="button-add-first-baby"
            >
              <BabyIcon className="mr-2 h-5 w-5" />
              Bebek Ekle
            </Button>
          </div>
        </div>
        <BabyDialog
          open={babyDialogOpen}
          onOpenChange={setBabyDialogOpen}
          onSubmit={handleBabySubmit}
          isLoading={createBabyMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Milk className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-semibold hidden sm:block">Bebek Süt Takip</h1>
          </div>
          <div className="flex items-center gap-2">
            <ReminderDialog />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-serif font-semibold">Gösterge Paneli</h2>
          <Button
            variant="outline"
            onClick={() => {
              setEditingBaby(undefined);
              setBabyDialogOpen(true);
            }}
            data-testid="button-add-baby"
          >
            <BabyIcon className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Bebek Ekle</span>
          </Button>
        </div>

        {currentBaby && (
          <>
            <BabyProfileCard baby={currentBaby} onEdit={() => handleEditBaby(currentBaby)} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Bugün Toplam"
                value={`${stats.totalToday} ml`}
                icon={Milk}
                description={`${stats.countToday} besleme`}
              />
              <StatsCard
                title="Ortalama Miktar"
                value={`${stats.avgAmount} ml`}
                icon={TrendingUp}
                description="Besleme başına"
              />
              <StatsCard
                title="Bugünkü Sayı"
                value={stats.countToday}
                icon={BabyIcon}
                description="Toplam besleme"
              />
              <StatsCard
                title="Son Besleme"
                value={stats.lastFeeding ? format(new Date(stats.lastFeeding), "HH:mm") : "-"}
                icon={Clock}
                description={stats.lastFeeding ? format(new Date(stats.lastFeeding), "d MMM", { locale: tr }) : "Kayıt yok"}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <FeedingChart records={currentRecords} />
                <FeedingHistory
                  records={currentRecords}
                  onDelete={(id) => deleteFeedingMutation.mutate(id)}
                />
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Yeni Besleme Kaydı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FeedingForm
                      babyId={currentBaby.id}
                      onSubmit={(data) => createFeedingMutation.mutate(data)}
                      isLoading={createFeedingMutation.isPending}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>

      <BabyDialog
        open={babyDialogOpen}
        onOpenChange={(open) => {
          setBabyDialogOpen(open);
          if (!open) setEditingBaby(undefined);
        }}
        onSubmit={handleBabySubmit}
        baby={editingBaby}
        isLoading={createBabyMutation.isPending || updateBabyMutation.isPending}
      />

      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg lg:hidden"
        onClick={() => setFeedingDialogOpen(true)}
        data-testid="button-quick-add"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Dialog open={feedingDialogOpen} onOpenChange={setFeedingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Besleme Kaydı Ekle</DialogTitle>
          </DialogHeader>
          {currentBaby && (
            <FeedingForm
              babyId={currentBaby.id}
              onSubmit={(data) => createFeedingMutation.mutate(data)}
              isLoading={createFeedingMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
