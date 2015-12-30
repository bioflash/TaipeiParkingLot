export default function(){
    return function(str, length){
        if (str.length>=length+3){
        return str.substr(0, length-3)+"..."
        }else if (str.length===length+2){
            return str.substr(0, length-2)+".."
        }else if (str.length===length+1){
            return str.substr(0, length-1)+"."
        }else {
            return str
        }    
    }
    
}