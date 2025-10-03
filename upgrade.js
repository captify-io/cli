import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';
import pc from 'picocolors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function upgrade() {
  console.log(pc.cyan('\n🔄 Upgrade Captify App\n'));

  // Check if we're in a Captify app directory
  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.log(pc.red('✖ No package.json found. Run this command from your app directory.'));
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (!pkg.name?.startsWith('@captify-io/')) {
    console.log(pc.red('✖ This does not appear to be a Captify app.'));
    process.exit(1);
  }

  // Files that can be safely upgraded
  const upgradeableFiles = [
    'next.config.ts',
    'tsconfig.json',
    'postcss.config.cjs',
    'src/app/globals.css',
    '.gitignore',
  ];

  // Prompt which files to upgrade
  const response = await prompts(
    [
      {
        type: 'multiselect',
        name: 'files',
        message: 'Select files to upgrade:',
        choices: upgradeableFiles.map((file) => ({
          title: file,
          value: file,
          selected: true,
        })),
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'This will overwrite selected files. Continue?',
        initial: false,
      },
    ],
    {
      onCancel: () => {
        console.log(pc.yellow('\n✖ Upgrade cancelled'));
        process.exit(0);
      },
    }
  );

  if (!response.confirm) {
    console.log(pc.yellow('\n✖ Upgrade cancelled'));
    process.exit(0);
  }

  // Copy selected files from template
  const templateDir = path.join(__dirname, 'templates', 'default');
  let upgraded = 0;

  for (const file of response.files) {
    const src = path.join(templateDir, file);
    const dest = path.join(process.cwd(), file);

    if (fs.existsSync(src)) {
      // Create directory if needed
      const dir = path.dirname(dest);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.copyFileSync(src, dest);
      console.log(pc.green(`✓ Updated ${file}`));
      upgraded++;
    }
  }

  console.log(pc.cyan(`\n✓ Upgraded ${upgraded} file(s) successfully!\n`));
}
