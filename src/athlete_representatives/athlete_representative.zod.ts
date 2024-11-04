import { parsePhoneNumber } from 'src/utils';
import { CountryCodeSchema, FirstnameSchema, LastnameSchema } from 'src/zod.schema';
import { z } from 'zod';

function sanitizeEmail(email: string): string {
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
  countryCode: z.nullable(CountryCodeSchema),
  firstName: FirstnameSchema,
  lastName: LastnameSchema,
  email: z
    .array(z.string().nullable())
    .optional()
    .default([])
    .transform((val) => {
      if (val.length === 0 || !val[0]) return null;
      return sanitizeEmail(val[0]) as string;
    }),
  mobile: z
    .array(z.string().nullable())
    .optional()
    .default([])
    .transform((val) => {
      if (val.length === 0 || !val[0]) return null;
      return parsePhoneNumber(val[0]);
    }),
});
