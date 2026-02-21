"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Flag,
  CheckCircle,
  Loader2,
  AlertTriangle,
  ShieldAlert
} from "lucide-react";
import {
  ReportType,
  ReportCategory,
  reportCategoryLabels,
  guestReportCategories,
  hostReportCategories,
  addReport,
} from "@/lib/mock-data";

interface ReportDialogProps {
  // What type of entity is being reported
  reportType: ReportType;
  // The entity being reported (event, host, or guest)
  reportedEntityId: string;
  reportedEntityName: string;
  // Optional event context (for guest reports)
  eventId?: string;
  eventTitle?: string;
  bookingId?: string;
  // Reporter info (will come from auth context in real app)
  reporterRole: "guest" | "host";
  // Custom trigger button
  trigger?: React.ReactNode;
}

export function ReportDialog({
  reportType,
  reportedEntityId,
  reportedEntityName,
  eventId,
  eventTitle,
  bookingId,
  reporterRole,
  trigger,
}: ReportDialogProps) {
  const t = useTranslations("reports");
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ReportCategory | "">("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  // Get available categories based on reporter role
  const availableCategories = reporterRole === "host"
    ? hostReportCategories
    : guestReportCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description.trim()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add report to mock data
      const newReport = addReport({
        type: reportType,
        category: category as ReportCategory,
        status: "pending",
        reporterId: "current-user-id", // Would come from auth
        reporterName: "Jan Kowalski", // Would come from auth
        reporterEmail: "jan@example.com", // Would come from auth
        reporterRole,
        reportedEntityId,
        reportedEntityName,
        eventId,
        eventTitle,
        bookingId,
        description: description.trim(),
        evidence: evidence.trim() ? [evidence.trim()] : undefined,
      });

      setReportId(newReport.id);
      setIsSuccess(true);
    } catch {
      // Handle error
      console.error("Failed to submit report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset state after animation
    setTimeout(() => {
      setCategory("");
      setDescription("");
      setEvidence("");
      setIsSuccess(false);
      setReportId(null);
    }, 300);
  };

  const getDialogTitle = () => {
    switch (reportType) {
      case "event":
        return t("reportEvent");
      case "host":
        return t("reportHost");
      case "guest":
        return t("reportGuest");
      default:
        return t("submitReport");
    }
  };

  const getDialogDescription = () => {
    switch (reportType) {
      case "event":
        return t("reportEventDescription");
      case "host":
        return t("reportHostDescription");
      case "guest":
        return t("reportGuestDescription");
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-600">
            <Flag className="h-4 w-4 mr-1" />
            {t("report")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                {getDialogTitle()}
              </DialogTitle>
              <DialogDescription>
                {getDialogDescription()}
              </DialogDescription>
            </DialogHeader>

            {/* Entity info */}
            <div className="bg-muted/50 rounded-lg p-3 mt-2">
              <p className="font-medium text-sm">{reportedEntityName}</p>
              {eventTitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t("relatedToEvent")}: {eventTitle}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="report-category">{t("category")} *</Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as ReportCategory)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="report-category">
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {reportCategoryLabels[cat].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="report-description">{t("description")} *</Label>
                <Textarea
                  id="report-description"
                  placeholder={t("descriptionPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={isLoading}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {t("descriptionHint")}
                </p>
              </div>

              {/* Evidence (optional) */}
              <div className="space-y-2">
                <Label htmlFor="report-evidence">
                  {t("evidence")}{" "}
                  <span className="text-muted-foreground text-xs">({t("optional")})</span>
                </Label>
                <Input
                  id="report-evidence"
                  type="url"
                  placeholder={t("evidencePlaceholder")}
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {t("evidenceHint")}
                </p>
              </div>

              {/* Warning about false reports */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-50 p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                <span>{t("falseReportWarning")}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={isLoading || !category || !description.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("submitting")}
                    </>
                  ) : (
                    t("submit")
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{t("reportSubmitted")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("reportSubmittedDescription")}
              </p>

              {reportId && (
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-muted-foreground">
                    {t("reportId")}: <strong>{reportId}</strong>
                  </p>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1 text-left">
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  {t("reviewPromise")}
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  {t("notificationPromise")}
                </p>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              {t("close")}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
