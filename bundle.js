import fs from 'fs';

const args = process.argv.slice(2);

function bunBuild(entry, prod) {
    if (prod) {
        return Bun.build({
            entrypoints: [entry],
            outdir: './out',
            sourcemap: 'external',
            minify: true,
            drop: ['console']
        });
    } else {
        return Bun.build({
            entrypoints: [entry],
            outdir: './out'
        });
    }
}

const build = await bunBuild('./src/client/Client.ts', args[0] === 'prod');
if (!build.success) {
    build.logs.forEach(x => console.log(x));
} else {
    fs.copyFileSync('out/Client.js', '../Server/public/client/Client.js');
    fs.copyFileSync('out/Client.js.map', '../Server/public/client/Client.js.map');
    fs.copyFileSync('src/3rdparty/bzip2-wasm/bzip2.wasm', '../Server/public/client/bzip2.wasm');
    fs.copyFileSync('src/3rdparty/tinymidipcm/tinymidipcm.wasm', '../Server/public/client/tinymidipcm.wasm');
}
