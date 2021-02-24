import { Fn, MaybePromise, PromiseOnce, PromiseContent } from './types'

export type Finalize<F extends Fn, R extends Fn> = {
  <H extends (...args: any[]) => MaybePromise<Parameters<R>[0]>>(handler: H): (
    ...args: Parameters<H>
  ) => // SomePromise<[ReturnType<H>, ReturnType<R>]> extends Promise<any> ? PromiseOnce<ReturnType<F>> : ReturnType<F>
  ReturnType<H> extends Promise<any>
    ? PromiseOnce<ReturnType<F>>
    : ReturnType<R> extends Promise<any>
    ? PromiseOnce<ReturnType<F>>
    : ReturnType<F>
  <T extends PromiseContent<ReturnType<F>>>(
    handler: () => MaybePromise<Parameters<R>[0]>
  ): () => // SomePromise<[ReturnType<typeof handler>, ReturnType<R>]> extends Promise<any> ? PromiseOnce<T> : T
  ReturnType<typeof handler> extends Promise<any>
    ? PromiseOnce<T>
    : ReturnType<R> extends Promise<any>
    ? PromiseOnce<T>
    : T
  <A, T extends PromiseContent<ReturnType<F>>>(handler: (arg: A) => MaybePromise<Parameters<R>[0]>): (
    arg: A
  ) => // SomePromise<[ReturnType<typeof handler>, ReturnType<R>]> extends Promise<any> ? PromiseOnce<T> : T
  ReturnType<typeof handler> extends Promise<any>
    ? PromiseOnce<T>
    : ReturnType<R> extends Promise<any>
    ? PromiseOnce<T>
    : T
}

export const finalizr = <F extends Fn>(finalizer: F) => <R extends (...args: any[]) => MaybePromise<Parameters<F>[0]>>(resolver: R): Finalize<F, R> => <
  H extends (...args: any[]) => MaybePromise<Parameters<R>[0]>
>(
  handler: H
) => (...args: Parameters<H>) => {
  const r0 = handler(...args)
  if (r0 instanceof Promise) {
    return r0.then(resolver).then(finalizer)
  } else {
    const r1 = resolver(r0)
    if (r1 instanceof Promise) {
      return r1.then(finalizer)
    } else {
      return finalizer(r1)
    }
  }
}
