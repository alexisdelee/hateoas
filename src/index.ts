interface HateoasOptions {
  baseUrl: string;
}

// Core types
type LinkRecord<K extends string> = Record<K, string>;
type SingleHandler<T extends object, K extends string> = T extends {
  links: any;
}
  ? never
  : (data: T) => LinkRecord<K>;
type CollectionHandler<T extends object, K extends string> = T extends {
  links: any;
}
  ? never
  : (data: T[]) => LinkRecord<K>;
type Handler<T extends object, K extends string> = SingleHandler<T, K> | CollectionHandler<T, K>;

// Type inference helpers
type InferHandlerData<H> = H extends SingleHandler<infer T, any>
  ? T
  : H extends CollectionHandler<infer T, any>
  ? T[]
  : never;
type InferHandlerLinks<H> = H extends Handler<any, infer K> ? K : never;

// Result types
type WithLinks<T extends object, K extends string> = T & {
  links: LinkRecord<K>;
};
interface LinkedCollection<T extends object, K extends string> {
  data: T[];
  links: LinkRecord<K>;
}

// Handler storage
type HandlerRecord = { [key: string]: Handler<any, string> };

interface HateoasInstance {
  registerLinkHandler<Type extends string, T extends object, K extends string>(
    type: Type,
    handler: SingleHandler<T, K>
  ): HateoasInstanceWithHandler<Record<Type, SingleHandler<T, K>>>;
  registerCollectionLinkHandler<Type extends string, T extends object, K extends string>(
    type: Type,
    handler: CollectionHandler<T, K>
  ): HateoasInstanceWithHandler<Record<Type, CollectionHandler<T, K>>>;
}

interface HateoasInstanceWithHandler<H extends HandlerRecord> {
  registerLinkHandler<Type extends string, T extends object, K extends string>(
    type: Type,
    handler: SingleHandler<T, K>
  ): HateoasInstanceWithHandler<H & Record<Type, SingleHandler<T, K>>>;
  registerCollectionLinkHandler<Type extends string, T extends object, K extends string>(
    type: Type,
    handler: CollectionHandler<T, K>
  ): HateoasInstanceWithHandler<H & Record<Type, CollectionHandler<T, K>>>;
  link<Type extends keyof H>(
    type: Type,
    data: InferHandlerData<H[Type]>
  ): H[Type] extends CollectionHandler<any, any>
    ? LinkedCollection<InferHandlerData<H[Type]>[number], InferHandlerLinks<H[Type]>>
    : WithLinks<InferHandlerData<H[Type]>, InferHandlerLinks<H[Type]>>;
}

function hateoas(options: HateoasOptions): HateoasInstance {
  const handlers: HandlerRecord = {};
  const baseUrl = options.baseUrl.endsWith("/") ? options.baseUrl.slice(0, -1) : options.baseUrl;

  function prefixLinks<K extends string>(links: LinkRecord<K>): Record<K, string> {
    return (Object.entries(links) as [K, string][]).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value.startsWith("/") ? `${baseUrl}${value}` : `${baseUrl}/${value}`,
      }),
      {} as Record<K, string>
    );
  }

  function registerLinkHandler<Type extends string, T extends object, K extends string>(
    type: Type,
    handler: SingleHandler<T, K>
  ): HateoasInstanceWithHandler<Record<Type, SingleHandler<T, K>>> {
    handlers[type] = handler;
    return instance as HateoasInstanceWithHandler<Record<Type, SingleHandler<T, K>>>;
  }

  function registerCollectionLinkHandler<Type extends string, T extends object, K extends string>(
    type: Type,
    handler: CollectionHandler<T, K>
  ): HateoasInstanceWithHandler<Record<Type, CollectionHandler<T, K>>> {
    handlers[type] = handler;
    return instance as HateoasInstanceWithHandler<Record<Type, CollectionHandler<T, K>>>;
  }

  function link<T extends object, K extends string>(
    type: string,
    data: T | T[]
  ): WithLinks<T, K> | LinkedCollection<T, K> {
    if (Array.isArray(data)) {
      const handler = handlers[type] as CollectionHandler<T, K>;
      return {
        data,
        links: prefixLinks(handler(data)),
      } as LinkedCollection<T, K>;
    }

    const handler = handlers[type] as SingleHandler<T, K>;
    return {
      ...data,
      links: prefixLinks(handler(data)),
    } as WithLinks<T, K>;
  }

  const instance = {
    registerLinkHandler,
    registerCollectionLinkHandler,
    link,
  } as HateoasInstance;

  return instance;
}

export default hateoas;
