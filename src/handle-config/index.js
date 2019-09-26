import { warn } from "../utils";

export function onLoad(sdk, currentComponent, SDKConfig, isPage) {
    // SDKConfig.onLoad.report1.fn.call(sdk, component)
    const onLoadFns = SDKConfig.onLoad
    for (const key in onLoadFns) {
        if (onLoadFns.hasOwnProperty(key) && typeof onLoadFns[key] === 'function') {
            onLoadFns[key](sdk, currentComponent)
        }
    }
}

export function onShow(sdk, currentComponent, SDKConfig, isPage) {
    const onShowFns = SDKConfig.onShow
    for (const key in onShowFns) {
        if (onShowFns.hasOwnProperty(key) && typeof onShowFns[key] === 'function') {
            onShowFns[key](sdk, currentComponent)
        }
    }
}

export function unLoad(sdk, component, SDKConfig, isPage) {

}
