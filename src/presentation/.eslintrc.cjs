// ESLint configuration for Presentation Layer
// Relaxed rules for React components and hooks
module.exports = {
  rules: {
    // React hooks are designed to use promises in callbacks
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
    // Allow floating promises in useEffect cleanup
    '@typescript-eslint/no-floating-promises': [
      'error',
      {
        ignoreVoid: true,
        ignoreIIFE: true,
      },
    ],
    // TypeScript can infer types in many React patterns
    '@typescript-eslint/typedef': [
      'error',
      {
        arrayDestructuring: false,
        arrowParameter: false,
        memberVariableDeclaration: true,
        objectDestructuring: false,
        parameter: true,
        propertyDeclaration: true,
        variableDeclaration: false,
        variableDeclarationIgnoreFunction: true,
      },
    ],
  },
};
