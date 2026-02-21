"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Ticket,
  Plus,
  Percent,
  Banknote,
  Gift,
  Copy,
  Check,
  X,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import {
  getVouchers,
  createPromoVoucher,
  updateVoucherStatus,
  type Voucher,
  type VoucherStatus,
} from "@/lib/mock-data";

export default function AdminVouchersPage() {
  const t = useTranslations("admin.vouchers");

  const [vouchers, setVouchers] = useState<Voucher[]>(getVouchers());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New voucher form
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"percentage" | "fixed">("percentage");
  const [newValue, setNewValue] = useState("");
  const [newMinOrder, setNewMinOrder] = useState("");
  const [newMaxDiscount, setNewMaxDiscount] = useState("");
  const [newValidFrom, setNewValidFrom] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newValidUntil, setNewValidUntil] = useState("");
  const [newUsageLimit, setNewUsageLimit] = useState("");
  const [newDescPl, setNewDescPl] = useState("");

  const getStatusBadge = (status: VoucherStatus) => {
    const styles = {
      active: "bg-green-100 text-green-700",
      used: "bg-gray-100 text-gray-700",
      expired: "bg-red-100 text-red-700",
      disabled: "bg-yellow-100 text-yellow-700",
    };
    const labels = {
      active: t("statusActive"),
      used: t("statusUsed"),
      expired: t("statusExpired"),
      disabled: t("statusDisabled"),
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    if (type === "percentage") {
      return (
        <Badge variant="outline" className="gap-1">
          <Percent className="h-3 w-3" /> {t("percentage")}
        </Badge>
      );
    }
    if (type === "fixed") {
      return (
        <Badge variant="outline" className="gap-1">
          <Banknote className="h-3 w-3" /> {t("fixed")}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700 border-amber-200">
        <Gift className="h-3 w-3" /> {t("giftCard")}
      </Badge>
    );
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = (voucher: Voucher) => {
    const newStatus: VoucherStatus =
      voucher.status === "active" ? "disabled" : "active";
    updateVoucherStatus(voucher.id, newStatus);
    setVouchers(getVouchers());
  };

  const handleCreateVoucher = () => {
    if (!newCode || !newValue || !newValidUntil) return;

    createPromoVoucher({
      code: newCode,
      type: newType,
      value: newType === "percentage"
        ? parseFloat(newValue)
        : parseFloat(newValue) * 100,
      minOrderValue: newMinOrder ? parseFloat(newMinOrder) * 100 : undefined,
      maxDiscount: newMaxDiscount ? parseFloat(newMaxDiscount) * 100 : undefined,
      validFrom: new Date(newValidFrom),
      validUntil: new Date(newValidUntil),
      usageLimit: newUsageLimit ? parseInt(newUsageLimit) : undefined,
      descriptionPl: newDescPl,
    });

    setVouchers(getVouchers());
    setIsCreateOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewCode("");
    setNewType("percentage");
    setNewValue("");
    setNewMinOrder("");
    setNewMaxDiscount("");
    setNewValidFrom(new Date().toISOString().split("T")[0]);
    setNewValidUntil("");
    setNewUsageLimit("");
    setNewDescPl("");
  };

  // Stats
  const activeVouchers = vouchers.filter((v) => v.status === "active").length;
  const giftCards = vouchers.filter((v) => v.type === "gift_card").length;
  const totalUsage = vouchers.reduce((sum, v) => sum + v.usageCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-2" />
              {t("createVoucher")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("createVoucher")}</DialogTitle>
              <DialogDescription>{t("createVoucherDesc")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("code")}</Label>
                <Input
                  placeholder="np. LATO2025"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("type")}</Label>
                <RadioGroup
                  value={newType}
                  onValueChange={(v: "percentage" | "fixed") => setNewType(v)}
                  className="flex gap-4"
                >
                  <Label
                    htmlFor="new-percentage"
                    className={cn(
                      "flex items-center gap-2 p-3 border rounded-lg cursor-pointer",
                      newType === "percentage" && "border-amber-600 bg-amber-50"
                    )}
                  >
                    <RadioGroupItem value="percentage" id="new-percentage" />
                    <Percent className="h-4 w-4" />
                    {t("percentage")}
                  </Label>
                  <Label
                    htmlFor="new-fixed"
                    className={cn(
                      "flex items-center gap-2 p-3 border rounded-lg cursor-pointer",
                      newType === "fixed" && "border-amber-600 bg-amber-50"
                    )}
                  >
                    <RadioGroupItem value="fixed" id="new-fixed" />
                    <Banknote className="h-4 w-4" />
                    {t("fixed")}
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>{t("value")}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder={newType === "percentage" ? "10" : "25"}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">
                    {newType === "percentage" ? "%" : "PLN"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("minOrder")}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="50"
                      value={newMinOrder}
                      onChange={(e) => setNewMinOrder(e.target.value)}
                      className="w-20"
                    />
                    <span className="text-muted-foreground text-sm">PLN</span>
                  </div>
                </div>
                {newType === "percentage" && (
                  <div className="space-y-2">
                    <Label>{t("maxDiscount")}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="100"
                        value={newMaxDiscount}
                        onChange={(e) => setNewMaxDiscount(e.target.value)}
                        className="w-20"
                      />
                      <span className="text-muted-foreground text-sm">PLN</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("validFrom")}</Label>
                  <Input
                    type="date"
                    value={newValidFrom}
                    onChange={(e) => setNewValidFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("validUntil")}</Label>
                  <Input
                    type="date"
                    value={newValidUntil}
                    onChange={(e) => setNewValidUntil(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("usageLimit")}</Label>
                <Input
                  type="number"
                  placeholder={t("unlimited")}
                  value={newUsageLimit}
                  onChange={(e) => setNewUsageLimit(e.target.value)}
                  className="w-24"
                />
              </div>

              <div className="space-y-2">
                <Label>{t("description")}</Label>
                <Input
                  placeholder="np. Promocja letnia"
                  value={newDescPl}
                  onChange={(e) => setNewDescPl(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {t("cancel")}
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                onClick={handleCreateVoucher}
                disabled={!newCode || !newValue || !newValidUntil}
              >
                {t("create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeVouchers}</p>
                <p className="text-xs text-muted-foreground">{t("activeVouchers")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Gift className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{giftCards}</p>
                <p className="text-xs text-muted-foreground">{t("giftCards")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsage}</p>
                <p className="text-xs text-muted-foreground">{t("totalUsages")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vouchers List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("allVouchers")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vouchers.map((voucher) => (
              <div
                key={voucher.id}
                className={cn(
                  "p-4 border rounded-lg",
                  voucher.status !== "active" && "opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-lg font-mono font-bold bg-stone-100 px-3 py-1 rounded">
                        {voucher.code}
                      </code>
                      <button
                        onClick={() => copyCode(voucher.code)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copiedCode === voucher.code ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      {getTypeBadge(voucher.type)}
                      {getStatusBadge(voucher.status)}
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      {voucher.descriptionPl && (
                        <p>{voucher.descriptionPl}</p>
                      )}
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          {voucher.type === "percentage" ? (
                            <>
                              <Percent className="h-3 w-3" />
                              {voucher.value}%
                              {voucher.maxDiscount && (
                                <span className="text-xs">
                                  (max {formatPrice(voucher.maxDiscount)})
                                </span>
                              )}
                            </>
                          ) : voucher.type === "fixed" ? (
                            <>
                              <Banknote className="h-3 w-3" />
                              {formatPrice(voucher.value)}
                            </>
                          ) : (
                            <>
                              <Gift className="h-3 w-3" />
                              {formatPrice(voucher.value)}
                              {voucher.remainingValue !== undefined && (
                                <span className="text-xs">
                                  ({t("remaining")}: {formatPrice(voucher.remainingValue)})
                                </span>
                              )}
                            </>
                          )}
                        </span>
                        {voucher.minOrderValue && (
                          <span>
                            {t("minOrder")}: {formatPrice(voucher.minOrderValue)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(voucher.validUntil).toLocaleDateString("pl-PL")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {voucher.usageCount}
                          {voucher.usageLimit && `/${voucher.usageLimit}`} {t("uses")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(voucher)}
                    disabled={voucher.type === "gift_card" && voucher.status === "used"}
                  >
                    {voucher.status === "active" ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        {t("disable")}
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        {t("enable")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
