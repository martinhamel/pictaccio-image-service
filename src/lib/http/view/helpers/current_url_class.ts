import { SLOT_URL } from '../../../../lib/http/view/view';

export default function currentUrlClass(url: string, className: string, options): string {
    const internalUrl = options.data.root.__internals__[SLOT_URL];

    return internalUrl.url === url
        ? className
        : '';
}
