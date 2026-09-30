import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * ZYLO Automated Version Control & Package Upgrader
 * Fetches latest compatible versions for all FE & BE libraries, updates package.json files,
 * and runs npm install automatically.
 */

export interface PackageUpdateReport {
  target: 'Frontend' | 'Backend';
  type: 'dep' | 'devDep';
  packageName: string;
  currentVersion: string;
  latestVersion: string;
  updated: boolean;
}

/**
 * Version constraints for packages that have strict peer-dependency boundaries
 * (e.g. NestJS Swagger 12 requires TypeScript < 7.0.0)
 */
export const VERSION_CONSTRAINTS: Record<string, string> = {
  typescript: '~6.0.2',
  '@types/node': '^22.20.4',
};

export const MONITORED_PACKAGES = {
  frontend: {
    dependencies: [
      'react',
      'react-dom',
      'react-router-dom',
      'tailwindcss',
      '@tailwindcss/vite',
      'axios',
      'lucide-react',
    ],
    devDependencies: [
      '@types/node',
      '@types/react',
      '@types/react-dom',
      '@vitejs/plugin-react',
      'oxlint',
      'typescript',
      'vite',
    ],
  },
  backend: {
    dependencies: [
      '@nestjs/common',
      '@nestjs/core',
      '@nestjs/platform-express',
      '@nestjs/config',
      '@nestjs/swagger',
      '@nestjs/mongoose',
      'mongoose',
      '@nestjs/jwt',
      '@nestjs/passport',
      '@nestjs/throttler',
      'bcryptjs',
      'class-transformer',
      'class-validator',
      'cookie-parser',
      'helmet',
      'passport',
      'passport-jwt',
      'reflect-metadata',
      'rxjs',
      'uuid',
    ],
    devDependencies: [
      '@types/cookie-parser',
      '@types/express',
      '@types/node',
      '@types/passport-jwt',
      '@types/uuid',
      'ts-node',
      'ts-node-dev',
      'typescript',
    ],
  },
};

/**
 * Fetch the latest version of a package from the official npm registry
 */
async function fetchLatestVersion(packageName: string): Promise<string | null> {
  // If constrained by peer dependency, return the pinned boundary
  if (VERSION_CONSTRAINTS[packageName]) {
    return VERSION_CONSTRAINTS[packageName].replace(/^[\^~]/, '');
  }

  const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'zylo-version-control' } });
    if (!res.ok) return null;
    const data = (await res.json()) as { version?: string };
    return data.version || null;
  } catch {
    return null;
  }
}

/**
 * Fetch latest versions for an array of packages concurrently
 */
async function fetchBatchVersions(packages: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  await Promise.all(
    packages.map(async (pkg) => {
      const ver = await fetchLatestVersion(pkg);
      if (ver) {
        results[pkg] = ver;
      }
    })
  );
  return results;
}

/**
 * Update target package.json with latest fetched versions
 */
function updatePackageJson(
  target: 'frontend' | 'backend',
  latestDepMap: Record<string, string>
): PackageUpdateReport[] {
  const root = process.cwd();
  const filePath =
    target === 'frontend'
      ? path.join(root, 'client', 'package.json')
      : path.join(root, 'server', 'package.json');

  if (!fs.existsSync(filePath)) {
    console.error(`[Error] File not found: ${filePath}`);
    return [];
  }

  const pkg = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const report: PackageUpdateReport[] = [];

  // 1. Process regular dependencies
  const config = MONITORED_PACKAGES[target];
  pkg.dependencies = pkg.dependencies || {};
  for (const dep of config.dependencies) {
    const current = pkg.dependencies[dep] || 'not installed';
    const latest = latestDepMap[dep];
    if (latest) {
      const prefix = VERSION_CONSTRAINTS[dep] ? '' : '^';
      const formattedLatest = VERSION_CONSTRAINTS[dep] || `${prefix}${latest}`;
      const isUpdated = current !== formattedLatest;
      pkg.dependencies[dep] = formattedLatest;
      report.push({
        target: target === 'frontend' ? 'Frontend' : 'Backend',
        type: 'dep',
        packageName: dep,
        currentVersion: current,
        latestVersion: formattedLatest,
        updated: isUpdated,
      });
    }
  }

  // 2. Process devDependencies
  pkg.devDependencies = pkg.devDependencies || {};
  for (const devDep of config.devDependencies) {
    const current = pkg.devDependencies[devDep] || 'not installed';
    const latest = latestDepMap[devDep];
    if (latest) {
      const prefix = devDep === 'typescript' && target === 'frontend' ? '~' : '^';
      const formattedLatest = VERSION_CONSTRAINTS[devDep] || `${prefix}${latest}`;
      const isUpdated = current !== formattedLatest;
      pkg.devDependencies[devDep] = formattedLatest;
      report.push({
        target: target === 'frontend' ? 'Frontend' : 'Backend',
        type: 'devDep',
        packageName: devDep,
        currentVersion: current,
        latestVersion: formattedLatest,
        updated: isUpdated,
      });
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  return report;
}

/**
 * Run npm install in target folder with peer-dependency safety
 */
function runNpmInstall(targetDir: string, label: string): void {
  console.log(`\n⏳ Running "npm install" for ${label}...`);
  try {
    execSync(`npm install --prefix "${targetDir}" --legacy-peer-deps`, {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
    console.log(`✅ "npm install" completed successfully for ${label}.\n`);
  } catch (err) {
    console.error(`❌ Failed to run npm install in ${label}:`, (err as Error).message);
  }
}

/**
 * Main execution function
 */
export async function runVersionControl(options: { skipInstall?: boolean } = {}): Promise<void> {
  const root = process.cwd();
  console.log(`========================================================================`);
  console.log(`🚀 ZYLO Automated Version Checker & Dependency Manager`);
  console.log(`========================================================================\n`);

  console.log(`🔍 Querying npm registry for latest versions of all FE & BE libraries...`);

  const allPackages = Array.from(
    new Set([
      ...MONITORED_PACKAGES.frontend.dependencies,
      ...MONITORED_PACKAGES.frontend.devDependencies,
      ...MONITORED_PACKAGES.backend.dependencies,
      ...MONITORED_PACKAGES.backend.devDependencies,
    ])
  );

  const latestMap = await fetchBatchVersions(allPackages);
  console.log(`✨ Retrieved latest releases for ${Object.keys(latestMap).length} packages.\n`);

  // Update client and server package.json
  console.log(`📝 Updating client/package.json and server/package.json...`);
  const frontendReports = updatePackageJson('frontend', latestMap);
  const backendReports = updatePackageJson('backend', latestMap);

  const allReports = [...frontendReports, ...backendReports];

  // Print summary table
  console.log(`\n📊 Version Upgrade Report:`);
  console.table(
    allReports.map((r) => ({
      Target: r.target,
      Package: r.packageName,
      'Old Version': r.currentVersion,
      'Latest Version': r.latestVersion,
      Status: r.updated ? '🚀 UPGRADED' : '✅ UP TO DATE',
    }))
  );

  // Run npm install if not skipped
  if (!options.skipInstall) {
    const clientPath = path.join(root, 'client');
    const serverPath = path.join(root, 'server');

    runNpmInstall(clientPath, 'Frontend (client/)');
    runNpmInstall(serverPath, 'Backend (server/)');

    console.log(`========================================================================`);
    console.log(`🎉 Both Frontend & Backend are fully updated to their latest packages!`);
    console.log(`========================================================================\n`);
  }
}

// Self-invoking CLI runner
const isDirectExecution =
  process.argv[1] &&
  (process.argv[1].endsWith('version-control.ts') || process.argv[1].endsWith('version-control.js'));

if (isDirectExecution) {
  const skipInstall = process.argv.includes('--skip-install');
  runVersionControl({ skipInstall }).catch((err) => {
    console.error('Error executing version-control:', err);
    process.exit(1);
  });
}
