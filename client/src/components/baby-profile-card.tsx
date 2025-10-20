import { Baby } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Baby as BabyIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface BabyProfileCardProps {
  baby: Baby;
  onEdit?: () => void;
}

export function BabyProfileCard({ baby, onEdit }: BabyProfileCardProps) {
  const age = formatDistanceToNow(new Date(baby.birthDate), { 
    addSuffix: false, 
    locale: tr 
  });

  const initials = baby.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover-elevate" data-testid="card-baby-profile">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 bg-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-serif font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-serif font-semibold text-xl" data-testid="text-baby-name">
              {baby.name}
            </h3>
            <p className="text-muted-foreground text-sm" data-testid="text-baby-age">
              {age}
            </p>
          </div>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              data-testid="button-edit-baby"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
