import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fixture } from "../helpers/reports.js";

const output="docs/evidencias/fase13";
mkdirSync(output,{recursive:true});
const require=createRequire(import.meta.url);
const source=readFileSync(require.resolve("axe-core/axe.min.js"),"utf8");
const origin="http://localhost:4313",x=await fixture(origin,resolve("dist/web"));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??"/usr/bin/chromium",args:["--no-sandbox"]});
const results:any[]=[],checks:any[]=[],errors:string[]=[];
try {
  await x.server.listen({host:"127.0.0.1",port:4313});
  for(const role of ["lectura","administrador"]) {
    const context=await browser.newContext({timezoneId:"America/Santiago"}),page=await context.newPage();
    page.setDefaultTimeout(10000);page.on("pageerror",e=>errors.push(e.message));
    async function scan(name:string) {
      // Inyección exclusiva del runner; la CSP del producto se conserva.
      await page.evaluate("window.__name = (fn) => fn"); // helper de tsx al serializar callbacks
      await page.evaluate(source);
      const result=await page.evaluate(async()=>{
        const r=await (window as any).axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa","best-practice"]}});
        return {version:r.testEngine.version,violations:r.violations.map((v:any)=>({id:v.id,impact:v.impact,description:v.description,helpUrl:v.helpUrl,nodes:v.nodes.map((n:any)=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map((v:any)=>({id:v.id,nodes:v.nodes.map((n:any)=>n.target)})),passes:r.passes.length};
      });
      // axe no calcula contraste en celdas recortadas por scroll horizontal.
      // Revisión CSS adicional para esas combinaciones opacas, sin ocultar incomplete.
      const targets=result.incomplete.filter((v:any)=>v.id==="color-contrast").flatMap((v:any)=>v.nodes).flat();
      const contrast=await page.evaluate((selectors:string[])=>{
        const rgb=(s:string)=>s.match(/[\d.]+/g)?.map(Number)??[];
        const lum=(c:number[])=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
        const pairs=new Map<string,any>();
        for(const selector of selectors){
          const el=document.querySelector(selector);if(!el)continue;
          const style=getComputedStyle(el),fg=rgb(style.color);let bg:number[]=[],node:Element|null=el;
          while(node){const c=rgb(getComputedStyle(node).backgroundColor);if(c.length===3||c[3]===1){bg=c;break;}node=node.parentElement;}
          if(bg.length<3||fg.length<3)continue;
          const ratio=(Math.max(lum(fg),lum(bg))+.05)/(Math.min(lum(fg),lum(bg))+.05);
          const large=parseFloat(style.fontSize)>=24||(parseFloat(style.fontSize)>=18.66&&parseInt(style.fontWeight)>=700),minimum=large?3:4.5;
          const key=fg.join()+"/"+bg.join()+"/"+minimum;
          const old=pairs.get(key);pairs.set(key,{foreground:fg,background:bg,ratio,minimum,passed:ratio>=minimum,nodes:(old?.nodes??0)+1});
        }
        return [...pairs.values()];
      },targets);
      checks.push({role,screen:name,check:"contraste CSS suplementario en texto recortado",passed:contrast.every((v:any)=>v.passed)});
      results.push({role,screen:name,viewport:page.viewportSize(),...result,supplementalContrast:contrast});
    }
    await page.goto(origin);await page.getByRole("button",{name:"Iniciar sesión",exact:true}).waitFor();
    await scan("acceso");
    await page.getByLabel("Correo",{exact:true}).fill(role==="lectura"?"reader@example.invalid":"admin@example.invalid");
    await page.getByLabel("Contraseña",{exact:true}).fill("synthetic");
    await page.getByRole("button",{name:"Iniciar sesión",exact:true}).click();
    if(role==="administrador") {
      await page.getByRole("button",{name:"Configurar autenticador",exact:true}).waitFor();await scan("MFA parcial");
      await page.getByRole("button",{name:"Configurar autenticador",exact:true}).click();
      await page.getByLabel("Código de seis dígitos",{exact:true}).fill("123456");
      await page.getByRole("button",{name:"Verificar",exact:true}).click();
    }
    await page.getByRole("link",{name:"Resumen",exact:true}).waitFor();
    for(const [width,height,label] of [[1440,1000,"computador"],[820,1180,"ipad"],[390,844,"iphone"]] as const) {
      await page.setViewportSize({width,height});
      for(const view of ["resumen","bienes","funcionarios","reportes","administracion"]) {
        await page.goto(origin+"/#"+view);
        await page.locator("main h1").waitFor();
        await page.waitForFunction(()=>!document.querySelector('[role="status"]')?.textContent?.includes("Cargando"));
        // Espera al dato de cada ruta, no solo al título montado durante la carga.
        if(view==="bienes"||view==="funcionarios") await page.locator("tbody tr").first().waitFor();
        if(view==="resumen") await page.locator(".report-metrics strong").first().waitFor();
        if(view==="reportes") await page.getByText("Total filtrado:",{exact:false}).waitFor();
        if(view==="bienes") {
          const heading=await page.locator("main h1").innerText();
          await page.getByRole("link",{name:"Saltar al contenido",exact:true}).focus();
          await page.keyboard.press("Enter");
          checks.push({role,view,viewport:label,check:"salto a contenido conserva ruta y mueve foco",passed:await page.locator("main").evaluate(el=>el===document.activeElement)&&await page.locator("main h1").innerText()===heading});
        }
        if(view==="administracion"&&role==="administrador") {
          await page.getByRole("button",{name:"Seguimiento de avisos",exact:true}).click();
          await page.getByRole("button",{name:/^Ver aviso /}).first().waitFor();
        }
        await scan(view+"/"+label);
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
        checks.push({role,view,viewport:label,check:"sin desborde de página",passed:!overflow});
        if(view==="reportes") {
          const wrap=page.locator(".table-wrap").first();
          await wrap.focus(); await page.keyboard.press("ArrowRight");
          checks.push({role,view,viewport:label,check:"tabla recibe foco de teclado",passed:await wrap.evaluate(el=>el===document.activeElement)});
          await page.evaluate(()=>{window.scrollTo(0,0);document.querySelectorAll(".table-wrap").forEach(el=>el.scrollLeft=0);});
          await page.screenshot({path:`${output}/${role}-${label}.png`,fullPage:true});
        }
      }
    }
    await page.goto(origin+"/#reportes");
    await page.getByLabel("Tipo de reporte",{exact:true}).waitFor();
    await page.getByLabel("Desde (día UTC)",{exact:true}).fill("2026-11-02");
    await page.getByLabel("Hasta (día UTC, inclusive)",{exact:true}).fill("2026-11-01");
    await page.getByRole("button",{name:"Aplicar filtros",exact:true}).click();
    await page.getByRole("alert").waitFor();
    checks.push({role,check:"error recibe foco",passed:await page.getByRole("alert").evaluate(el=>el===document.activeElement)});
    await scan("error de rango");
    await context.close();
  }
  writeFileSync(output+"/accesibilidad.json",JSON.stringify({browser:await browser.version(),engine:"Chromium; emulación de tamaños, sin Safari/hardware/lector de pantalla",target:"WCAG 2.2 AA, revisión parcial automática y teclado",results,checks,errors},null,2)+"\n");
  console.log(JSON.stringify({scans:results.length,violations:results.flatMap(r=>r.violations.map((v:any)=>({role:r.role,screen:r.screen,...v}))),checks,errors},null,2));
  assert.deepEqual(errors,[]);
  assert(checks.every(c=>c.passed),"Ver controles manuales asistidos en evidencia");
  assert(results.every(r=>r.violations.length===0),"Ver hallazgos de axe en evidencia");
} finally {await browser.close();await x.close();}
