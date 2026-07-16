function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function renderMarkdown(value) {
    return escapeHtml(value)
        .replace(/^### (.*)$/gm, '<strong>$1</strong>')
        .replace(/^## (.*)$/gm, '<strong>$1</strong>')
        .replace(/^# (.*)$/gm, '<strong>$1</strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

export default function MarkdownText({ children, size = 200 }) {
    const fontSize = size === 200 ? '12px' : '14px';

    return (
        <span
            style={{ fontSize, lineHeight: 1.35 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(children) }}
        />
    );
}
