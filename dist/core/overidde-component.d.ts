import SDK from './sdk';
export interface Page {
    SDK: SDK;
    setData: (data: Object, callback?: Function) => void;
}
export interface Component {
    SDK: SDK;
    setData: (data: Object, callback?: Function) => void;
}
export declare function overideApp(sdk: SDK, config: Object): Object;
export declare function overidePage(sdk: SDK, config: Object): Object;
export declare function overideComponent(sdk: SDK, config: {
    lifetimes: Object;
}): {
    lifetimes: Object;
};
