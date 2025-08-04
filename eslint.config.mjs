import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Relax TypeScript rules for better development experience
      "@typescript-eslint/no-explicit-any": "off", // Allow 'any' without any warnings
      "@typescript-eslint/no-unused-vars": "off", // Allow unused vars without warnings
      "@typescript-eslint/no-unused-imports": "off", // Allow unused imports
      
      // Relax React/Next.js rules
      "react/no-unescaped-entities": "off", // Allow unescaped entities
      "@next/next/no-img-element": "warn", // Allow img elements with warning
      
      // Allow console statements in development
      "no-console": "warn",
      
      // More flexible import rules
      "import/no-anonymous-default-export": "off",
    },
  },
];

export default eslintConfig;
