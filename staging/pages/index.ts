import {initialize} from './runtime.ts';
import {pagesHandler} from './pages-handler.mjs';
import runtime from './sealed-runtime.json' with {type:'json'};
import deployment from './deployment.json' with {type:'json'};
// El sobre solo existe en el paquete privado de despliegue. Se descifra con la clave de servidor.
// No se acepta configuración, gateway ni credenciales proporcionados por el navegador.
let ready:ReturnType<typeof initialize>|undefined;
Deno.serve(pagesHandler({appOrigin:deployment.origin,envelope:runtime.envelope,
 initialize:(envelope:string)=>ready??=initialize(envelope).catch(e=>{ready=undefined;throw e}),
 waitUntil:(work:Promise<unknown>)=>EdgeRuntime.waitUntil(work)}));
