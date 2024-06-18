import { Injectable } from '@nestjs/common';

@Injectable()
export class CompetitionsService {
  findAll() {
    return `This action returns all competitions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} competition`;
  }

  remove(id: number) {
    return `This action removes a #${id} competition`;
  }
}
