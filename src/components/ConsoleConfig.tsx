'use client';

import { useEffect } from 'react';

export default function ConsoleConfig() {
    useEffect(() => {
        if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
            const noOp = () => { };

            console.log = noOp;
            console.info = noOp;
            console.warn = noOp;
            console.error = noOp;
            console.debug = noOp;
            console.trace = noOp;
            console.group = noOp;
            console.groupCollapsed = noOp;
            console.groupEnd = noOp;
        }
    }, []);

    return null;
}
