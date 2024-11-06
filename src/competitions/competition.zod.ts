import { DateSchema, DisciplineNameSchema, FullnameSchema, GenderSchema, MarkSchema, PhoneSchema, PlaceSchema, UrlSlugIdSchema, VenueSchema } from 'src/zod.schema';
import { z } from 'zod';

export const CompetitionOrganiserInfoSchema = z.object({
  liveStreamingUrl: z.string().transform((val) => {
    return val === '' ? null : val;
  }),
  resultsPageUrl: z.string().transform((val) => {
    return val === '' ? null : val;
  }),
  websiteUrl: z.string().transform((val) => {
    return val === '' ? null : val;
  }),
  units: z.array(
    z.object({
      events: z.array(z.string()).transform(val => [...new Set(val)]),
      gender: GenderSchema,
    }),
  ),
  prizeMoney: z.array(
    z.object({
      gender: GenderSchema,
      prizes: z.array(z.string().transform(val => val.replace(',', '')).pipe(z.coerce.number())),
    }),
  ),
  contactPersons: z.array(
    z.object({
      email: z.string(),
      phoneNumber: PhoneSchema,
      title: z.string(),
      name: z.string(),
    }),
  ),
  additionalInfo: z.string().nullable(),
});

export const CompetitionSchema = z.object({
  id: z.number(),
  hasResults: z.boolean(),
  name: z.string(),
  venue: VenueSchema,
  area: z.string(),
  rankingCategory: z.string(),
  disciplines: z
    .string()
    .nullable()
    .transform((val) => {
      return val ? val.split(',').map((discipline) => discipline.trim()) : [];
    }),
  startDate: DateSchema,
  endDate: DateSchema,
  hasCompetitionInformation: z.boolean(),
  hasStartlist: z.boolean(),
  competitionGroup: z.string().nullable(),
  competitionSubgroup: z.string().nullable(),
});

export const CompetitionResultsSchema =  z.object({
  competition: z.object({
    venue: VenueSchema,
    name: z.string(),
  }),
  parameters: z.object({
    day: z.number().nullable(),
  }),
  eventTitles: z.array(
    z.object({
      rankingCategory: z.string(),
      eventTitle: z.string().nullable(),
      events: z.array(
        z.object({
          event: DisciplineNameSchema,
          eventId: z.coerce.number(),
          gender: GenderSchema,
          perResultWind: z.boolean(),
          withWind: z.boolean(),
          races: z.array(
            z.object({
              date: z.nullable(DateSchema),
              day: z.number().nullable(),
              race: z.string(),
              raceId: z.number(),
              raceNumber: z.number(),
              results: z.array(
                z.object({
                  competitor: z.object({
                    teamMembers: z
                      .array(
                        z.object({
                          id: z.number(),
                          name: FullnameSchema,
                          urlSlug: UrlSlugIdSchema,
                        }),
                      )
                      .nullable(),
                    name: FullnameSchema,
                    urlSlug: z.nullable(UrlSlugIdSchema),
                    birthDate: z.nullable(DateSchema),
                  }),
                  mark: MarkSchema,
                  nationality: z.string(),
                  place: PlaceSchema,
                  records: z.string().transform((val) => {
                    if (val === '') return [];
                    return val
                      .split(',')
                      .map((record) => record.trim());
                  }),
                  wind: z.coerce
                    .number()
                    .nullable()
                    .catch(() => null),
                }),
              ),
              wind: z.coerce
                .number()
                .nullable()
                .catch(() => null),
            }),
          ),
        }),
      ),
    }),
  ),
  options: z.object({
    days: z.array(
      z.object({
        date: DateSchema,
        day: z.number(),
      }),
    ),
    events: z.array(
      z.object({
        gender: GenderSchema,
        id: z.number(),
        name: DisciplineNameSchema,
        combined: z.boolean().nullable().transform((val) => {
          return val === null ? false : val;
        }),
      }),
    ),
  }),
});
