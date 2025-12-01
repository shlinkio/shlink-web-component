import type { IContainer } from 'bottlejs';
import Bottle from 'bottlejs';
import { connect as reduxConnect } from 'react-redux';
import { provideServices as provideDomainsServices } from '../domains/services/provideServices';
import { provideServices as provideOverviewServices } from '../overview/services/provideServices';
import { provideServices as provideRedirectRulesServices } from '../redirect-rules/services/provideServices';
import { provideServices as provideShortUrlsServices } from '../short-urls/services/provideServices';
import { provideServices as provideTagsServices } from '../tags/services/provideServices';
import { provideServices as provideUtilsServices } from '../utils/services/provideServices';
import { provideServices as provideVisitsServices } from '../visits/services/provideServices';
import { provideServices as provideWebComponentServices } from './provideServices';

type AnyFunction = (...any: unknown[]) => unknown;

type LazyActionMap = Record<string, AnyFunction>;

// FIXME Change this API to be (options: { props: string[] | null; actions?: string[] }) => any;
export type ConnectDecorator = (props: string[] | null, actions?: string[]) => any;

export const bottle = new Bottle();

export const { container } = bottle;

const pickProps = (propsToPick: string[]) => (obj: any) => Object.fromEntries(
  propsToPick.map((key) => [key, obj[key]]),
);

const lazyService = <T extends AnyFunction, K>(cont: IContainer, serviceName: string) =>
  (...args: any[]) => (cont[serviceName] as T)(...args) as K;
const mapActionService = (map: LazyActionMap, actionName: string): LazyActionMap => ({
  ...map,
  // Wrap actual action service in a function so that it is lazily created the first time it is called
  [actionName]: lazyService(container, actionName),
});
const connect: ConnectDecorator = (propsFromState: string[] | null, actionServiceNames: string[] = []) =>
  reduxConnect(
    propsFromState ? pickProps(propsFromState) : null,
    actionServiceNames.reduce(mapActionService, {}),
  );

provideWebComponentServices(bottle);
provideShortUrlsServices(bottle, connect);
provideTagsServices(bottle);
provideVisitsServices(bottle, connect);
provideDomainsServices(bottle);
provideOverviewServices(bottle);
provideUtilsServices(bottle);
provideRedirectRulesServices(bottle, connect);
