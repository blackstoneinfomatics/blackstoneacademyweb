"use client";

import { ReactNode } from "react";
import Sidebar4 from "./Sidebar4";

interface Props {
  readonly children: ReactNode | ReactNode[];
}

const LAYOUT_CSS = `
  .layout-root {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    height: 100%;
    width: 100%;
  }

  .layout-sidebar {
    width: 220px;
    min-width: 220px;
    max-width: 220px;
    height: 100%;
  }

  .layout-main {
    min-width: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }

  .main-content-scroll-none {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .main-content-scroll-none::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 1279px) and (min-width: 768px) {
    .layout-grid {
      grid-template-columns: 200px minmax(0, 1fr);
    }
    .layout-sidebar {
      width: 200px;
      min-width: 200px;
      max-width: 200px;
    }
  }

  @media (max-width: 767px) {
    .layout-grid {
      grid-template-columns: 1fr;
    }
    .layout-sidebar {
      display: none;
    }
  }
`;

export default function BaseLayout4({ children }: Props) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LAYOUT_CSS }} />
      <style jsx global>{`
        .sidebar__wrapper {
          scrollbar-width: thin;
          scrollbar-color: #576cbc #012a4a;
        }
        .sidebar__wrapper::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar__wrapper::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar__wrapper::-webkit-scrollbar-thumb {
          background: #576cbc;
          border-radius: 8px;
        }
        .sidebar__wrapper::-webkit-scrollbar-thumb:hover {
          background: #8296e6;
        }
        .dark .sidebar__wrapper {
          scrollbar-color: #576cbc #1d1d1d;
        }
        .dark .sidebar__wrapper::-webkit-scrollbar-thumb {
          background: #576cbc;
        }
      `}</style>

      <div className="layout-root bg-[#E4E7F4] text-black dark:bg-[#252525] dark:text-white">
        <div className="layout-grid">
          <div className="layout-sidebar sidebar__wrapper hidden overflow-y-auto bg-[#012A4A] dark:bg-[#001E34] md:block">
          <Sidebar4 />
        </div>

          <div className="layout-main main-content-scroll-none overflow-y-auto px-4 py-2">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
