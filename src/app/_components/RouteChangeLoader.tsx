"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Loading from "../(super-admin)/super-admin/components/Loading";



export default function RouteChangeLoader() {
    const pathname = usePathname();
    const firstRender = useRef(true);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        setShow(true);

        // Keep it visible long enough to be seen, but not annoying
        const MIN_VISIBLE = 700; // ← tune this (ms)

        const timer = setTimeout(() => setShow(false), MIN_VISIBLE);
        return () => clearTimeout(timer);
    }, [pathname]);

    if (!show) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(228, 231, 244, 0.85)",
                backdropFilter: "blur(4px)",
                pointerEvents: "none",
                // Fade in/out for a smoother appearance
                animation: "bs-overlay-fade 200ms ease-out",
            }}
        >
            <style>{`
        @keyframes bs-overlay-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

            <Loading />
        </div>
    );
}