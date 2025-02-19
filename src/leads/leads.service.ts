import { Injectable } from '@nestjs/common';
import { Sex } from 'src/athletes/athlete.dto';
import { isTechnical } from 'src/discipline.utils';
import { performanceToFloat } from 'src/performance-conversion';
import { PrismaService } from 'src/prisma.service';
import { Record } from 'src/records/record.dto';
import { extractName } from 'src/utils';

@Injectable()
export class LeadsService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async find({
    ageGroup,
    sex,
    leadType,
    disciplineCode,
    region,
    year,
  }: {
    ageGroup: string;
    sex: "M" | "W" | "X";
    leadType: "AL" | "WL" | "NL";
    disciplineCode: string;
    region: string | null;
    year: number;
  }): Promise<Record[]> {
    console.log(year)
    const leads: Record[] = [];
    const leadsTs = await this.prisma.leads.findMany({
      where: {
        ageCategory: ageGroup,
        discipline: disciplineCode,
        recordType: leadType,
        region,
        sex,
        date: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year+1}-01-01`)
        }
      },
      orderBy: {
        rank: 'asc'
      },
    });
    leadsTs.forEach((lead) => {
      let firstname = null;
      let lastname = null;
      if(lead.worldathleticsId){
        const extractedName = extractName(lead.name);
        if(!extractedName){
          console.log('Could not extract name from', lead.name);
          return;
        }
        firstname = extractedName.firstname;
        lastname = extractedName.lastname
      }
      
      const technical = isTechnical({
        disciplineCode,
        performance: lead.result,
      });
      leads.push({
        place: lead.rank,
        date: new Date(lead.date),
        disciplineCode: lead.discipline,
        athletes:  lead.worldathleticsId && firstname && lastname ? [
          {
            firstname,
            lastname,
            birthdate: null,
            country: lead.nation,
            sex: lead.sex as Sex,
            id: lead.worldathleticsId
          }] : [],
        mark: lead.result,
        country: lead.nation,
        discipline: lead.discipline,
        performanceValue: performanceToFloat({
          performance: lead.result,
          technical
        }),
        sex: lead.sex as Sex,
        wind: lead.wind,
        isTechnical: technical,
        location: {
          country: lead.venueCountry,
          city: lead.venueCity,
          indoor: lead.environment === "Indoor",
          stadium: lead.venue
        }
      });
    });
    return leads;
  }

}
