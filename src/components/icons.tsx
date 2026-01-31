import type { SVGProps } from "react";

export const Icons = {
  logo: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`relative ${className}`} {...props}>
      <img
        src="/logo.png"
        alt="QuizWhiz Logo"
        className="object-contain w-full h-full"
      />
    </div>
  ),
};
