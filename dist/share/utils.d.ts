export declare const warning: (message: string, iswarning?: boolean | undefined) => void;
export declare const assert: (condition: boolean, error: string) => void;
export declare const isUndef: (v: any) => boolean;
export declare const once: <T extends (...args: any[]) => any>(fn: T) => T;
export declare const mapObject: <T, K extends (key: keyof T, val: any) => any>(obj: T, callback: K) => { [key in keyof T]: ReturnType<K>; };
export declare const remove: (list: any[], item: any) => void;
export declare const createWraper: <T extends (...args: any[]) => any>(target?: T | undefined, before?: T | undefined, after?: T | undefined) => T;
export declare const isPlainObject: (obj: any) => boolean;
