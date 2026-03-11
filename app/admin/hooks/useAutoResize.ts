import { useEffect, useCallback, RefObject } from "react";

export function autoResizeElement(el: HTMLTextAreaElement | null, minHeight: number = 60) {
  if (el) {
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  }
}

export function useAutoResize(ref: RefObject<HTMLTextAreaElement | null>, value: string, minHeight: number = 60) {
  useEffect(() => {
    autoResizeElement(ref.current, minHeight);
  }, [value, minHeight, ref]);

  const onInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    autoResizeElement(e.target, minHeight);
  }, [minHeight]);

  return { onInput };
}
