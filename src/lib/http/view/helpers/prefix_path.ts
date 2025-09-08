import { join } from 'path';
import { Container } from 'typedi';
import { ConfigSchema } from '../../../../core/config_schema';

type PathKind =
    'img' |
    'script' |
    'css';

const config = Container.get<ConfigSchema>('config');
const prefixes = {
    css: config.server.dirs.public.css,
    img: config.server.dirs.public.img,
    script: config.server.dirs.public.script
}

export default function prefixPath(kind: PathKind, path: string): string {
    return join(prefixes[kind], path);
}
