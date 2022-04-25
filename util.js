const debounce = (fn, wait, imme) => {
    let timeout;
    return function(...args) {
        // console.log(this);
        let context = this;
        // let arg = arguments;
        if (imme) {
            let immeExecute = !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // console.log(context)
                fn.apply(context, args); //修改fn中指向window的this和underfine的e
            }, wait);
            if (immeExecute) fn(...args);
        } else {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // console.log(context)
                fn.apply(context, arg); //修改fn中指向window的this和underfine的e
            }, wait);
        }
    }
}