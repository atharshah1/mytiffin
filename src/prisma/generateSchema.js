import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { exec } from 'child_process';

// Convert __filename and __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const modelsDir = path.join(__dirname, '../api/v1/models');
const schemaPath = path.join(__dirname, 'schema.prisma');

// Base Prisma schema
const baseSchema = `
generator client {
  provider        = "prisma-client-js"
  output          = "../generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;

// Merge schemas and generate Prisma client
const mergeSchemas = async () => {
  try {
    const modelFiles = fs.readdirSync(modelsDir).filter((file) => file.endsWith('.js'));

    const modelSchemas = await Promise.all(
      modelFiles.map(async (file) => {
        const fileUrl = pathToFileURL(path.join(modelsDir, file));
        const { default: schema } = await import(fileUrl.href);
        return schema;
      })
    );

    const finalSchema = `${baseSchema}\n${modelSchemas.join('\n')}`;
    fs.writeFileSync(schemaPath, finalSchema);
    console.log('Prisma schema generated successfully!');

    // Generate Prisma client
    exec(`npx prisma generate --schema ${schemaPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error generating Prisma client:', error.message);
        return;
      }
      if (stderr) {
        console.error('Prisma client generation stderr:', stderr);
        return;
      }
      console.log('Prisma client generated successfully:', stdout);
    });
  } catch (error) {
    console.error('Error generating Prisma schema:', error);
  }
};

mergeSchemas();
