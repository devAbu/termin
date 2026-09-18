/**
 * Pure form-validation rules — no React, DOM or i18n, so they can be reused by the future mobile app
 * (docs/frontend.md). Validators return `null` when valid, or an error CODE the component maps to its
 * own translation key (first failing rule wins, matching the one-toast-at-a-time UI). `is*` predicates
 * return a boolean for forms that disable their submit button instead.
 *
 * These are frontend-only rules from the mock phase. When the backend resumes they must be synced
 * with the Laravel Form Requests (docs/backend.md) — see docs/PROGRESS.md §16.2.
 */

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_DISCOUNT_PERCENT = 1;
export const MAX_DISCOUNT_PERCENT = 90;
export const MIN_GUEST_NAME_LENGTH = 2;
export const MIN_PHONE_DIGITS = 8;
export const MAX_PHONE_DIGITS = 15;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS_PATTERN = /^\+?[\d\s\-()/.]+$/;

export function hasText(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

// Lenient on purpose (BiH local "061 234 567" and international "+387 61 234 567" both pass) —
// only checks allowed characters and digit count, not operator prefixes.
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!PHONE_CHARS_PATTERN.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "").length;
  return digits >= MIN_PHONE_DIGITS && digits <= MAX_PHONE_DIGITS;
}

/** Login/registration/invite identifier: an email OR a phone number. */
export function isValidContact(value: string): boolean {
  return isValidEmail(value) || isValidPhone(value);
}

export function isRatingSelected(rating: number): boolean {
  return rating > 0;
}

export type MissingFieldsError = "missingFields";
export type TermsError = "termsRequired";
export type NewPasswordError = MissingFieldsError | "passwordTooShort" | "passwordMismatch";
export type LoginError = MissingFieldsError | "invalidContact";
export type AccountError = MissingFieldsError | "invalidContact" | "passwordTooShort";
export type SalonBasicsError = MissingFieldsError | "invalidPhone";
export type ProfileError = "nameRequired" | "invalidEmail" | "invalidPhone";
export type ServiceEditError = "nameRequired" | "priceInvalid" | "discountInvalid";

// Passwords are deliberately NOT trimmed anywhere — whitespace can be part of a password.
export function validateLogin({ identifier, password }: { identifier: string; password: string }): LoginError | null {
  if (!hasText(identifier) || !password) return "missingFields";
  if (!isValidContact(identifier)) return "invalidContact";
  return null;
}

export function validateAccountFields({
  name,
  contact,
  password,
}: {
  name: string;
  contact: string;
  password: string;
}): AccountError | null {
  if (!hasText(name) || !hasText(contact) || !password) return "missingFields";
  if (!isValidContact(contact)) return "invalidContact";
  if (password.length < MIN_PASSWORD_LENGTH) return "passwordTooShort";
  return null;
}

export function validateSalonBasics({
  name,
  address,
  phone,
}: {
  name: string;
  address: string;
  phone: string;
}): SalonBasicsError | null {
  if (!hasText(name) || !hasText(address) || !hasText(phone)) return "missingFields";
  if (!isValidPhone(phone)) return "invalidPhone";
  return null;
}

export function validateTermsAccepted(accepted: boolean): TermsError | null {
  return accepted ? null : "termsRequired";
}

/** Phone is optional on the profile (User.phone is nullable) but must be valid when given. */
export function validateProfile({ name, email, phone }: { name: string; email: string; phone: string }): ProfileError | null {
  if (!hasText(name)) return "nameRequired";
  if (!isValidEmail(email)) return "invalidEmail";
  if (hasText(phone) && !isValidPhone(phone)) return "invalidPhone";
  return null;
}

export function validateNewPassword({
  password,
  confirmPassword,
}: {
  password: string;
  confirmPassword: string;
}): NewPasswordError | null {
  if (!password || !confirmPassword) return "missingFields";
  if (password.length < MIN_PASSWORD_LENGTH) return "passwordTooShort";
  if (password !== confirmPassword) return "passwordMismatch";
  return null;
}

export function validatePasswordChange({
  currentPassword,
  newPassword,
  confirmPassword,
}: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): NewPasswordError | null {
  if (!currentPassword) return "missingFields";
  return validateNewPassword({ password: newPassword, confirmPassword });
}

export function validateServiceEdit({
  name,
  price,
  discountOn,
  discountPercent,
}: {
  name: string;
  price: number;
  discountOn: boolean;
  discountPercent: number;
}): ServiceEditError | null {
  if (!hasText(name)) return "nameRequired";
  if (!Number.isFinite(price) || price <= 0) return "priceInvalid";
  if (discountOn && (!Number.isFinite(discountPercent) || discountPercent < MIN_DISCOUNT_PERCENT || discountPercent > MAX_DISCOUNT_PERCENT)) {
    return "discountInvalid";
  }
  return null;
}

/** Parses a typed price, accepting the Bosnian decimal comma ("25,5"). `NaN` when empty or not a number. */
export function parsePriceInput(value: string): number {
  const normalized = value.trim().replace(",", ".");
  return normalized === "" ? NaN : Number(normalized);
}

/** A price typed as text (empty string = not entered) must be a positive number. */
export function isValidPriceInput(value: string): boolean {
  const amount = parsePriceInput(value);
  return Number.isFinite(amount) && amount > 0;
}

export function isServiceDraftValid({ name, price }: { name: string; price: string }): boolean {
  return hasText(name) && isValidPriceInput(price);
}

/** Staff email is optional in the salon-setup draft but must be valid when given. */
export function isStaffDraftValid({ name, email }: { name: string; email: string }): boolean {
  return hasText(name) && (!hasText(email) || isValidEmail(email));
}

export function isValidGuestName(name: string): boolean {
  return name.trim().length >= MIN_GUEST_NAME_LENGTH;
}

export function isGuestClientValid({ name, phone }: { name: string; phone: string }): boolean {
  return isValidGuestName(name) && isValidPhone(phone);
}

export function isGuestBookingDetailsValid({ name, phone, email }: { name: string; phone: string; email: string }): boolean {
  return isGuestClientValid({ name, phone }) && isValidEmail(email);
}

export function isWorkerInviteValid({ name, contact }: { name: string; contact: string }): boolean {
  return hasText(name) && isValidContact(contact);
}
