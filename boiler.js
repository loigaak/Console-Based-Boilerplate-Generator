#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

// Default templates directory
const TEMPLATES_DIR = path.join(__dirname, 'templates');

// Sample templates (you can expand this)
const templates = {
  js: {
    files: {
      'index.js': '// Your JavaScript code here',
      'README.md': '# My JavaScript Project',
      '.gitignore': 'node_modules\n.env',
    },
  },
  react: {
    files: {
      'src/App.js': `import React from 'react';\n\nfunction App() {\n  return <div>Hello, World!</div>;\n}\n\nexport default App;`,
      'README.md': '# My React Project',
      '.gitignore': 'node_modules\n.env',
    },
  },
};

// Generate boilerplate
async function generateBoilerplate(type, options) {
  const template = templates[type];
  if (!template) {
    console.log(chalk.red(`Template "${type}" not found.`));
    return;
  }

  const { name } = options.name ? { name: options.name } : await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter project name:',
      default: 'my-project',
    },
  ]);

  const projectDir = path.join(process.cwd(), name);
  await fs.ensureDir(projectDir);

  for (const [file, content] of Object.entries(template.files)) {
    const filePath = path.join(projectDir, file);
    await fs.outputFile(filePath, content);
  }

  console.log(chalk.green(`Boilerplate for "${type}" generated in "${name}"!`));
}

// Save current directory as a custom template
async function saveTemplate(name) {
  const templateDir = path.join(TEMPLATES_DIR, name);
  await fs.ensureDir(templateDir);

  // Copy current directory to template (excluding node_modules)
  await fs.copy(process.cwd(), templateDir, {
    filter: src => !src.includes('node_modules'),
  });

  console.log(chalk.green(`Custom template "${name}" saved!`));
}

program
  .command('gen <type>')
  .description('Generate boilerplate for a specific type (e.g., js, react)')
  .option('--name <name>', 'Project name')
  .action((type, options) => generateBoilerplate(type, options));

program
  .command('save <name>')
  .description('Save the current directory as a custom template')
  .action((name) => saveTemplate(name));

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log(chalk.cyan('Use the "gen" command to generate a boilerplate!'));
}
