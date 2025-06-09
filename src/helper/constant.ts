export const secret="secondbrain"

export function genrate( len:number){
    const provided="abcdefghijklmnopqrstuvwxyz"
    const length=provided.length;
    let hash:String=""
    for(let i=0;i<len;i++){
        hash+=provided[Math.floor(Math.random()*length)]
    }
    // console.log(hash)
    return hash;
}