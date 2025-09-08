import { SafeString } from 'handlebars';
import { marked } from 'marked';

export default function mdToHtml(md: string): SafeString {
    const html = marked.parse(md, { async: false }) as string;
    return new SafeString(html);
}