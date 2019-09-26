const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const rm = require('rimraf').sync
const babel = require('rollup-plugin-babel')
const cmd = require('rollup-plugin-commonjs')
const cleanup = require('rollup-plugin-cleanup')
const { terser } = require('rollup-plugin-terser')
const resolve = require('rollup-plugin-node-resolve')

const libName = require('./package.json').name
const testLibPath = path.resolve(__dirname, './dev')
const sdkDir = path.resolve(testLibPath, './sdk')
const entryPath = path.resolve(__dirname, './src/index.js')
const outputPath = filename => path.resolve(__dirname, './dist', filename)

const esm = {
  input: entryPath,
  output: {
    file: outputPath(`${libName}.esm.js`),
    format: 'es',
  },
}

const cjs = {
  input: entryPath,
  output: {
    file: outputPath(`${libName}.common.js`),
    format: 'cjs',
  },
}

const uglifyCjs = {
  input: entryPath,
  output: {
    file: outputPath(`${libName}.min.js`),
    format: 'cjs',
  },
}

async function build (cfg, needUglify, sourcemap = false) {
  cfg.output.sourcemap = sourcemap

  const buildCfg = {
    input: cfg.input,
    plugins: [
      cleanup(),
      resolve(),
      babel({
        babelrc: true,
        exclude: 'node_modules/**',
      }),
      cmd(),
    ]
  }

  if (needUglify) {
    buildCfg.plugins.unshift(
      terser({
        sourcemap: false,
      })
    )
  }

  const bundle = await rollup.rollup(buildCfg)
  await bundle.generate(cfg.output)
  await bundle.write(cfg.output)
}

console.clear()
// delete old build files
rm('./dist')
rm(sdkDir)

const transferfile = (from, desPath) => {
  const readable = fs.createReadStream(from)
  readable.on('open', () => readable.pipe(fs.createWriteStream(desPath)))
}

const buildVersion = sourcemap => {
  const builds = [
    build(esm, false, sourcemap),
    build(cjs, false, sourcemap),
  ]
  if (!sourcemap) {
    builds.push(build(uglifyCjs, true, sourcemap))
  }

  Promise.all(builds).then(() => {
    // transfer esm package to dev folder
    if (fs.existsSync(testLibPath)) {
      if (!fs.existsSync(sdkDir)) {
        fs.mkdirSync(sdkDir)
      }

      const sdkPath = esm.output.file
      const desPath = path.join(sdkDir, `${libName}.esm.js`)
      transferfile(sdkPath, desPath)
      if (sourcemap) {
        transferfile(sdkPath + '.map', desPath + '.map')
      }
    }
  })
}

// watch, use in dev and test
if (process.argv.includes('-w')) {
  let i = 0
  fs.watch('./src', { recursive: true }, () => {
    console.clear()
    console.log('Rebuild: ' + ++i)
    buildVersion(true)
  })
  buildVersion(true)
} else {
  buildVersion()
}