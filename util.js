/**
 * @description 防抖
 * @param {需要进行防抖的函数} fn 
 * @param {等待时间} wait 
 * @param {第一次是否立即执行} imme 
 * @returns 
 */
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



/**
 * @description 节流函数 options中leading为头 trailing为尾
 * @param {需要节流的函数} fn 
 * @param {等待时间} wait 
 * @param {是否需要立即执行或者取消触发事件后的那次回调 传入{leading:false}或{trailing:false}} options 
 * @returns 
 */
const optionsThrottled = (fn, wait, options) => {
    let timeout, context, args;
    let previous = 0;
    if (!options) options = {};

    let later = function() {
        //若不要开头回调，则每次调用later时将previous置为0
        previous = options.leading === false ? 0 : new Date().getTime();
        timeout = null;
        fn.apply(context, args);
        if (!timeout) context = args = null;
    };

    let throttled = function() {
        let now = new Date().getTime();
        //previous初始值为0且取消首次触发的回调时 将previous置为当前时间
        //之后remaining为wait 会进入else if分支
        if (!previous && options.leading === false) previous = now;
        let remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            fn.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
    };
    return throttled;
}