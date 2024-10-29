import {
  formatIncompletePhoneNumber,
  isValidPhoneNumber,
  parseIncompletePhoneNumber,
  parsePhoneNumberWithError,
} from 'libphonenumber-js/max';
import { LastnameSchema } from 'src/zod.schema';
import { z } from 'zod';

function sanitizeEmail(email) {
  // Define regex for valid characters in the local part of the email
  const localPartRegex = /[^a-zA-Z0-9._%+-]/g;
  // Define regex for valid characters in the domain part of the email
  const domainPartRegex = /[^a-zA-Z0-9.-]/g;

  // Split the email into local and domain parts
  let [localPart, domainPart] = email.split('@');

  // Sanitize the local part
  localPart = localPart.replace(localPartRegex, '');

  // Sanitize the domain part if it exists
  if (domainPart) {
    domainPart = domainPart.replace(domainPartRegex, '');
  }

  // Reassemble the sanitized email
  return domainPart ? `${localPart}@${domainPart}` : localPart;
}

export const AthleteRepresentative = z.object({
  athleteRepresentativeId: z.number(),
  countryCode: z.string().nullable(),
  firstName: z.string(),
  lastName: LastnameSchema,
  email: z
    .array(z.string().nullable())
    .optional()
    .default([])
    .transform((val) => {
      if (val.length === 0) return null;
      return sanitizeEmail(val[0]) as string;
    }),
  mobile: z
    .array(z.string().nullable())
    .optional()
    .default([])
    .transform((val) => {
      if (val.length === 0) return null;
      if (!isValidPhoneNumber(val[0], 'US')) {
        if (isValidPhoneNumber(parseIncompletePhoneNumber(val[0]), 'US')) {
          val[0] = formatIncompletePhoneNumber(val[0]);
        } else {
          console.error('invalid phone number', val[0]);
          return null;
        }
      }
      try {
        const phoneNumber = parsePhoneNumberWithError(val[0], 'US');
        if (!phoneNumber) return null;
        return phoneNumber.formatInternational();
      } catch (error) {
        console.error('error parsing phone number', val[0]);
        return null;
      }
    }),
});
