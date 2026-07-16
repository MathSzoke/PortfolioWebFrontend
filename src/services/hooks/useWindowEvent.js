import { useEffect, useRef } from "react";

export function useWindowEvent(type, handler) {
    const ref = useRef(handler);
    ref.current = handler;
    useEffect(() => {
        const h = (e) => ref.current?.(e);
        window.addEventListener(type, h);
        return () => window.removeEventListener(type, h);
    }, [type]);
}
