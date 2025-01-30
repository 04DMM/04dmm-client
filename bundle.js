import fs from 'fs';

import obfuscator from 'javascript-obfuscator';
import uglify from 'uglify-js';

const define = {
    'process.env.SECURE_ORIGIN': JSON.stringify(process.env.SECURE_ORIGIN ?? "false"),
    // original key, used 2003-2010
    'process.env.LOGIN_RSAE': JSON.stringify('58778699976184461502525193738213253649000149147835990136706041084440742975821'),
    'process.env.LOGIN_RSAN': JSON.stringify('7162900525229798032761816791230527296329313291232324290237849263501208207972894053929065636522363163621000728841182238772712427862772219676577293600221789')
};

// bun minification
async function prodBuild(entry) {
    const build = await Bun.build({
        entrypoints: [entry],
        minify: true,
        sourcemap: 'external',
        drop: ['console'],
        define
    });

    if (!build.success) {
        build.logs.forEach(x => console.log(x));
        process.exit(1);
    }

    const source = await build.outputs[0].text();
    const sourcemap = await build.outputs[0].sourcemap.text();

    return {
        source,
        sourcemap
    };
}

// uglify-js
async function uglifyProdBuild(entry) {
    const build = await Bun.build({
        entrypoints: [entry],
        drop: ['console'],
        define
    });

    if (!build.success) {
        build.logs.forEach(x => console.log(x));
        process.exit(1);
    }

    const source = await build.outputs[0].text();
    const ugly = uglify.minify(source, {
        toplevel: true,
        compress: {
            module: true,
            unsafe: true,
        },
        mangle: {
            reserved: [
                // entry point
                'Client'
            ],
            properties: true
        },
        output: {
            beautify: true,
        }
    });

    return {
        source: ugly.code,
        sourcemap: '' // todo
    };
}

// todo: still experimenting with performance
// javascript-obfuscator
async function obfuscatorProdBuild(entry, obfuscate = true) {
    const build = await Bun.build({
        entrypoints: [entry],
        minify: obfuscate ? false : true, // obfuscator has its own minification
        sourcemap: obfuscate ? 'none': 'external', // obfuscator has its own sourcemap
        drop: ['console'],
        define
    });

    if (!build.success) {
        build.logs.forEach(x => console.log(x));
        process.exit(1);
    }

    if (obfuscate) {
        const obfuscated = obfuscator.obfuscate(await build.outputs[0].text(), {
            sourceMap: true,
            sourceMapMode: 'separate',
            identifierNamesGenerator: 'mangled-shuffled',
            renameGlobals: true,
            // renameProperties: true, // todo: would love to use this, but the wasm bindings are breaking when being bundled
            transformObjectKeys: true,
            reservedNames: [
                '^Client$'
            ],
            selfDefending: true,
            debugProtection: true,
            debugProtectionInterval: 2000,
            // less secure, but better UX (less lag):
            simplify: false,
            stringArray: false
        });

        return {
            source: obfuscated.getObfuscatedCode(),
            sourcemap: obfuscated.getSourceMap()
        };
    } else {
        const source = await build.outputs[0].text();
        const sourcemap = await build.outputs[0].sourcemap.text();

        return {
            source,
            sourcemap
        };
    }
}

async function devBuild(entry) {
    const build = await Bun.build({
        entrypoints: [entry],
        sourcemap: 'external',
        define
    });

    if (!build.success) {
        build.logs.forEach(x => console.log(x));
        process.exit(1);
    }

    const source = await build.outputs[0].text();
    const sourcemap = await build.outputs[0].sourcemap.text();

    return {
        source,
        sourcemap
    };
}

const args = process.argv.slice(2);
const build = args[0] === 'prod' ? prodBuild : devBuild;

const client = await build('./src/client/Client.ts');
fs.writeFileSync('out/Client.js', client.source);
fs.writeFileSync('out/Client.js.map', client.sourcemap);

if (fs.existsSync('../Server/public')) {
    fs.copyFileSync('out/Client.js', '../Server/public/client/Client.js');
    fs.copyFileSync('out/Client.js.map', '../Server/public/client/Client.js.map');

    fs.copyFileSync('src/3rdparty/bzip2-wasm/bzip2.wasm', '../Server/public/client/bzip2.wasm');
    fs.copyFileSync('src/3rdparty/tinymidipcm/tinymidipcm.wasm', '../Server/public/client/tinymidipcm.wasm');
}
