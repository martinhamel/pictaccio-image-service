import { IsLocale } from 'class-validator';

export class SessionPostLangRequest {
    @IsLocale()
    lang: string;
}
