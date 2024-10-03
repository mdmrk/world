import { fixupConfigRules, fixupPluginRules, includeIgnoreFile } from "@eslint/compat"
import { FlatCompat } from "@eslint/eslintrc"
import js from "@eslint/js"
import _import from "eslint-plugin-import"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, ".gitignore")
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [
  ...fixupConfigRules(
    compat.extends(
      "plugin:vue/vue3-essential",
      "eslint:recommended",
      "@vue/eslint-config-typescript",
      "@vue/eslint-config-prettier/skip-formatting"
    )
  ),
  includeIgnoreFile(gitignorePath),
  {
    plugins: {
      import: fixupPluginRules(_import)
    },

    languageOptions: {
      ecmaVersion: "latest"
    }
  }
]
