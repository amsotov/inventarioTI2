import { test } from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { operations } from '../../apps/server/operations.js';
import { backupStatus, open, seal } from '../../ops/continuity.js';
import { randomBytes } from 'node:crypto';

test('health and technical logs exclude private request and dependency data', async () => {
  const server=Fastify(), lines: string[]=[];
  let available=true;
  operations(server,async()=>{if(!available)throw Error('password=PRIVATE-DEPENDENCY');},line=>lines.push(line));
  server.get('/thing/:id',async()=>({ok:true}));
  try {
    assert.equal((await server.inject('/health/live')).statusCode,200);
    assert.equal((await server.inject('/health/ready')).statusCode,200);
    available=false;
    const fail=await server.inject('/health/ready');
    assert.equal(fail.statusCode,503);
    assert.deepEqual(fail.json(),{status:'unavailable'});
    await server.inject({url:'/thing/PRIVATE-ID?q=PRIVATE-QUERY',headers:{authorization:'PRIVATE-TOKEN',cookie:'PRIVATE-COOKIE'}});
    await server.inject('/PRIVATE-UNKNOWN');
    assert(!lines.join('').includes('PRIVATE'));
    assert.equal(JSON.parse(lines[3]).route,'/thing/:id');
    assert.equal(JSON.parse(lines[4]).route,'unmatched');
    assert.deepEqual(Object.keys(JSON.parse(lines[0])),['time','event','requestId','method','route','status','durationMs']);
  } finally {await server.close();}
});

test('encrypted rehearsal backup rejects tampering, truncation and wrong key',()=>{
  const key=randomBytes(32),plain=Buffer.from('synthetic archive');
  const encrypted=seal(plain,key);
  assert.deepEqual(open(encrypted,key),plain);
  assert.throws(()=>open(encrypted,randomBytes(32)));
  const corrupt=Buffer.from(encrypted);corrupt[corrupt.length-1]^=1;
  assert.throws(()=>open(corrupt,key));
  assert.throws(()=>open(encrypted.subarray(0,20),key));
});

test('backup failure and clock errors cannot hide RPO ageing',()=>{
  const last='2026-11-01T00:00:00Z';
  const at=(h:number)=>new Date(Date.parse(last)+h*3_600_000);
  for(const [h,status] of [[0,'OK'],[143,'OK'],[144,'WARNING'],[160,'CRITICAL'],[168,'BREACH'],[200,'BREACH']] as const)
    assert.equal(backupStatus(last,at(h)),status);
  assert.equal(backupStatus(last,at(100),true),'FAIL');
  assert.equal(backupStatus(last,at(169),true),'BREACH');
  assert.equal(backupStatus(null,at(0)),'BLOCKED');
  assert.equal(backupStatus('bad',at(0)),'BLOCKED');
  assert.equal(backupStatus(last,at(-1)),'BLOCKED');
});
