// Email module for Seated platform
//
// Usage:
// import { notifyGuestBookingApproved, notifyHostNewBooking } from '@/lib/email';
//
// To enable real email sending:
// 1. Install Resend: npm install resend
// 2. Add to .env.local: RESEND_API_KEY=your_key_here
// 3. Add to .env.local: EMAIL_FROM=Seated <noreply@yourdomain.com>
//
// In development mode, emails are logged to console instead of being sent.

export * from './send';
export * from './templates';

// Email types for Seated platform:
//
// GUEST EMAILS:
// 1. bookingRequestConfirmation - When guest submits booking request
// 2. bookingApproved - When host approves (includes full address!)
// 3. bookingDeclined - When host declines
// 4. eventReminder - 24h and 3h before event
//
// HOST EMAILS:
// 1. newBookingRequest - When guest requests booking
// 2. paymentConfirmedHost - When payment is received
// 3. bookingCancelledHost - When guest cancels
//
// SYSTEM EMAILS:
// 1. hostApplicationReceived - Confirmation of host application
// 2. hostApplicationApproved - Welcome to hosting!
