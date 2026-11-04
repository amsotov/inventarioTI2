/** La alternativa por correo se activa expresamente para el laboratorio autorizado. */
export function authenticationMethod(env:NodeJS.ProcessEnv):'mfa'|'email-otp' {
 if(!env.AUTHENTICATION_METHOD||env.AUTHENTICATION_METHOD==='mfa')return 'mfa';
 if(env.AUTHENTICATION_METHOD!=='email-otp'||env.APP_ENV!=='staging'||env.SUPABASE_PROJECT_REF!=='yhsfotxhaptinjtmrinn'||env.SUPABASE_URL!=='https://yhsfotxhaptinjtmrinn.supabase.co')throw Error('INVALID_EMAIL_AUTH_CONFIGURATION');
 return 'email-otp';
}
