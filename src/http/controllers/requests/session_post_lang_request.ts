import { IsLocale } from '@loufa/class-validator';

export class SessionPostLangRequest {
    @IsLocale()
    lang: string;
}
