import Dusk from '../core/dusk';
import Event from '../share/event';
import { WxPage, WxComponent } from '../core/overidde-component';
interface Target {
    id: string;
    offsetLeft: number;
    offsetTop: number;
    dataset: {
        [key: string]: any;
    };
}
interface Touches {
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
    force: number;
    identifier: number;
}
export interface WxEvent {
    type: string;
    target: Target;
    timeStamp: number;
    currentTarget?: Target;
    touches: Array<Touches>;
    changedTouches: Array<Touches>;
    mark?: {
        [key: string]: any;
    };
    detail: {
        x: number;
        y: number;
    };
}
interface ExpandMethods {
    duskEvent(e: WxEvent): void;
    methods?: {
        duskEvent(e: WxEvent): void;
    };
}
export declare function expandExtrcMethods(dusk: Dusk, config: ExpandMethods & Object, isPage: boolean): void;
export default class Template extends Event {
    acceptDuskEvent(component: WxPage | WxComponent, e: WxEvent, isPage: boolean): void;
}
export {};
