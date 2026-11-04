import{createServer,type Socket}from'node:net';
/** SMTP de captura local: no autentica ni reenvía mensajes a ningún destinatario externo. */
export async function smtpCapture(){
 const messages:string[]=[],sockets=new Set<Socket>();const server=createServer(socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));socket.write('220 local-test SMTP\r\n');let buffer='',data=false,mail:string[]=[];socket.on('data',chunk=>{buffer+=chunk.toString();let index;while((index=buffer.indexOf('\r\n'))>=0){const line=buffer.slice(0,index);buffer=buffer.slice(index+2);if(data){if(line==='.') {messages.push(mail.join('\r\n'));mail=[];data=false;socket.write('250 accepted\r\n');}else mail.push(line.startsWith('..')?line.slice(1):line);continue;}const cmd=line.split(' ')[0].toUpperCase();if(cmd==='EHLO'||cmd==='HELO')socket.write('250-local-test\r\n250 8BITMIME\r\n');else if(cmd==='DATA'){data=true;socket.write('354 send data\r\n');}else if(cmd==='QUIT'){socket.end('221 bye\r\n');}else if(['MAIL','RCPT','RSET','NOOP'].includes(cmd))socket.write('250 ok\r\n');else socket.write('502 unsupported\r\n');}});});
 await new Promise<void>(r=>server.listen(0,'0.0.0.0',r));const address=server.address();if(!address||typeof address==='string')throw Error('SMTP_NOT_READY');
 return{port:address.port,messages,async next(after:number){for(let n=0;n<100;n++){if(messages.length>after)return messages[after];await new Promise(r=>setTimeout(r,100));}throw Error('LOCAL_SMTP_TIMEOUT');},async close(){for(const socket of sockets)socket.destroy();await new Promise<void>(r=>server.close(()=>r()));}};
}
export function mailActionLink(raw:string){
 const decoded=raw.replace(/=\r?\n/g,'').replace(/=([a-f0-9]{2})/gi,(_m,h)=>String.fromCharCode(parseInt(h,16))).replaceAll('&amp;','&');
 for(const match of decoded.matchAll(/href=["']([^"']+)["']/gi)){try{const link=new URL(match[1]);if(link.pathname.endsWith('/verify'))return link;}catch{}}throw Error('LOCAL_MAIL_LINK_MISSING');
}
