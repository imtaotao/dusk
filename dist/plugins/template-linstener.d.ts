import Dusk from '../core/dusk';
import { WxEvent } from '../modules/template';
import { WxPage, WxComponent } from '../core/overidde-component';
interface Options {
    sendData(data: Object, detail: () => DetailResult): Object;
}
interface DetailResult {
    isPage: boolean;
    event: WxEvent;
    component: WxPage | WxComponent;
}
export declare function listenerButton(dusk: Dusk, options: Options): void;
export {};
