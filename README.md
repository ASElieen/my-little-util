# my-little-util
一个简单的个人自用JS库

## 防抖 debounce

**testCase**:

```javascript
const testContainer = document.querySelector('.testContainer');
let num = 0;

const testCase = (e) => {
    // console.log(this) =>调用防抖后指向window
    // console.log(e); =>防抖后为undefined
    console.log(num++);
}

let test = debounce(testCase, 3000, true);
testContainer.addEventListener('mousemove', test);
```

**核心部分**

return function()如果使用return ()=>{}会使this指向window

```javascript
const debounce = (fn,wait)=>{
    let timeout;
    return function(){
        clearTimeout(timeout);
        timeout = setTimeout(fn,wait);
    }
}
```

**修改指向**

因为testcase中存在this和e的指向问题,用apply改一下

```javascript
const debounce = (fn,wait)=>{
    let timeout;
    return function(){
        let context =this;
        let args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(()=>{
            fn.apply(context,args);
        },wait);
    }
}
```

**点击时立即执行一次**

第一次点击时立即执行不需要等事件停止触发，补一个判定参数，同时用...args来替换掉let args = arguments;

```javascript
const debounce = (fn,wait,imme){
    let timeout;//=>undefined
    return function(...args){
        let context = this;
        if(imme){
            let immeExecute = !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(()=>{
                fn.apply(context,args);
            },wait);
            if(immeExecute) fn(...args);
        }else{
             clearTimeout(timeout);
            timeout = setTimeout(()=>{
                fn.apply(context,args);
            },wait);
        }
    }
}
```

## 节流 Throttle

**简单实现**

触发事件且定时器不存在时设置一个定时器，当该定时器执行完成后会清空定时器，这时才会设置下一个定时器，即再次执行该事件

```javascript
const throttle = (fn, wait) => {
    let timeout,context;

    return function() {
        context = this;
        args = arguments;
        if (!timeout) {
            timeout = setTimeout(() => {
                timeout = null;
                fn.apply(context, args);
            }, wait)
        }
    }
```

简单实现的节流触发事件时并不会立即执行，但是停止触发时等待设置时间后会再进行一次事件的执行



**需要开头立即触发的情况**

通过设置时间戳，当now-previous>wait时立即执行，previous为0的初始情况下，会将当前时间赋值给previous并立即执行一次fn。随后再次触发事件，此时进入else if分支。随后由于每次later()的执行都重置了previous，使得remaining一直>0，循环else if分支。

else if分支和简单实现一样，会在停止触发事件时等待对应时间后执行最后一次fn

```javascript
const throttle = (fn, wait) => {
    let timeout, context, args;
    let previous = 0;

    const later = function() {
        previous = +new Date();
        timeout = null;
        fn.apply(context, args)
    };

    const throttled = function() {
        //隐式转换 将+后的类型转换为Number类型 记录当前时间戳
        let now = +new Date();
        //下次触发fn剩余时间
        let remaining = wait - (now - previous);
        context = this;
        args = arguments;
        //没有剩余时间或者客户端的事件被调整过
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                //解除引用防止内存泄漏
                timeout = null;
            }
            previous = now;
            fn.apply(context, args);
        } else if (!timeout) {
            timeout = setTimeout(later, remaining)
        }
    };
    return throttled;
}

```

**不要头或者不要尾**

在头尾均触发的情况下引入options对象，通过该对象来控制开始时的回调和结束时的回调，对previous的值和进入else if分支的条件做些改动即可

```javascript
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
```

