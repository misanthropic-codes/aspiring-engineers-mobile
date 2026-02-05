/**
 * Counselling Types - Aspiring Engineers Mobile
 * 
 * TypeScript interfaces for all counselling-related data structures.
 * Ported from test-portal-client counselling.service.ts
 */

/**
 * User's enrolled counselling package
 */
export interface CounsellingEnrollment {
  _id: string;
  userId: string;
  packageId?: {
    _id: string;
    name: string;
    slug: string;
    examType: string;
    description: string;
    shortDescription: string;
    price: number;
    discountPrice: number;
    validityDays: number;
    maxSessions: number;
    sessionDuration: number;
  };
  packageSnapshot: {
    name: string;
    examType: string;
    maxSessions: number;
  };
  sessionsUsed: number;
  sessionsRemaining: number;
  status: 'active' | 'expired' | 'cancelled' | 'refunded';
  paymentId: string;
  amountPaid: number;
  enrolledAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Counselling session details
 */
export interface CounsellingSession {
  _id: string;
  enrollment: string | CounsellingEnrollment;
  user: string;
  preferredDate: string;
  preferredTimeSlot: string;
  agenda: string;
  meetingPreference: 'google_meet' | 'zoom';
  status: SessionStatus;
  meetingLink?: string;
  scheduledDate?: string;
  counsellor?: {
    _id: string;
    name: string;
    email: string;
    title: string;
  };
  counsellorId?: CounsellorRef | string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type SessionStatus = 
  | 'pending_assignment' 
  | 'scheduled' 
  | 'confirmed' 
  | 'completed' 
  | 'cancelled' 
  | 'no-show';

export interface CounsellorRef {
  _id: string;
  name: string;
  email: string;
  title: string;
  image?: string;
}

/**
 * Payload for booking a new session
 */
export interface BookSessionPayload {
  enrollmentId: string;
  preferredDate: string;
  preferredTimeSlot: string;
  agenda: string;
  meetingPreference: 'google_meet' | 'zoom';
}

/**
 * Query parameters for fetching sessions
 */
export interface GetSessionsParams {
  status?: SessionStatus;
  limit?: number;
  page?: number;
}

/**
 * Counsellor profile data
 */
export interface Counsellor {
  _id: string;
  name: string;
  image: string;
  specialization: string;
  experience: number;
  rating: number;
  totalSessions: number;
  about: string;
}

/**
 * Payload for submitting a session review
 */
export interface ReviewPayload {
  sessionId: string;
  counsellorId: string;
  rating: number;
  review: string;
}

/**
 * Available time slots for booking
 */
export const TIME_SLOTS = [
  '09:00-09:30',
  '09:30-10:00',
  '10:00-10:30',
  '10:30-11:00',
  '11:00-11:30',
  '11:30-12:00',
  '12:00-12:30',
  '12:30-13:00',
  '14:00-14:30',
  '14:30-15:00',
  '15:00-15:30',
  '15:30-16:00',
  '16:00-16:30',
  '16:30-17:00',
  '17:00-17:30',
  '17:30-18:00',
] as const;

export type TimeSlot = typeof TIME_SLOTS[number];
