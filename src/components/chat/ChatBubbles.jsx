import { useMemo, useRef, useLayoutEffect } from "react";
import { makeStyles, tokens, mergeClasses } from "@fluentui/react-components";
import { useChatMessages } from "../../services/hooks/useChatMessages";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
    },

    row: { display: "flex" },
    rowRight: { justifyContent: "flex-end" },
    rowLeft: { justifyContent: "flex-start" },

    bubble: {
        maxWidth: "60%",
        padding: "10px 12px",
        borderRadius: "14px",
        fontSize: "14px",
        lineHeight: "1.4",
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
    },
    bubbleRight: {
        background: tokens.colorBrandBackground,
        color: "#fff",
        borderBottomRightRadius: "6px",
    },
    bubbleLeft: {
        background: "#39526f",
        color: "#fff",
        borderBottomLeftRadius: "6px",
    },

    thinking: {
        display: "inline-flex",
        gap: "6px",
        alignItems: "center",
    },
    dot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#fff",
        opacity: 0.7,
        animationName: "chatBlink",
        animationDuration: "1s",
        animationIterationCount: "infinite",
    },
    dot2: { animationDelay: "0.2s" },
    dot3: { animationDelay: "0.4s" },
});

export function ChatBubbles({ sessionId, meId, thinking = false }) {
    const s = useStyles();
    const apiBase = import.meta.env.VITE_PORTFOLIO_API || import.meta.env.VITE_API_BASE_URL;
    const msgs = useChatMessages(apiBase, sessionId, () => localStorage.getItem("authToken"));

    const items = useMemo(
        () => [...msgs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
        [msgs]
    );

    const tailRef = useRef(null);
    useLayoutEffect(() => {
        tailRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [items.length, thinking, sessionId]); 

    return (
        <div className={s.container}>
            {items.map((m) => {
                const right = m.senderUserId === meId;
                return (
                    <div key={m.id} className={mergeClasses(s.row, right ? s.rowRight : s.rowLeft)}>
                        <div className={mergeClasses(s.bubble, right ? s.bubbleRight : s.bubbleLeft)}>
                            {m.content}
                        </div>
                    </div>
                );
            })}

            {thinking && (
                <div className={mergeClasses(s.row, s.rowLeft)}>
                    <div className={mergeClasses(s.bubble, s.bubbleLeft)}>
                        <span className={s.thinking}>
                            <span className={s.dot} />
                            <span className={mergeClasses(s.dot, s.dot2)} />
                            <span className={mergeClasses(s.dot, s.dot3)} />
                        </span>
                    </div>
                </div>
            )}

            <div ref={tailRef} />
        </div>
    );
}
