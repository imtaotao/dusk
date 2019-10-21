import Dusk from '../core/dusk';
import Event from '../share/event';
interface ExpandMethods {
    duskEvent(e: any): void;
    methods?: {
        duskEvent(e: any): void;
    };
}
export declare function expandExtrcMethods(dusk: Dusk, config: ExpandMethods & Object, isPage: boolean): void;
export default class Template extends Event {
}
export {};
