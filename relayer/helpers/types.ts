interface Metadata  { 
    name: string, 
    decription: string, 
    image: string, 
    attributes: {[key: string]: string}
 } 

 interface AptosPaylaod {
   toContractId: string,
    token: string,
     tokenId:number, 
     receiver :string
 }

 export {
    Metadata,
    AptosPaylaod
 }