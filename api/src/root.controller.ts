import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get()
  root(): { ok: true } {
    return { ok: true };
  }
}
