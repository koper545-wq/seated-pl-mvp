"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { useTranslations } from "next-intl";
import {
  mockReports,
  reportCategoryLabels,
  reportStatusLabels,
  updateReportStatus,
  Report,
  ReportStatus,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Flag,
  MessageSquare,
  Shield,
  User,
  Users,
  XCircle,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

const resolutionOptions = [
  { value: "warning_issued", label: "Ostrzeżenie wydane", icon: "⚠️" },
  { value: "account_suspended", label: "Konto zawieszone", icon: "🚫" },
  { value: "refund_issued", label: "Zwrot wydany", icon: "💰" },
  { value: "no_action", label: "Brak działania", icon: "✓" },
  { value: "escalated", label: "Eskalowane", icon: "⬆️" },
];

export default function AdminReportsPage() {
  const t = useTranslations("reports.admin");
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedResolution, setSelectedResolution] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Separate reports by status
  const pendingReports = reports.filter((r) => r.status === "pending");
  const underReviewReports = reports.filter((r) => r.status === "under_review");
  const resolvedReports = reports.filter((r) => r.status === "resolved");
  const dismissedReports = reports.filter((r) => r.status === "dismissed");

  const getTypeIcon = (type: Report["type"]) => {
    switch (type) {
      case "event":
        return <Calendar className="h-4 w-4" />;
      case "host":
        return <User className="h-4 w-4" />;
      case "guest":
        return <Users className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: Report["type"]) => {
    switch (type) {
      case "event":
        return "Wydarzenie";
      case "host":
        return "Host";
      case "guest":
        return "Gość";
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || "");
    setSelectedResolution(report.resolution || "");
    setIsDialogOpen(true);
  };

  const handleStatusChange = (reportId: string, newStatus: ReportStatus) => {
    const updatedReport = updateReportStatus(
      reportId,
      newStatus,
      adminNotes || undefined,
      selectedResolution as Report["resolution"] || undefined
    );

    if (updatedReport) {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? updatedReport : r))
      );
    }
  };

  const handleResolve = () => {
    if (selectedReport && selectedResolution) {
      handleStatusChange(selectedReport.id, "resolved");
      setIsDialogOpen(false);
      setSelectedReport(null);
    }
  };

  const handleDismiss = () => {
    if (selectedReport) {
      handleStatusChange(selectedReport.id, "dismissed");
      setIsDialogOpen(false);
      setSelectedReport(null);
    }
  };

  const handleStartReview = (reportId: string) => {
    handleStatusChange(reportId, "under_review");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 flex items-center gap-3">
          <Shield className="h-8 w-8 text-red-600" />
          {t("title")}
        </h1>
        <p className="text-stone-500 mt-1">{t("subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {pendingReports.length}
            </p>
            <p className="text-xs text-muted-foreground">{t("pending")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {underReviewReports.length}
            </p>
            <p className="text-xs text-muted-foreground">{t("underReview")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {resolvedReports.length}
            </p>
            <p className="text-xs text-muted-foreground">{t("resolved")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-600">
              {dismissedReports.length}
            </p>
            <p className="text-xs text-muted-foreground">{t("dismissed")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t("pending")}
            {pendingReports.length > 0 && (
              <Badge className="bg-yellow-500">{pendingReports.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="under_review" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {t("underReview")}
            {underReviewReports.length > 0 && (
              <Badge className="bg-blue-500">{underReviewReports.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {t("resolved")}
          </TabsTrigger>
          <TabsTrigger value="dismissed" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            {t("dismissed")}
          </TabsTrigger>
        </TabsList>

        {/* Pending */}
        <TabsContent value="pending" className="space-y-3">
          {pendingReports.length > 0 ? (
            pendingReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onView={() => handleViewReport(report)}
                onStartReview={() => handleStartReview(report.id)}
              />
            ))
          ) : (
            <EmptyState message="Brak oczekujących zgłoszeń" />
          )}
        </TabsContent>

        {/* Under Review */}
        <TabsContent value="under_review" className="space-y-3">
          {underReviewReports.length > 0 ? (
            underReviewReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onView={() => handleViewReport(report)}
              />
            ))
          ) : (
            <EmptyState message="Brak zgłoszeń w trakcie przeglądu" />
          )}
        </TabsContent>

        {/* Resolved */}
        <TabsContent value="resolved" className="space-y-3">
          {resolvedReports.length > 0 ? (
            resolvedReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onView={() => handleViewReport(report)}
              />
            ))
          ) : (
            <EmptyState message="Brak rozwiązanych zgłoszeń" />
          )}
        </TabsContent>

        {/* Dismissed */}
        <TabsContent value="dismissed" className="space-y-3">
          {dismissedReports.length > 0 ? (
            dismissedReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onView={() => handleViewReport(report)}
              />
            ))
          ) : (
            <EmptyState message="Brak odrzuconych zgłoszeń" />
          )}
        </TabsContent>
      </Tabs>

      {/* Report details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-red-600" />
                  Zgłoszenie #{selectedReport.id}
                </DialogTitle>
                <DialogDescription>
                  {format(selectedReport.createdAt, "d MMMM yyyy, HH:mm", {
                    locale: pl,
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Type and category */}
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getTypeIcon(selectedReport.type)}
                    {getTypeLabel(selectedReport.type)}
                  </Badge>
                  <Badge
                    className={cn(
                      reportStatusLabels[selectedReport.status].color
                    )}
                  >
                    {reportStatusLabels[selectedReport.status].label}
                  </Badge>
                </div>

                {/* Reporter info */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Zgłaszający
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials(selectedReport.reporterName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {selectedReport.reporterName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedReport.reporterEmail}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        {selectedReport.reporterRole === "host"
                          ? "Host"
                          : "Gość"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Reported entity */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Zgłoszony
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-medium">
                      {selectedReport.reportedEntityName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reportCategoryLabels[selectedReport.category].label}
                    </p>
                    {selectedReport.eventTitle && (
                      <p className="text-sm">
                        Dotyczy wydarzenia:{" "}
                        <Link
                          href={`/events/${selectedReport.eventId}`}
                          className="text-amber-600 hover:underline inline-flex items-center gap-1"
                        >
                          {selectedReport.eventTitle}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Opis problemu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedReport.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Evidence */}
                {selectedReport.evidence &&
                  selectedReport.evidence.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Dowody</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {selectedReport.evidence.map((url, index) => (
                            <li key={index}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-amber-600 hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                <Separator />

                {/* Admin notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Notatki administratora
                  </label>
                  <Textarea
                    placeholder="Dodaj notatki o tym zgłoszeniu..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    disabled={
                      selectedReport.status === "resolved" ||
                      selectedReport.status === "dismissed"
                    }
                  />
                </div>

                {/* Resolution */}
                {(selectedReport.status === "under_review" ||
                  selectedReport.status === "resolved") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rozwiązanie</label>
                    <Select
                      value={selectedResolution}
                      onValueChange={setSelectedResolution}
                      disabled={selectedReport.status === "resolved"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz rozwiązanie" />
                      </SelectTrigger>
                      <SelectContent>
                        {resolutionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              <span>{option.icon}</span>
                              {option.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-2">
                {selectedReport.status === "pending" && (
                  <Button
                    variant="outline"
                    onClick={() => handleStartReview(selectedReport.id)}
                  >
                    Rozpocznij przegląd
                  </Button>
                )}
                {selectedReport.status === "under_review" && (
                  <>
                    <Button variant="outline" onClick={handleDismiss}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Odrzuć
                    </Button>
                    <Button
                      onClick={handleResolve}
                      disabled={!selectedResolution}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Rozwiąż
                    </Button>
                  </>
                )}
                {(selectedReport.status === "resolved" ||
                  selectedReport.status === "dismissed") && (
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Zamknij
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Report card component
function ReportCard({
  report,
  onView,
  onStartReview,
}: {
  report: Report;
  onView: () => void;
  onStartReview?: () => void;
}) {
  const statusInfo = reportStatusLabels[report.status];

  const getTypeIcon = (type: Report["type"]) => {
    switch (type) {
      case "event":
        return <Calendar className="h-4 w-4" />;
      case "host":
        return <User className="h-4 w-4" />;
      case "guest":
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <Flag className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-semibold truncate">
                {report.reportedEntityName}
              </h4>
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                {getTypeIcon(report.type)}
                {report.type === "event"
                  ? "Wydarzenie"
                  : report.type === "host"
                  ? "Host"
                  : "Gość"}
              </Badge>
              <Badge className={cn(statusInfo.color, "text-xs")}>
                {statusInfo.label}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {reportCategoryLabels[report.category].label}
            </p>

            <p className="text-sm line-clamp-2 mb-2">{report.description}</p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                Zgłaszający: {report.reporterName} ({report.reporterRole})
              </span>
              <span>•</span>
              <span>
                {format(report.createdAt, "d MMM yyyy, HH:mm", { locale: pl })}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button size="sm" variant="outline" onClick={onView}>
              <Eye className="h-4 w-4 mr-1" />
              Szczegóły
            </Button>
            {report.status === "pending" && onStartReview && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={onStartReview}
              >
                Rozpocznij
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty state component
function EmptyState({ message }: { message: string }) {
  return (
    <Card className="p-8 text-center">
      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </Card>
  );
}
