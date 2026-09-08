// 기존 목업의 SVG 경로를 사용하므로 별도의 HTML sprite가 필요하지 않습니다.
const paths = {
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  transfer: "M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  menu: "M4 6h16M4 12h16M4 18h16",
  chevron: "m9 5 7 7-7 7",
  save: "M12 3v13m-5-5 5 5 5-5M4 16v5h16v-5",
  plane: "m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13",
  "arrow-in": "M12 3v16m-6-6 6 6 6-6",
  "arrow-out": "M12 21V5m-6 6 6-6 6 6",
};

export default function Icon({ name, className = "" }) {
  return (
    <svg className={`icon ${className}`.trim()} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {name === "list" ? <>
        <rect x="5" y="3" width="14" height="18" rx="3" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </> : name === "grid" ? <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </> : name === "eye" ? <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </> : <path d={paths[name] ?? paths.menu} />}
    </svg>
  );
}
