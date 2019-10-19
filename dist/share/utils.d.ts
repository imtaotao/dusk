export declare const warn: (message: string, isWarn?: boolean | undefined) => void;
export declare const assert: (condition: boolean, error: string) => void;
export declare const isUndef: (v: any) => boolean;
export declare const once: <T extends (...args: any[]) => any>(fn: T) => T;
export declare const callHook: (hooks: Object | null | undefined, name: string, params: any[]) => any;
export declare const remove: (list: any[], item: any) => void;
export declare const createWraper: <T extends (...args: any[]) => any>(target?: T | undefined, before?: T | undefined, after?: T | undefined) => T;
export declare const isPlainObject: (obj: any) => boolean;
