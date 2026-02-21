"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Gift,
  Users,
  Copy,
  CheckCircle,
  Share2,
  Mail,
  MessageCircle,
  Link as LinkIcon,
  Ticket,
  Trophy,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalEarned: number;
  pendingReward: number;
  rewardPerReferral: number;
  nextMilestone: number;
  milestoneReward: string;
}

interface ReferralCardProps {
  data: ReferralData;
  className?: string;
}

// Referral stats component
export function ReferralStats({
  data,
  compact = false,
  className,
}: {
  data: ReferralData;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-6", className)}>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-600">{data.completedReferrals}</p>
          <p className="text-xs text-muted-foreground">Zaproszonych</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{data.totalEarned} PLN</p>
          <p className="text-xs text-muted-foreground">Zarobione</p>
        </div>
        {data.pendingReward > 0 && (
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{data.pendingReward} PLN</p>
            <p className="text-xs text-muted-foreground">Oczekuje</p>
          </div>
        )}
      </div>
    );
  }

  const progressToMilestone = (data.completedReferrals / data.nextMilestone) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-amber-50 rounded-xl">
          <Users className="h-6 w-6 text-amber-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-700">{data.completedReferrals}</p>
          <p className="text-xs text-amber-600">Zaproszeni znajomi</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-xl">
          <Gift className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-700">{data.totalEarned} PLN</p>
          <p className="text-xs text-green-600">Łącznie zarobione</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-xl">
          <Ticket className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-700">{data.rewardPerReferral} PLN</p>
          <p className="text-xs text-blue-600">Za każde zaproszenie</p>
        </div>
      </div>

      {/* Milestone progress */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Następny poziom</span>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {data.completedReferrals}/{data.nextMilestone}
          </Badge>
        </div>
        <Progress value={progressToMilestone} className="h-2 mb-2" />
        <p className="text-sm text-muted-foreground">
          Zaproś jeszcze {data.nextMilestone - data.completedReferrals} osób i otrzymaj{" "}
          <span className="font-semibold text-purple-600">{data.milestoneReward}</span>
        </p>
      </div>
    </div>
  );
}

// Invite friend dialog
export function InviteFriendDialog({
  referralCode,
  referralLink,
  rewardAmount,
  trigger,
}: {
  referralCode: string;
  referralLink: string;
  rewardAmount: number;
  trigger?: React.ReactNode;
}) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSendEmail = async () => {
    if (!email) return;
    setSending(true);
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSending(false);
    setSent(true);
    setEmail("");
    setTimeout(() => setSent(false), 3000);
  };

  const shareOnSocial = (platform: string) => {
    const message = `Dołącz do Seated i odkryj wyjątkowe wydarzenia kulinarne! Użyj mojego kodu ${referralCode} i otrzymaj ${rewardAmount} PLN zniżki na pierwszą rezerwację! ${referralLink}`;

    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, "_blank");
        break;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
            <Gift className="h-4 w-4" />
            Zaproś znajomych
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-600" />
            Zaproś znajomych
          </DialogTitle>
          <DialogDescription>
            Zaproś znajomych i otrzymaj{" "}
            <span className="font-semibold text-amber-600">{rewardAmount} PLN</span> za każdą
            osobę, która dokona rezerwacji!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Referral code */}
          <div className="space-y-2">
            <Label>Twój kod polecający</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={referralCode}
                  readOnly
                  className="font-mono text-lg font-bold text-center pr-10"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => copyToClipboard(referralCode, "code")}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {copied === "code" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{copied === "code" ? "Skopiowano!" : "Kopiuj kod"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Referral link */}
          <div className="space-y-2">
            <Label>Link do zaproszenia</Label>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(referralLink, "link")}
              >
                {copied === "link" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Share buttons */}
          <div className="space-y-2">
            <Label>Udostępnij</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => shareOnSocial("whatsapp")}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => shareOnSocial("facebook")}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Facebook
              </Button>
            </div>
          </div>

          {/* Email invite */}
          <div className="space-y-2 pt-2 border-t">
            <Label>Wyślij zaproszenie e-mailem</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@znajomego.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={handleSendEmail}
                disabled={!email || sending}
              >
                {sending ? (
                  "Wysyłanie..."
                ) : sent ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="text-xs text-muted-foreground text-center sm:text-left">
            Twój znajomy otrzyma {rewardAmount} PLN zniżki na pierwszą rezerwację
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Referral code input for new users
export function ReferralCodeInput({
  onApply,
  className,
}: {
  onApply?: (code: string) => void;
  className?: string;
}) {
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code) return;
    setApplying(true);
    setError("");

    // Simulate validation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple validation - in real app this would call API
    if (code.length < 6) {
      setError("Nieprawidłowy kod polecający");
      setApplying(false);
      return;
    }

    setApplied(true);
    setApplying(false);
    onApply?.(code);
  };

  if (applied) {
    return (
      <div className={cn("flex items-center gap-2 p-3 bg-green-50 rounded-lg", className)}>
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div>
          <p className="font-medium text-green-700">Kod zastosowany!</p>
          <p className="text-sm text-green-600">Otrzymasz zniżkę przy pierwszej rezerwacji</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="referral-code" className="flex items-center gap-2">
        <Gift className="h-4 w-4 text-amber-600" />
        Masz kod polecający?
      </Label>
      <div className="flex gap-2">
        <Input
          id="referral-code"
          placeholder="Wpisz kod"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="font-mono uppercase"
        />
        <Button
          onClick={handleApply}
          disabled={!code || applying}
          variant="outline"
        >
          {applying ? "Sprawdzam..." : "Zastosuj"}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Main referral card component
export function ReferralCard({ data, className }: ReferralCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-white">Program poleceń</CardTitle>
            <CardDescription className="text-amber-100">
              Zaproś znajomych i zarabiaj!
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* How it works */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            Jak to działa?
          </h4>
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-amber-600">
                1
              </div>
              <div>
                <p className="font-medium text-sm">Udostępnij swój kod</p>
                <p className="text-xs text-muted-foreground">Wyślij link znajomym</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-amber-600">
                2
              </div>
              <div>
                <p className="font-medium text-sm">Znajomy rezerwuje</p>
                <p className="text-xs text-muted-foreground">I dostaje zniżkę {data.rewardPerReferral} PLN</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-amber-600">
                3
              </div>
              <div>
                <p className="font-medium text-sm">Ty też zarabiasz!</p>
                <p className="text-xs text-muted-foreground">Otrzymasz {data.rewardPerReferral} PLN na konto</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <ReferralStats data={data} />

        {/* Action */}
        <InviteFriendDialog
          referralCode={data.referralCode}
          referralLink={data.referralLink}
          rewardAmount={data.rewardPerReferral}
          trigger={
            <Button className="w-full gap-2 bg-amber-600 hover:bg-amber-700">
              <Gift className="h-4 w-4" />
              Zaproś znajomych
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}

// Demo data
export const demoReferralData: ReferralData = {
  referralCode: "SEATED-JAN25",
  referralLink: "https://seated.pl/ref/SEATED-JAN25",
  totalReferrals: 8,
  pendingReferrals: 2,
  completedReferrals: 6,
  totalEarned: 180,
  pendingReward: 60,
  rewardPerReferral: 30,
  nextMilestone: 10,
  milestoneReward: "Darmowe wydarzenie do 150 PLN",
};
