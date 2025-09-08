import { Session } from 'express-session';

export interface SessionInterface extends Session {
    lang: string;
}