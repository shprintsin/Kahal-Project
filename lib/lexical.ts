import escapeHTML from 'escape-html';
import { remark } from 'remark';
import html from 'remark-html';

export function serializeLexical(node: any): string {
    if (!node) return '';

    // If it's a plain string (markdown or HTML), process it
    if (typeof node === 'string') {
        // Try to convert markdown to HTML
        try {
            const result = remark().use(html).processSync(node);
            return String(result);
        } catch {
            // If markdown processing fails, return as-is (might be HTML already)
            return node;
        }
    }

    // Handle root
    if (node.root && node.root.children) {
        return node.root.children.map((child: any) => serializeLexical(child)).join('');
    }

    // Handle array of children
    if (Array.isArray(node)) {
        return node.map((child: any) => serializeLexical(child)).join('');
    }

    // Handle specific Lexical types
    switch (node.type) {
        case 'paragraph':
            return `<p class="mb-4">${node.children ? node.children.map((c: any) => serializeLexical(c)).join('') : ''}</p>`;
        case 'heading':
            const Tag = node.tag as string; // 'h1', 'h2', etc.
            return `<${Tag} class="font-bold my-4">${node.children ? node.children.map((c: any) => serializeLexical(c)).join('') : ''}</${Tag}>`;
        case 'list':
            const ListTag = node.listType === 'number' ? 'ol' : 'ul';
            return `<${ListTag} class="list-disc ml-6 mb-4">${node.children ? node.children.map((c: any) => serializeLexical(c)).join('') : ''}</${ListTag}>`;
        case 'listitem':
            return `<li>${node.children ? node.children.map((c: any) => serializeLexical(c)).join('') : ''}</li>`;
        case 'quote':
            return `<blockquote class="border-l-4 pl-4 italic my-4">${node.children ? node.children.map((c: any) => serializeLexical(c)).join('') : ''}</blockquote>`;
        case 'code':
            return `<pre class="bg-gray-100 p-4 rounded my-4"><code>${node.children ? node.children.map((c: any) => serializeLexical(c)).join('') : ''}</code></pre>`;
        case 'link':
            return `<a href="${escapeHTML(node.url)}" class="text-blue-600 hover:underline" ${node.newTab ? 'target="_blank"' : ''}>${node.children ? node.children.map((c: any) => serializeLexical(c)).join('') : ''}</a>`;
        case 'text':
            let text = escapeHTML(node.text);
            if (node.format & 1) text = `<strong>${text}</strong>`; // Bold
            if (node.format & 2) text = `<em>${text}</em>`;     // Italic
            if (node.format & 8) text = `<u>${text}</u>`;       // Underline
            if (node.format & 16) text = `<code>${text}</code>`; // Code
            return text;
        default:
            // Generic fallback for unknown nodes with children
            if (node.children) {
                return node.children.map((c: any) => serializeLexical(c)).join('');
            }
            return '';
    }
}
