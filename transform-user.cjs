const fs = require('fs');

const filePath = 'src/core/user/domain/User.entity.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Step 1: Add import at top
content = `import { type Result, fail, ok } from '../../shared/domain/Result';\n${content}`;

// Step 2: Change method signatures
content = content.replace(
  /public static create\(data: \{ email: string; name: string \}\): User \{/,
  'public static create(data: { email: string; name: string }): Result<User, InvalidArgumentError> {'
);

content = content.replace(
  /public updateName\(newName: string\): User \{/,
  'public updateName(newName: string): Result<User, InvalidArgumentError> {'
);

content = content.replace(
  /public updateEmail\(newEmail: string\): User \{/,
  'public updateEmail(newEmail: string): Result<User, InvalidArgumentError> {'
);

// Step 3: Replace throw with return fail
content = content.replace(/throw new InvalidArgumentError/g, 'return fail(new InvalidArgumentError');

// Step 4: Fix closing parentheses for fail() calls - be very careful
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('return fail(new InvalidArgumentError') && lines[i].trim().endsWith(');')) {
    // Line ends with ); which should become ));
    lines[i] = lines[i].replace(/\);$/, '));');
  }
}
content = lines.join('\n');

// Step 5: Wrap return new User(...) with ok() in create method
content = content.replace(
  /return new User\(\s+crypto\.randomUUID\(\),\s+trimmedEmail\.toLowerCase\(\),\s+trimmedName,\s+new Date\(\),\s+new Date\(\)\s+\);/,
  'return ok(\n      new User(\n        crypto.randomUUID(),\n        trimmedEmail.toLowerCase(),\n        trimmedName,\n        new Date(),\n        new Date()\n      )\n    );'
);

// Step 6: Wrap return new User(...) in updateName
content = content.replace(
  /return new User\(this\.id, this\.email, newName\.trim\(\), this\.createdAt, new Date\(\)\);/,
  'return ok(new User(this.id, this.email, newName.trim(), this.createdAt, new Date()));'
);

// Step 7: Wrap return new User(...) in updateEmail
content = content.replace(
  /return new User\(this\.id, newEmail\.toLowerCase\(\)\.trim\(\), this\.name, this\.createdAt, new Date\(\)\);/,
  'return ok(new User(this.id, newEmail.toLowerCase().trim(), this.name, this.createdAt, new Date()));'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ User.entity.ts transformed successfully');
