function getElementsById(nameArray) {
    returnValue = [];
    for(var i = 0; i < nameArray.length; ++i) {
        returnValue.push(document.getElementById(nameArray[i]));
    }
    return returnValue;
}

function shallowCopy(source) {
    return Object.assign({}, source);
}