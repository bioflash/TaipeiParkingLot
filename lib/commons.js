
//This is the library of common utility functions. It should be independent of executing env. Such that can only use javascript native functions


module.exports = {
    /*deepCreateObject
     *
     *  Create the object with given structure
     *
     * @params {String} structure  --- Specifies the structure of the create object
     * @params {String|Object|Array} initalVal  --- The inital value of the created object. If created with deepCreateObject('foo1.bar2.foo2', '123'). Then the object foo1[bar2][foo2]=123 is returned
     */
    deepCreateObject: function(structure, initialVal){
        if (typeof structure!=="string" 
            ||structure.substring(structure.length-1)==='.'
            ||structure.indexOf('.')===0 
            ||structure.indexOf('[')>=0 
            ||structure.indexOf(']')>=0) throw new Error("The format of 1st parameter should a string like 'foo.bar'")

        var f = function(structure,initalVal){
            var components = structure.split(/\./);
            if (components.length>1){
                var result = {};
                result[components[0]] = f(components.slice(1).join("."), initalVal)
                return result
            }else{
                var result = {};
                result[components[0]] = initalVal;
                return result;
            }
        }
        return f(structure, initialVal)    
    },

    wrapError: function(error, message){
        error.message = message +" [caused by]\n "+error.message;
        return error
    }
}
