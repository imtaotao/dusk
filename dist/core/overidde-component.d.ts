import Dusk from './dusk';
export interface WxPage {
    dusk: Dusk;
    route: string;
    setData: (data: Object, callback?: Function) => void;
}
export interface WxComponent {
    dusk: Dusk;
    setData: (data: Object, callback?: Function) => void;
}
export declare function overideApp(dusk: Dusk, config: Object): Object;
export declare function overidePage(dusk: Dusk, config: Object): Object;
export declare function overideComponent(dusk: Dusk, config: {
    lifetimes: Object;
}): {
    lifetimes: Object;
};
