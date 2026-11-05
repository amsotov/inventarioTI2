export class AuthError extends Error {constructor(readonly status:number,readonly code:string){super(code);}}
