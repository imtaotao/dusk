import { WxPage } from '../core/overidde-component';
declare const _default: {
    once: <T extends (...args: any[]) => any>(fn: T) => T;
    createWraper: <T_1 extends (...args: any[]) => any>(target?: T_1 | undefined, before?: T_1 | undefined, after?: T_1 | undefined) => T_1;
    uuid(): string;
    unid(): string;
    randomId(max?: number, min?: number, fraction?: number): string;
    getCurrentPage(): WxPage | null;
};
export default _default;
