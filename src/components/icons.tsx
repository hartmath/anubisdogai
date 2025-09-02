import type { SVGProps } from "react";

export const AnubisIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M13 1.5L13 6" />
    <path d="M11 1.5L11 6" />
    <path d="M18.8 9C19.8 8.6 21 8.8 21.6 9.8C22.2 10.8 22 12 21 12.4L18.8 13.2" />
    <path d="M5.2 9C4.2 8.6 3 8.8 2.4 9.8C1.8 10.8 2 12 3 12.4L5.2 13.2" />
    <path d="M12 8C8 8 6 13.2 6 15.6C6 19.3333 8.66667 22 12 22C15.3333 22 18 19.3333 18 15.6C18 13.2 16 8 12 8Z" />
  </svg>
);

export const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="32" height="32" rx="8" fill="hsl(var(--primary))"/>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="18" fontWeight="bold" fontFamily="Space Grotesk">
            A
        </text>
    </svg>
);
