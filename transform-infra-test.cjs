const fs = require('fs');
const path = require('path');

const testFile = 'src/infrastructure/user/__tests__/UserLocal.repository.test.ts';
let content = fs.readFileSync(testFile, 'utf8');

// Add Result import
if (!content.includes('import { type Result }')) {
  content = `import { type Result } from '../../../core/shared/domain/Result';\nimport type { InvalidArgumentError } from '../../../core/shared/errors';\n${content}`;
}

// Replace User.create() calls with Result handling
// Pattern: const user: User = User.create({
content = content.replace(
  /const (\w+): User = User\.create\(\{/g,
  (match, varName) => {
    return `const ${varName}Result: Result<User, InvalidArgumentError> = User.create({\n`;
  }
);

// Add checks after each create
const lines = content.split('\n');
const newLines = [];
let i = 0;

while (i < lines.length) {
  newLines.push(lines[i]);
  
  // If line contains Result = User.create, add unwrapping after closing brace
  if (lines[i].includes('Result: Result<User, InvalidArgumentError> = User.create({')) {
    const varName = lines[i].match(/const (\w+)Result/)[1];
    
    // Find the closing }); of User.create
    let j = i + 1;
    let braceCount = 1;
    while (j < lines.length && braceCount > 0) {
      newLines.push(lines[j]);
      if (lines[j].includes('{')) braceCount++;
      if (lines[j].includes('}')) braceCount--;
      j++;
    }
    
    // Add unwrapping code
    newLines.push(`      if (${varName}Result.isFailure()) {`);
    newLines.push(`        throw ${varName}Result.error;`);
    newLines.push(`      }`);
    newLines.push(`      const ${varName}: User = ${varName}Result.value;`);
    newLines.push('');
    
    i = j;
    continue;
  }
  
  i++;
}

content = newLines.join('\n');

fs.writeFileSync(testFile, content, 'utf8');
console.log('✅ UserLocal.repository.test.ts updated with Result Type');
