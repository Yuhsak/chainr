export type Fn = (...args: any[]) => any
export type SomePromise<T extends any[]> = Extract<T[number], Promise<any>>
export type MaybePromise<T> = Promise<T> | T
export type PromiseContent<T> = T extends Promise<infer U> ? U : T
export type PromiseOnce<T> = T extends boolean ? Promise<boolean> : T extends Promise<any> ? T : Promise<T>
