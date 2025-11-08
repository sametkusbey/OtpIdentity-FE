const fs = require('fs');
const path = require('path');

const apiFiles = [
  'src/features/licenses/api.ts',
  'src/features/statistics/api.ts', 
  'src/features/companyRepresentatives/api.ts',
  'src/features/companyAddresses/api.ts',
  'src/features/connections/api.ts',
  'src/features/programEditions/api.ts',
  'src/features/programVersions/api.ts',
  'src/features/programs/api.ts',
  'src/features/authorizations/api.ts',
  'src/features/apps/api.ts',
  'src/features/users/api.ts'
];

apiFiles.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace isSuccess checks
      content = content.replace(/'isSuccess' in payload/g, "('succeeded' in payload || 'isSuccess' in payload)");
      content = content.replace(/'isSuccess' in data/g, "('succeeded' in data || 'isSuccess' in data)");
      
      // Replace result.isSuccess references
      content = content.replace(/const result = payload as Result<([^>]+)>;\s*if \(!result\.isSuccess\)/g, 
        'const result = payload as any;\n    const succeeded = result.succeeded ?? result.isSuccess;\n    if (!succeeded)');
      
      content = content.replace(/const result = data as Result<([^>]+)>;\s*if \(!result\.isSuccess\)/g, 
        'const result = data as any;\n    const succeeded = result.succeeded ?? result.isSuccess;\n    if (!succeeded)');
        
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
    } else {
      console.log(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log('API response format fix completed!');
