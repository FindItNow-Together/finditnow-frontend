"use client";

import { useRef, useState } from "react";

export default function useDebounce(initial: string | number) {
  const [query, setQuery] = useState(initial);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const setDebounceQuery = (inputVal: typeof initial) => {
    clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      setQuery(inputVal);
    }, 300);
  };

  return { query, setDebounceQuery };
}
