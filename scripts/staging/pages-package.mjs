import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const [metadata,privateConfig,output]=process.argv.slice(2);
if(!metadata||!privateConfig||!output)throw Error('metadata private-config output required');
const relative=path.relative(process.cwd(),path.resolve(output));
if(!relative.startsWith('..'+path.sep))throw Error('PRIVATE_OUTPUT_REQUIRED');
const scratch=output+'.base';
execFileSync(process.execPath,['scripts/staging/edge-package.mjs',metadata,scratch],{stdio:'pipe'});
const files=JSON.parse(fs.readFileSync(scratch,'utf8'));
const config=JSON.parse(fs.readFileSync(privateConfig,'utf8'));
const envelope=typeof config.envelope==='object'?JSON.stringify(config.envelope):config.envelope;
if(typeof envelope!=='string'||envelope.length>12000||JSON.parse(envelope).v!==1)throw Error('SEALED_ENVELOPE_REQUIRED');
files.splice(files.findIndex(f=>f.name==='index.ts'),1);
files.push({name:'index.ts',content:fs.readFileSync('staging/pages/index.ts','utf8')},
 {name:'pages-handler.mjs',content:fs.readFileSync('staging/pages/handler.mjs','utf8')},
 {name:'sealed-runtime.json',content:JSON.stringify({envelope})});
fs.writeFileSync(output,JSON.stringify(files),{mode:0o600});fs.chmodSync(output,0o600);fs.unlinkSync(scratch);
console.log(JSON.stringify({files:files.length,privateEnvelope:true}));
