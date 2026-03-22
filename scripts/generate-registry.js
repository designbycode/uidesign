/**
 * Registry.json Generator
 *
 * Scans the registry folder and auto-generates registry.json with:
 * - hooks: All custom React hooks
 * - items: All components (blocks, cards, ui)
 *
 * Automatically detects:
 * - Component names from exports
 * - registryDependencies from @/components/ui/* imports
 * - dependencies from external package imports (e.g., @dnd-kit/*)
 * - hooks from @/hooks/* imports
 *
 * Usage: node scripts/generate-registry.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const REGISTRY_DIR = path.join(rootDir, 'registry');
const OUTPUT_FILE = path.join(rootDir, 'registry.json');
const SCHEMA_URL = 'https://ui.shadcn.com/schema/registry.json';
const HOMEPAGE = 'https://uidesign.co.za';
const NAME = 'uidesign';

// Files/directories to exclude from processing
const EXCLUDED_FILES = ['index.ts', 'index.ts', 'dropzone.ts', 'index.js'];
const EXCLUDED_DIRS = ['node_modules', '.git'];

// Regex patterns for parsing imports
const UI_COMPONENT_PATTERN = /@\/components\/ui\/(\w+)/g;
const HOOK_PATTERN = /@\/hooks\/([\w-]+)/g;
const EXTERNAL_PACKAGE_PATTERN = /from\s+['"](@[\w-]+\/[\w-]+)['"]/g;

// Map of partial hook names to full names
const HOOK_NAME_MAP = {
    'use-drag': 'use-drag-over',
    'use-upload': 'use-upload-progress',
    'use-image': 'use-image-components',
    'use-sortable': 'use-sortable-files',
    'use-file': 'use-file-collection',
    'use-preview': 'use-file-preview',
};

function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

function toTitleCase(str) {
    return str.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function generateDescription(componentName) {
    const baseDescriptions = {
        'Sortable Stack': 'A sortable stack-style',
        'Sortable Row': 'A sortable row-style',
        'Sortable Grid': 'A sortable grid-style',
        'Sortable List': 'A sortable list-style',
        'Sortable Cards': 'A sortable cards-style',
        Masonry: 'A masonry-style',
        Carousel: 'A carousel-style',
        Dialog: 'A dialog-style',
        Minimal: 'A minimal',
        Card: 'A card-styled',
        Inline: 'An inline',
        Badge: 'A badge-styled',
        Square: 'A square-styled',
        Outlined: 'An outlined',
        Ghost: 'A ghost-styled',
        Field: 'A field-styled',
        List: 'A list-layout',
        Compact: 'A compact',
        Simple: 'A simple',
        Table: 'A table-style',
        Pills: 'A pill-style',
    };

    for (const [key, desc] of Object.entries(baseDescriptions)) {
        if (componentName.includes(key)) {
            return `${desc} ${getComponentType(componentName)} component.`;
        }
    }

    return `A ${toTitleCase(componentName)} component.`;
}

function getComponentType(componentName) {
    if (componentName.includes('Dropzone')) {
        if (componentName.includes('Avatar')) {
            return 'avatar components';
        }

        if (componentName.includes('Gallery')) {
            return 'gallery components';
        }

        return 'components';
    }

    return componentName
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim();
}

function parseFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    const registryDependencies = new Set();
    const externalDependencies = new Set();
    const hooks = new Set();

    // Extract UI component dependencies
    let match;

    while ((match = UI_COMPONENT_PATTERN.exec(content)) !== null) {
        registryDependencies.add(match[1]);
    }

    // Extract external package dependencies
    while ((match = EXTERNAL_PACKAGE_PATTERN.exec(content)) !== null) {
        const pkg = match[1];

        // Only add non-@/ imports (these are external packages)
        if (!pkg.startsWith('@/')) {
            externalDependencies.add(pkg);
        }
    }

    // Extract hooks and map to full names
    while ((match = HOOK_PATTERN.exec(content)) !== null) {
        const partialName = match[1];
        // Check if this is a partial match that needs to be expanded
        const fullName = HOOK_NAME_MAP[partialName] || partialName;

        // Only add if it's a valid hook (not types, utils, etc.)
        if (fullName.startsWith('use-')) {
            hooks.add(fullName);
        }
    }

    // Reset regex lastIndex
    UI_COMPONENT_PATTERN.lastIndex = 0;
    HOOK_PATTERN.lastIndex = 0;
    EXTERNAL_PACKAGE_PATTERN.lastIndex = 0;

    return {
        registryDependencies: Array.from(registryDependencies).sort(),
        externalDependencies: Array.from(externalDependencies).sort(),
        hooks: Array.from(hooks).sort(),
    };
}

function extractComponentName(filePath, content) {
    // Try to find export statement
    const exportMatch = content.match(
        /export\s+(?:function|const|class)\s+(\w+)/,
    );

    if (exportMatch) {
        return exportMatch[1];
    }

    // Fallback to filename
    const filename = path.basename(filePath, path.extname(filePath));

    return filename
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

function processHooks(hooksDir) {
    const hooks = [];

    if (!fs.existsSync(hooksDir)) {
        return hooks;
    }

    const files = fs.readdirSync(hooksDir);

    for (const file of files) {
        if (!file.endsWith('.ts') || EXCLUDED_FILES.includes(file)) {
            continue;
        }

        const filePath = path.join(hooksDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Extract hook name from export (handles both camelCase and kebab-case)
        const exportMatch = content.match(
            /export\s+(?:function|const)\s+(use\w+)/,
        );

        if (!exportMatch) {
            continue;
        }

        const hookName = exportMatch[1];
        // Convert camelCase to kebab-case: useDragOver -> use-drag-over
        const hookNameKebab = hookName
            .replace(/([A-Z])/g, '-$1')
            .toLowerCase()
            .replace(/^use-/, 'use-');

        // Generate description from hook name
        const description = hookName
            .replace(/use-/i, '')
            .replace(/([A-Z])/g, ' $1')
            .toLowerCase()
            .trim();

        hooks.push({
            name: hookNameKebab,
            description: `${description.charAt(0).toUpperCase() + description.slice(1)} hook`,
            file: {
                path: path.relative(rootDir, filePath).replace(/\\/g, '/'),
                type: 'registry:hook',
            },
        });
    }

    return hooks.sort((a, b) => a.name.localeCompare(b.name));
}

function processComponents(registryDir) {
    const items = [];

    function walkDir(dir) {
        if (!fs.existsSync(dir)) {
            return;
        }

        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (!EXCLUDED_DIRS.includes(entry.name)) {
                    walkDir(fullPath);
                }

                continue;
            }

            if (
                !entry.name.endsWith('.tsx') ||
                EXCLUDED_FILES.includes(entry.name)
            ) {
                continue;
            }

            const {
                registryDependencies,
                externalDependencies,
                hooks: fileHooks,
            } = parseFile(fullPath);
            const componentName = extractComponentName(
                fullPath,
                fs.readFileSync(fullPath, 'utf-8'),
            );

            const item = {
                name: toKebabCase(componentName),
                type: 'registry:block',
                title: componentName.replace(/([A-Z])/g, ' $1').trim(),
                description: generateDescription(componentName),
                files: [
                    {
                        path: path
                            .relative(rootDir, fullPath)
                            .replace(/\\/g, '/'),
                        type: 'registry:block',
                    },
                ],
            };

            if (registryDependencies.length > 0) {
                item.registryDependencies = registryDependencies;
            }

            if (externalDependencies.length > 0) {
                item.dependencies = externalDependencies;
            }

            if (fileHooks.length > 0) {
                item.hooks = fileHooks;
            }

            items.push(item);
        }
    }

    // Process blocks
    const blocksDir = path.join(registryDir, 'new-york', 'blocks');

    if (fs.existsSync(blocksDir)) {
        const subDirs = fs.readdirSync(blocksDir, { withFileTypes: true });

        for (const subDir of subDirs) {
            if (subDir.isDirectory()) {
                walkDir(path.join(blocksDir, subDir.name), subDir.name);
            }
        }
    }

    // Process cards
    const cardsDir = path.join(registryDir, 'new-york', 'cards');

    if (fs.existsSync(cardsDir)) {
        walkDir(cardsDir, 'cards');
    }

    // Process ui
    const uiDir = path.join(registryDir, 'new-york', 'ui');

    if (fs.existsSync(uiDir)) {
        walkDir(uiDir, 'ui');
    }

    return items.sort((a, b) => a.name.localeCompare(b.name));
}

function generateRegistry() {
    console.log('🔍 Scanning registry directory...\n');

    // Process hooks
    const hooksDir = path.join(REGISTRY_DIR, 'new-york', 'hooks');
    const hooks = processHooks(hooksDir);
    console.log(`📦 Found ${hooks.length} hooks`);

    // Process components
    const items = processComponents(REGISTRY_DIR);
    console.log(`📦 Found ${items.length} components`);

    // Build registry object
    const registry = {
        $schema: SCHEMA_URL,
        name: NAME,
        homepage: HOMEPAGE,
        hooks,
        items,
    };

    // Write to file
    const jsonContent = JSON.stringify(registry, null, 4);
    fs.writeFileSync(OUTPUT_FILE, jsonContent + '\n');

    console.log(`\n✅ Generated registry.json with:`);
    console.log(`   - ${hooks.length} hooks`);
    console.log(`   - ${items.length} components`);
    console.log(`   - Saved to: ${OUTPUT_FILE}\n`);

    return registry;
}

// Run
generateRegistry();
