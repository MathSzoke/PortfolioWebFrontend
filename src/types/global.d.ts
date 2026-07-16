declare namespace JSX {
    interface IntrinsicElements {
        'chat-bubbles': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
            api?: string;
            'session-id'?: string;
        };
    }
}
