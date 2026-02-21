// Email preview API - for development/testing
// GET /api/email/preview?template=bookingApproved

import { NextRequest, NextResponse } from 'next/server';
import * as templates from '@/lib/email/templates';

// Sample data for previewing templates
const sampleData = {
  bookingRequestConfirmation: {
    guestName: 'Jan Kowalski',
    eventTitle: 'Włoska Kolacja u Ani - Toskańskie Smaki',
    eventDate: 'Sobota, 15 Lutego 2025',
    eventTime: '19:00',
    hostName: 'Anna Kowalska',
    ticketCount: 2,
    totalPrice: 300,
  },
  bookingApproved: {
    guestName: 'Jan Kowalski',
    eventTitle: 'Włoska Kolacja u Ani - Toskańskie Smaki',
    eventDate: 'Sobota, 15 Lutego 2025',
    eventTime: '19:00',
    eventDuration: 180,
    hostName: 'Anna Kowalska',
    hostPhone: '+48 123 456 789',
    fullAddress: 'ul. Ruska 46/3, 50-079 Wrocław',
    neighborhood: 'Stare Miasto, Wrocław',
    ticketCount: 2,
    totalPrice: 300,
    menuDescription: 'Antipasti misti, Pappardelle al ragù di cinghiale, Bistecca alla fiorentina (opcja wegetariańska dostępna), Tiramisu',
    dietaryOptions: ['Opcja wegetariańska', 'Bezglutenowe na życzenie'],
    whatToBring: 'Dobry humor i apetyt!',
    specialInstructions: 'Proszę przyjść 10 minut przed czasem. Wejście od podwórka.',
    paymentLink: 'https://seated.pl/pay/abc123',
  },
  bookingDeclined: {
    guestName: 'Jan Kowalski',
    eventTitle: 'Włoska Kolacja u Ani',
    eventDate: 'Sobota, 15 Lutego 2025',
    hostName: 'Anna Kowalska',
    reason: 'Niestety wszystkie miejsca zostały już zajęte przez wcześniejsze rezerwacje.',
  },
  eventReminder: {
    guestName: 'Jan Kowalski',
    eventTitle: 'Włoska Kolacja u Ani - Toskańskie Smaki',
    eventDate: 'Sobota, 15 Lutego 2025',
    eventTime: '19:00',
    fullAddress: 'ul. Ruska 46/3, 50-079 Wrocław',
    hostName: 'Anna Kowalska',
    hostPhone: '+48 123 456 789',
    hoursUntilEvent: 24,
  },
  newBookingRequest: {
    hostName: 'Anna Kowalska',
    guestName: 'Jan Kowalski',
    guestEmail: 'jan@example.com',
    eventTitle: 'Włoska Kolacja u Ani - Toskańskie Smaki',
    eventDate: 'Sobota, 15 Lutego 2025',
    ticketCount: 2,
    totalPrice: 300,
    dietaryInfo: 'Bez glutenu dla jednej osoby',
    specialRequests: 'Chcielibyśmy siedzieć przy oknie jeśli możliwe',
    dashboardLink: 'https://seated.pl/dashboard/host',
  },
  paymentConfirmedHost: {
    hostName: 'Anna Kowalska',
    guestName: 'Jan Kowalski',
    eventTitle: 'Włoska Kolacja u Ani - Toskańskie Smaki',
    eventDate: 'Sobota, 15 Lutego 2025',
    ticketCount: 2,
    totalPrice: 300,
    platformFee: 30,
    hostEarnings: 270,
  },
  bookingCancelledHost: {
    hostName: 'Anna Kowalska',
    guestName: 'Jan Kowalski',
    eventTitle: 'Włoska Kolacja u Ani',
    eventDate: 'Sobota, 15 Lutego 2025',
    ticketCount: 2,
    reason: 'Zmiana planów - wyjazd służbowy',
  },
  hostApplicationReceived: {
    hostName: 'Marta Wiśniewska',
    applicationId: 'APP-2025-0042',
  },
  hostApplicationApproved: {
    hostName: 'Marta Wiśniewska',
    dashboardLink: 'https://seated.pl/dashboard/host',
  },
  reportSubmittedConfirmation: {
    reporterName: 'Jan Kowalski',
    reportId: 'RPT-2025-0042',
    reportedEntityName: 'Anna Nowak',
    reportType: 'host',
    category: 'Nieodpowiednie zachowanie',
  },
  newReportNotificationAdmin: {
    reportId: 'RPT-2025-0042',
    reporterName: 'Jan Kowalski',
    reporterRole: 'guest',
    reportedEntityName: 'Anna Nowak',
    reportType: 'host',
    category: 'Nieodpowiednie zachowanie',
    description: 'Host zachowywał się nieodpowiednio podczas wydarzenia. Wielokrotnie komentował wygląd gości i zadawał niestosowne pytania osobiste.',
    adminDashboardLink: 'https://seated.pl/admin/reports/RPT-2025-0042',
  },
  reportResolved: {
    reporterName: 'Jan Kowalski',
    reportId: 'RPT-2025-0042',
    reportedEntityName: 'Anna Nowak',
    resolution: 'Ostrzeżenie wydane',
    adminMessage: 'Skontaktowaliśmy się z hostem i wyjaśniliśmy sytuację. Host zobowiązał się do zachowania profesjonalizmu w przyszłości.',
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const templateName = searchParams.get('template');
  const format = searchParams.get('format') || 'html';

  if (!templateName) {
    // Return list of available templates
    return NextResponse.json({
      availableTemplates: Object.keys(sampleData),
      usage: '/api/email/preview?template=bookingApproved&format=html|text',
    });
  }

  // Get the template function
  const templateFn = (templates as Record<string, Function>)[templateName];
  if (!templateFn) {
    return NextResponse.json(
      { error: `Template "${templateName}" not found` },
      { status: 404 }
    );
  }

  // Get sample data for this template
  const data = (sampleData as Record<string, object>)[templateName];
  if (!data) {
    return NextResponse.json(
      { error: `No sample data for template "${templateName}"` },
      { status: 404 }
    );
  }

  // Generate the email
  const email = templateFn(data);

  if (format === 'text') {
    return new NextResponse(email.text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  if (format === 'json') {
    return NextResponse.json(email);
  }

  // Default: return HTML
  return new NextResponse(email.html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
