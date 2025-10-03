#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';
import pc from 'picocolors';
import { upgrade } from './upgrade.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log(pc.cyan('\n🚀 Create Captify App\n'));

  const args = process.argv.slice(2);
  const appName = args[0];
  const isUpgrade = args[0] === 'upgrade';

  if (isUpgrade) {
    await upgrade();
    process.exit(0);
  }

  // Check if stdin is a TTY (interactive terminal)
  const isInteractive = process.stdin.isTTY;

  if (!isInteractive && !appName) {
    console.log(pc.red('\n✖ App name required when running non-interactively'));
    console.log(pc.dim('Usage: create-captify-app <app-name>\n'));
    process.exit(1);
  }

  // Prompt for app details (only interactive prompts if TTY)
  const response = await prompts(
    [
      {
        type: appName ? null : 'text',
        name: 'name',
        message: 'App name:',
        initial: 'my-captify-app',
        validate: (value) =>
          /^[a-z0-9-]+$/.test(value) || 'App name must be lowercase alphanumeric with dashes only',
      },
      {
        type: isInteractive ? 'number' : null,
        name: 'port',
        message: 'Port number:',
        initial: 3002,
        validate: (value) => (value >= 3000 && value <= 9999) || 'Port must be between 3000-9999',
      },
      {
        type: isInteractive ? 'text' : null,
        name: 'description',
        message: 'Description:',
        initial: 'A Captify plugin application',
      },
    ],
    {
      onCancel: () => {
        console.log(pc.red('\n✖ Operation cancelled'));
        process.exit(1);
      },
    }
  );

  if (!response.name && !appName) {
    console.log(pc.red('\n✖ Operation cancelled'));
    process.exit(1);
  }

  const finalAppName = appName || response.name;
  const finalPort = response.port || 3002;
  const finalDescription = response.description || 'A Captify plugin application';
  const targetDir = path.resolve(process.cwd(), finalAppName);

  // Check if directory exists
  if (fs.existsSync(targetDir)) {
    console.log(pc.red(`\n✖ Directory "${finalAppName}" already exists`));
    process.exit(1);
  }

  // Copy template
  console.log(pc.blue('\n📦 Creating app from template...'));
  const templateDir = path.join(__dirname, 'templates', 'default');
  copyDir(templateDir, targetDir);

  // Replace placeholders in files
  const replacements = {
    '{{APP_NAME}}': finalAppName,
    '{{APP_SLUG}}': finalAppName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    '{{PORT}}': finalPort.toString(),
    '{{DESCRIPTION}}': finalDescription,
  };

  processTemplateFiles(targetDir, replacements);

  // Success message
  console.log(pc.green(`\n✓ Created ${finalAppName} successfully!\n`));
  console.log(pc.cyan('Next steps:\n'));
  console.log(`  cd ${finalAppName}`);
  console.log(`  npm install`);
  console.log(`  npm run dev\n`);
  console.log(pc.dim('Make sure platform is running on port 3000 for authentication.\n'));
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function processTemplateFiles(dir, replacements) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processTemplateFiles(fullPath, replacements);
    } else {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Replace all placeholders
      for (const [placeholder, value] of Object.entries(replacements)) {
        content = content.replaceAll(placeholder, value);
      }

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

main().catch((err) => {
  console.error(pc.red('\n✖ Error:'), err);
  process.exit(1);
});
