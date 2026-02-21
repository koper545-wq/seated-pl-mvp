"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Gift,
  Mail,
  User,
  MessageSquare,
  CreditCard,
  Check,
  Sparkles,
  ChefHat,
  Heart,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { giftCardAmounts, createGiftCard } from "@/lib/mock-data";
import { Link } from "@/i18n/navigation";

export default function GiftCardsPage() {
  const t = useTranslations("giftCards");

  const [step, setStep] = useState<"select" | "details" | "success">("select");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  // Form fields
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState("");

  const finalAmount = isCustom
    ? Math.round(parseFloat(customAmount || "0") * 100)
    : selectedAmount;

  const isStep1Valid = finalAmount && finalAmount >= 5000; // min 50 PLN
  const isStep2Valid =
    recipientName.length >= 2 &&
    recipientEmail.includes("@") &&
    purchaserEmail.includes("@");

  const handleSubmit = async () => {
    if (!isStep2Valid || !finalAmount) return;

    setIsSubmitting(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create gift card
    const giftCard = createGiftCard({
      amount: finalAmount,
      purchaserEmail,
      recipientEmail,
      recipientName,
      personalMessage,
    });

    setGiftCardCode(giftCard.code);
    setIsSubmitting(false);
    setStep("success");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <Gift className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-semibold mb-2">{t("benefit1Title")}</h3>
            <p className="text-sm text-muted-foreground">{t("benefit1Desc")}</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-semibold mb-2">{t("benefit2Title")}</h3>
            <p className="text-sm text-muted-foreground">{t("benefit2Desc")}</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-semibold mb-2">{t("benefit3Title")}</h3>
            <p className="text-sm text-muted-foreground">{t("benefit3Desc")}</p>
          </div>
        </div>

        {/* Step 1: Select Amount */}
        {step === "select" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-600" />
                {t("selectAmount")}
              </CardTitle>
              <CardDescription>{t("selectAmountDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preset amounts */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {giftCardAmounts.map((amount) => (
                  <button
                    key={amount.value}
                    onClick={() => {
                      setSelectedAmount(amount.value);
                      setIsCustom(false);
                    }}
                    className={cn(
                      "p-4 border rounded-lg text-center transition-all",
                      selectedAmount === amount.value && !isCustom
                        ? "border-amber-600 bg-amber-50 ring-2 ring-amber-600"
                        : "hover:border-amber-300 hover:bg-amber-50/50"
                    )}
                  >
                    <p className="font-bold text-lg">{amount.label}</p>
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">{t("or")}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-2">
                <Label>{t("customAmount")}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="50"
                    max="1000"
                    step="10"
                    placeholder="np. 250"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setIsCustom(true);
                      setSelectedAmount(null);
                    }}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">PLN</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("minAmount")}
                </p>
              </div>

              {/* Preview */}
              {finalAmount && finalAmount >= 5000 && (
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-6 text-center">
                  <p className="text-sm text-amber-700 mb-2">{t("giftCardPreview")}</p>
                  <p className="text-4xl font-bold text-amber-800">
                    {formatPrice(finalAmount)}
                  </p>
                  <p className="text-sm text-amber-600 mt-2">
                    {t("validFor")}
                  </p>
                </div>
              )}

              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                size="lg"
                onClick={() => setStep("details")}
                disabled={!isStep1Valid}
              >
                {t("continue")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Recipient Details */}
        {step === "details" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-amber-600" />
                {t("recipientDetails")}
              </CardTitle>
              <CardDescription>{t("recipientDetailsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount reminder */}
              <div className="bg-amber-50 rounded-lg p-4 flex items-center justify-between">
                <span className="text-amber-700">{t("selectedAmount")}:</span>
                <span className="text-2xl font-bold text-amber-800">
                  {formatPrice(finalAmount!)}
                </span>
              </div>

              <Separator />

              {/* Recipient info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("recipientName")} *
                  </Label>
                  <Input
                    id="recipientName"
                    placeholder={t("recipientNamePlaceholder")}
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientEmail" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t("recipientEmail")} *
                  </Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    placeholder={t("recipientEmailPlaceholder")}
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("recipientEmailHint")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaserEmail" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t("yourEmail")} *
                  </Label>
                  <Input
                    id="purchaserEmail"
                    type="email"
                    placeholder={t("yourEmailPlaceholder")}
                    value={purchaserEmail}
                    onChange={(e) => setPurchaserEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("yourEmailHint")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {t("personalMessage")}
                  </Label>
                  <Textarea
                    id="message"
                    placeholder={t("personalMessagePlaceholder")}
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {personalMessage.length}/200
                  </p>
                </div>
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t("giftCardValue")}</span>
                  <span className="font-semibold">{formatPrice(finalAmount!)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>{t("total")}</span>
                  <span className="text-amber-600">{formatPrice(finalAmount!)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                  className="flex-1"
                >
                  {t("back")}
                </Button>
                <Button
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!isStep2Valid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {t("processing")}
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {t("payAndSend")}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <Card className="text-center">
            <CardContent className="pt-12 pb-8 space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-10 w-10 text-green-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-2">{t("successTitle")}</h2>
                <p className="text-muted-foreground">{t("successDesc")}</p>
              </div>

              <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-sm text-amber-700 mb-2">{t("giftCardCode")}</p>
                <p className="text-3xl font-mono font-bold text-amber-800 tracking-wider">
                  {giftCardCode}
                </p>
                <p className="text-2xl font-bold text-amber-700 mt-4">
                  {formatPrice(finalAmount!)}
                </p>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  {t("sentTo")}: <strong>{recipientEmail}</strong>
                </p>
                <p>
                  {t("for")}: <strong>{recipientName}</strong>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button asChild variant="outline">
                  <Link href="/events">{t("browseEvents")}</Link>
                </Button>
                <Button
                  asChild
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Link href="/gift-cards">{t("buyAnother")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it works */}
        {step === "select" && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-center mb-8">{t("howItWorks")}</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="text-center">
                  <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    {num}
                  </div>
                  <h3 className="font-semibold mb-1">{t(`step${num}Title`)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`step${num}Desc`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
