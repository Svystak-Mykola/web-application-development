import { Injectable, Scope } from '@nestjs/common';
import { randomUUID } from 'crypto';
@Injectable({ scope: Scope.REQUEST })
export class RequestIdService { readonly id = randomUUID(); }
