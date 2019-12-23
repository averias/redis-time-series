module.exports = {
    parser: "@typescript-eslint/parser", // Specifies the ESLint parser
    env: {
        "es6": true,
        "node": true
    },
    extends: [
        "plugin:@typescript-eslint/recommended",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended",
        "eslint:recommended"
    ],
    parserOptions: {
        // project: './tsconfig.json'
        ecmaVersion: 6,
        sourceType: "module"
    },
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-ts-ignore": "off"
    },
    overrides: [
        {
            files: ['**/*.ts'],
            parser: '@typescript-eslint/parser',
            rules: {
                'no-undef': 'off'
            }
        }
    ]
};
