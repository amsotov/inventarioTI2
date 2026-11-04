let pendingHash:string|null=null;
export const beginModelCommand=()=>{pendingHash=location.hash;};
export const endModelCommand=()=>{pendingHash=null;};
export const hasPendingModelCommand=()=>pendingHash!==null;
export function protectModelNavigation() {
 if(pendingHash!==null&&location.hash!==pendingHash){history.replaceState(null,'',pendingHash);return true;}
 return false;
}
