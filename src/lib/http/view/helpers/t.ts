import { SLOT_T } from '../../../../lib/http/view/view';

export default function t(key: string, options): string {
    const t = options.data.root.__internals__[SLOT_T];

    return t(key, options.hash);
}
