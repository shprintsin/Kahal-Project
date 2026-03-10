#!/usr/bin/env node

import { Command } from "commander";
import { pushContent } from "./commands/push";
import { pullContent } from "./commands/pull";
import { importData } from "./commands/import-data";
import { exportData } from "./commands/export-data";

const program = new Command();

program
  .name("kahal")
  .description("CLI for managing Kahal site content")
  .version("0.1.0");

program
  .command("push <file>")
  .description("Create or update content from a Markdown file with frontmatter")
  .option("-t, --type <type>", "Content type: post or page", "post")
  .action(async (file, options) => {
    await pushContent(file, options.type);
  });

program
  .command("pull <type>")
  .description("Export content as Markdown files")
  .option("-o, --output <dir>", "Output directory", "./content")
  .option("-s, --status <status>", "Filter by status", "published")
  .action(async (type, options) => {
    await pullContent(type, options.output, options.status);
  });

program
  .command("import <file>")
  .description("Bulk import data from CSV/JSON")
  .option("-t, --type <type>", "Data type: layers, places, datasets")
  .option("--dry-run", "Preview without saving")
  .action(async (file, options) => {
    await importData(file, options.type, options.dryRun);
  });

program
  .command("export <type>")
  .description("Bulk export data to CSV/JSON")
  .option("-o, --output <file>", "Output file path")
  .option("-f, --format <format>", "Output format: csv or json", "json")
  .action(async (type, options) => {
    await exportData(type, options.output, options.format);
  });

program.parse();
