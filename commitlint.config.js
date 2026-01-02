/**
 * Commitlint Configuration
 * 
 * Enforces Conventional Commits specification
 * https://www.conventionalcommits.org/
 * 
 * Format: <type>(<scope>): <description>
 * 
 * Examples:
 *   feat(user): add email validation
 *   fix(api): resolve null pointer error
 *   docs(readme): update installation steps
 *   chore(deps): update dependencies
 */

export default {
  rules: {
    // Type enum - allowed commit types
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, no logic change)
        'refactor', // Code refactoring (no feature/fix)
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'chore',    // Maintenance tasks (deps, config, build, etc)
        'ci',       // CI/CD changes
        'build',    // Build system changes
        'revert',   // Revert previous commit
      ],
    ],
    
    // Scope enum - allowed scopes (optional, can be extended)
    'scope-enum': [
      1,
      'always',
      [
        'user',         // User module
        'product',      // Product module
        'order',        // Order module
        'shared',       // Shared code
        'core',         // Core layer
        'infrastructure', // Infrastructure layer
        'presentation', // Presentation layer
        'config',       // Configuration
        'deps',         // Dependencies
        'hooks',        // Git hooks
        'tests',        // Tests
        'docs',         // Documentation
      ],
    ],
    
    // Subject (description) rules
    'subject-case': [2, 'always', 'lower-case'], // Must be lowercase
    'subject-empty': [2, 'never'],                 // Subject required
    'subject-full-stop': [2, 'never', '.'],       // No period at end
    'subject-min-length': [2, 'always', 10],      // Min 10 characters
    'subject-max-length': [2, 'always', 100],     // Max 100 characters
    
    // Type rules
    'type-case': [2, 'always', 'lower-case'],     // Type must be lowercase
    'type-empty': [2, 'never'],                    // Type required
    
    // Scope rules
    'scope-case': [2, 'always', 'lower-case'],    // Scope must be lowercase
    'scope-empty': [1, 'never'],                   // Scope recommended (warning)
    
    // Header (full first line) rules
    'header-max-length': [2, 'always', 120],      // Max 120 characters
    
    // Body rules
    'body-leading-blank': [2, 'always'],          // Blank line before body
    'body-max-line-length': [2, 'always', 200],   // Max 200 characters per line
    
    // Footer rules
    'footer-leading-blank': [2, 'always'],        // Blank line before footer
  },
};
