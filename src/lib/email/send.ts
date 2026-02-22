// Email sending service using Resend
// To enable: npm install resend && add RESEND_API_KEY to .env

import { EmailTemplate } from './templates';

// Configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'Seated <noreply@seated.pl>';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

interface SendEmailOptions {
  to: string | string[];
  template: EmailTemplate;
  replyTo?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend
 * In development mode, logs to console instead of sending
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, template, replyTo } = options;

  // Development mode - log instead of sending
  if (IS_DEVELOPMENT || !RESEND_API_KEY) {
    console.log('\n📧 EMAIL (Development Mode)');
    console.log('━'.repeat(50));
    console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`);
    console.log(`Subject: ${template.subject}`);
    console.log(`Reply-To: ${replyTo || 'none'}`);
    console.log('━'.repeat(50));
    console.log('TEXT VERSION:');
    console.log(template.text);
    console.log('━'.repeat(50));
    console.log('\n');

    return {
      success: true,
      messageId: `dev-${Date.now()}`,
    };
  }

  // Production mode - send via Resend
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject: template.subject,
        html: template.html,
        text: template.text,
        reply_to: replyTo,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send multiple emails in batch
 */
export async function sendBatchEmails(
  emails: SendEmailOptions[]
): Promise<SendEmailResult[]> {
  const results = await Promise.all(emails.map(sendEmail));
  return results;
}

// ============================================
// EMAIL NOTIFICATION HELPERS
// ============================================

import * as templates from './templates';

/**
 * Notify guest about booking request confirmation
 */
export async function notifyGuestBookingRequested(data: {
  guestEmail: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  hostName: string;
  ticketCount: number;
  totalPrice: number;
}) {
  return sendEmail({
    to: data.guestEmail,
    template: templates.bookingRequestConfirmation({
      guestName: data.guestName,
      eventTitle: data.eventTitle,
      eventDate: data.eventDate,
      eventTime: data.eventTime,
      hostName: data.hostName,
      ticketCount: data.ticketCount,
      totalPrice: data.totalPrice,
    }),
  });
}

/**
 * Notify guest about booking approval (with full details)
 */
export async function notifyGuestBookingApproved(data: {
  guestEmail: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventDuration: number;
  hostName: string;
  hostPhone?: string;
  fullAddress: string;
  neighborhood: string;
  ticketCount: number;
  totalPrice: number;
  menuDescription: string;
  dietaryOptions: string[];
  whatToBring?: string;
  specialInstructions?: string;
  paymentLink?: string;
}) {
  return sendEmail({
    to: data.guestEmail,
    template: templates.bookingApproved(data),
  });
}

/**
 * Notify guest about booking decline
 */
export async function notifyGuestBookingDeclined(data: {
  guestEmail: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  hostName: string;
  reason?: string;
}) {
  return sendEmail({
    to: data.guestEmail,
    template: templates.bookingDeclined(data),
  });
}

/**
 * Send event reminder to guest
 */
export async function sendEventReminder(data: {
  guestEmail: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  fullAddress: string;
  hostName: string;
  hostPhone?: string;
  hoursUntilEvent: number;
}) {
  return sendEmail({
    to: data.guestEmail,
    template: templates.eventReminder(data),
  });
}

/**
 * Notify host about new booking request
 */
export async function notifyHostNewBooking(data: {
  hostEmail: string;
  hostName: string;
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  eventDate: string;
  ticketCount: number;
  totalPrice: number;
  dietaryInfo?: string;
  specialRequests?: string;
  dashboardLink: string;
}) {
  return sendEmail({
    to: data.hostEmail,
    template: templates.newBookingRequest(data),
  });
}

/**
 * Notify host about payment received
 */
export async function notifyHostPaymentReceived(data: {
  hostEmail: string;
  hostName: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  ticketCount: number;
  totalPrice: number;
  platformFee: number;
  hostEarnings: number;
}) {
  return sendEmail({
    to: data.hostEmail,
    template: templates.paymentConfirmedHost(data),
  });
}

/**
 * Notify host about booking cancellation
 */
export async function notifyHostBookingCancelled(data: {
  hostEmail: string;
  hostName: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  ticketCount: number;
  reason?: string;
}) {
  return sendEmail({
    to: data.hostEmail,
    template: templates.bookingCancelledHost(data),
  });
}

/**
 * Send host application confirmation
 */
export async function notifyHostApplicationReceived(data: {
  hostEmail: string;
  hostName: string;
  applicationId: string;
}) {
  return sendEmail({
    to: data.hostEmail,
    template: templates.hostApplicationReceived(data),
  });
}

/**
 * Notify about host application approval
 */
export async function notifyHostApplicationApproved(data: {
  hostEmail: string;
  hostName: string;
  dashboardLink: string;
}) {
  return sendEmail({
    to: data.hostEmail,
    template: templates.hostApplicationApproved(data),
  });
}

// ============================================
// EMAIL VERIFICATION
// ============================================

/**
 * Send email verification link after registration
 */
export async function notifyEmailVerification(data: {
  email: string;
  verifyUrl: string;
}) {
  return sendEmail({
    to: data.email,
    template: templates.emailVerification({
      verifyUrl: data.verifyUrl,
    }),
  });
}

// ============================================
// WAITLIST EMAIL NOTIFICATIONS
// ============================================

/**
 * Notify user they've been added to waitlist
 */
export async function notifyWaitlistJoined(data: {
  guestEmail: string;
  guestName?: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  hostName: string;
  position: number;
  ticketsWanted: number;
}) {
  return sendEmail({
    to: data.guestEmail,
    template: templates.waitlistJoined(data),
  });
}

/**
 * Notify waitlist user that a spot is available
 */
export async function notifyWaitlistSpotAvailable(data: {
  guestEmail: string;
  guestName?: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  hostName: string;
  availableSpots: number;
  price: number;
  bookingUrl: string;
  expiresAt: string;
}) {
  return sendEmail({
    to: data.guestEmail,
    template: templates.waitlistSpotAvailable(data),
  });
}

/**
 * Notify user their waitlist reservation has expired
 */
export async function notifyWaitlistExpired(data: {
  guestEmail: string;
  guestName?: string;
  eventTitle: string;
  eventDate: string;
}) {
  return sendEmail({
    to: data.guestEmail,
    template: templates.waitlistExpired(data),
  });
}
