const encoder=new TextEncoder();
const encode=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
function decode(hex){
 if(typeof hex!=='string'||hex.length%2||!/^[a-f0-9]+$/.test(hex))throw Error('Invalid backup.');
 return Uint8Array.from(hex.match(/../g),s=>parseInt(s,16));
}
async function key(password,salt){
 const material=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:600000},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function seal(data,password){
 if(password.length<12)throw Error('Use a passphrase of at least 12 characters.');
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(password,salt),encoder.encode(JSON.stringify(data)));
 return JSON.stringify({version:1,salt:encode(salt),iv:encode(iv),cipher:encode(new Uint8Array(cipher))});
}
export async function openVault(raw,password){
 const v=JSON.parse(raw);
 if(v.version!==1||v.salt?.length!==32||v.iv?.length!==24)throw Error('Unsupported backup.');
 const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(v.iv)},await key(password,decode(v.salt)),decode(v.cipher));
 return JSON.parse(new TextDecoder().decode(bytes));
}
