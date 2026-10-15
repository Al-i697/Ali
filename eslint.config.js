// إعداد ESLint (صيغة flat). الهدف: التقاط الأخطاء الحقيقية وفرض حدود المعمارية، لا فرض الذوق (التنسيق لـ Prettier).
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const webToServer = {
  group: ['**/server/**', '**/server'],
  message: 'الواجهة لا تستورد من الخادم. ضع المشترك في src/shared.',
};
const serverToWeb = {
  group: ['**/web/**', '**/web', '@/*'],
  message: 'الخادم لا يستورد من الواجهة. ضع المشترك في src/shared.',
};

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'data/**', 'e2e-output/**', 'src/server/db/migrations/**', 'coverage/**'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    rules: {
      // وعود تُترك بلا انتظار هي أكثر أسباب فقدان البيانات الصامت — نمنعها ما لم تُسبق بـ void صراحةً
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },

  // ───────── حدود المعمارية ─────────
  { files: ['src/web/**/*.{ts,tsx}'], rules: { 'no-restricted-imports': ['error', { patterns: [webToServer] }] } },
  { files: ['src/server/**/*.ts'], rules: { 'no-restricted-imports': ['error', { patterns: [serverToWeb] }] } },
  {
    files: ['src/shared/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [webToServer, serverToWeb, { group: ['node:*', 'fs', 'path'], message: 'src/shared يعمل في المتصفح والخادم معًا: لا اعتماد على Node.' }] },
      ],
    },
  },

  // ───────── الواجهة: قواعد React ─────────
  {
    files: ['src/web/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // ───────── السكربتات وملفات الإعداد (Node، بلا أنواع صارمة) ─────────
  {
    files: ['scripts/**/*.{mjs,ts}', '*.config.{js,ts}'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly', fetch: 'readonly', URL: 'readonly', setTimeout: 'readonly', document: 'readonly', window: 'readonly', Uint8Array: 'readonly', DataTransfer: 'readonly', ClipboardEvent: 'readonly', Blob: 'readonly', DOMParser: 'readonly', localStorage: 'readonly', location: 'readonly' } },
    rules: { 'no-console': 'off', '@typescript-eslint/no-floating-promises': 'off' },
  },
  {
    files: ['**/*.{js,mjs}'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    // سكربت يعمل في المتصفح قبل تحميل التطبيق (يمنع وميض السمة)
    files: ['public/**/*.js'],
    languageOptions: { globals: { document: 'readonly', window: 'readonly', localStorage: 'readonly' } },
  },

  // ───────── الاختبارات ─────────
  {
    // في الاختبارات نقرأ JSON غير مُنمَّط من الاستجابات؛ any هناك مقبول (الأنواع تُفحص في الشيفرة الإنتاجية)
    files: ['tests/**/*.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off', 'no-console': 'off' },
  },
  {
    files: ['src/server/cli/**/*.ts', 'src/server/index.ts'],
    rules: { 'no-console': 'off' },
  },
);
