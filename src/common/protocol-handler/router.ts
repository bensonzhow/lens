/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { match, matchPath } from "react-router";
import { countBy } from "lodash";
import { iter, Singleton } from "../utils";
import { pathToRegexp } from "path-to-regexp";
import logger from "../../main/logger";
import type Url from "url-parse";
import { RoutingError, RoutingErrorType } from "./error";
import { ExtensionsStore } from "../../extensions/extensions-store";
import { ExtensionLoader } from "../../extensions/extension-loader";
import type { LensExtension } from "../../extensions/lens-extension";
import type { RouteHandler, RouteParams } from "../../extensions/registries/protocol-handler";
import { when } from "mobx";
import { ipcRenderer } from "electron";

// IPC channel for protocol actions. Main broadcasts the open-url events to this channel.
export const ProtocolHandlerIpcPrefix = "protocol-handler";

export const ProtocolHandlerInternal = `${ProtocolHandlerIpcPrefix}:internal`;
export const ProtocolHandlerExtension = `${ProtocolHandlerIpcPrefix}:extension`;
export const ProtocolHandlerInvalid = `${ProtocolHandlerIpcPrefix}:invalid`;

/**
 * These two names are long and cumbersome by design so as to decrease the chances
 * of an extension using the same names.
 *
 * Though under the current (2021/01/18) implementation, these are never matched
 * against in the final matching so their names are less of a concern.
 */
export const EXTENSION_PUBLISHER_MATCH = "LENS_INTERNAL_EXTENSION_PUBLISHER_MATCH";
export const EXTENSION_NAME_MATCH = "LENS_INTERNAL_EXTENSION_NAME_MATCH";

/**
 * Returned from routing attempts
 */
export enum RouteAttempt {
  /**
   * A handler was found in the set of registered routes
   */
  MATCHED = "matched",
  /**
   * A handler was not found within the set of registered routes
   */
  MISSING = "missing",
  /**
   * The extension that was matched in the route was not activated
   */
  MISSING_EXTENSION = "no-extension",
}

export function foldAttemptResults(mainAttempt: RouteAttempt, rendererAttempt: RouteAttempt): RouteAttempt {
  switch (mainAttempt) {
    case RouteAttempt.MATCHED:
      return RouteAttempt.MATCHED;
    case RouteAttempt.MISSING:
    case RouteAttempt.MISSING_EXTENSION:
      return rendererAttempt;
  }
}

export abstract class LensProtocolRouter extends Singleton {
  // Map between path schemas and the handlers
  protected internalRoutes = new Map<string, RouteHandler>();

  public static readonly LoggingPrefix = "[PROTOCOL ROUTER]";

  static readonly ExtensionUrlSchema = `/:${EXTENSION_PUBLISHER_MATCH}(@[A-Za-z0-9_]+)?/:${EXTENSION_NAME_MATCH}`;

  /**
   * Attempts to route the given URL to all internal routes that have been registered
   * @param url the parsed URL that initiated the `lens://` protocol
   * @returns true if a route has been found
   */
  protected _routeToInternal(url: Url<Record<string, string>>): RouteAttempt {
    return this._route(this.internalRoutes.entries(), url);
  }

  /**
   * match against all matched URIs, returning either the first exact match or
   * the most specific match if none are exact.
   * @param routes the array of path schemas, handler pairs to match against
   * @param url the url (in its current state)
   */
  protected _findMatchingRoute(routes: Iterable<[string, RouteHandler]>, url: Url<Record<string, string>>): null | [match<Record<string, string>>, RouteHandler] {
    const matches: [match<Record<string, string>>, RouteHandler][] = [];

    for (const [schema, handler] of routes) {
      const match = matchPath(url.pathname, { path: schema });

      if (!match) {
        continue;
      }

      // prefer an exact match
      if (match.isExact) {
        return [match, handler];
      }

      matches.push([match, handler]);
    }

    // if no exact match pick the one that is the most specific
    return matches.sort(([a], [b]) => compareMatches(a, b))[0] ?? null;
  }

  /**
   * find the most specific matching handler and call it
   * @param routes the array of (path schemas, handler) pairs to match against
   * @param url the url (in its current state)
   */
  protected _route(routes: Iterable<[string, RouteHandler]>, url: Url<Record<string, string>>, extensionName?: string): RouteAttempt {
    const route = this._findMatchingRoute(routes, url);

    if (!route) {
      const data: Record<string, string> = { url: url.toString() };

      if (extensionName) {
        data.extensionName = extensionName;
      }

      logger.info(`${LensProtocolRouter.LoggingPrefix}: No handler found`, data);

      return RouteAttempt.MISSING;
    }

    const [match, handler] = route;

    const params: RouteParams = {
      pathname: match.params,
      search: url.query,
    };

    if (!match.isExact) {
      params.tail = url.pathname.slice(match.url.length);
    }

    handler(params);

    return RouteAttempt.MATCHED;
  }

  /**
   * Tries to find the matching LensExtension instance
   *
   * Note: this needs to be async so that `main`'s overloaded version can also be async
   * @param url the protocol request URI that was "open"-ed
   * @returns either the found name or the instance of `LensExtension`
   */
  protected async _findMatchingExtensionByName(url: Url<Record<string, string>>): Promise<LensExtension | string> {
    interface ExtensionUrlMatch {
      [EXTENSION_PUBLISHER_MATCH]: string;
      [EXTENSION_NAME_MATCH]: string;
    }

    const match = matchPath<ExtensionUrlMatch>(url.pathname, LensProtocolRouter.ExtensionUrlSchema);

    if (!match) {
      throw new RoutingError(RoutingErrorType.NO_EXTENSION_ID, url);
    }

    const { [EXTENSION_PUBLISHER_MATCH]: publisher, [EXTENSION_NAME_MATCH]: partialName } = match.params;
    const name = [publisher, partialName].filter(Boolean).join("/");
    const extensionLoader = ExtensionLoader.getInstance();

    try {
      /**
       * Note, if `getInstanceByName` returns `null` that means we won't be getting an instance
       */
      await when(() => extensionLoader.getInstanceByName(name) !== (void 0), { timeout: 5_000 });
    } catch(error) {
      logger.info(`${LensProtocolRouter.LoggingPrefix}: Extension ${name} matched, but not installed (${error})`);

      return name;
    }

    const extension = extensionLoader.getInstanceByName(name);

    if (!extension) {
      logger.info(`${LensProtocolRouter.LoggingPrefix}: Extension ${name} matched, but does not have a class for ${ipcRenderer ? "renderer" : "main"}`);

      return name;
    }

    if (!ExtensionsStore.getInstance().isEnabled(extension)) {
      logger.info(`${LensProtocolRouter.LoggingPrefix}: Extension ${name} matched, but not enabled`);

      return name;
    }

    logger.info(`${LensProtocolRouter.LoggingPrefix}: Extension ${name} matched`);

    return extension;
  }

  /**
   * Find a matching extension by the first one or two path segments of `url` and then try to `_route`
   * its correspondingly registered handlers.
   *
   * If no handlers are found or the extension is not enabled then `_missingHandlers` is called before
   * checking if more handlers have been added.
   *
   * Note: this function modifies its argument, do not reuse
   * @param url the protocol request URI that was "open"-ed
   */
  protected async _routeToExtension(url: Url<Record<string, string>>): Promise<RouteAttempt> {
    const extension = await this._findMatchingExtensionByName(url);

    if (typeof extension === "string") {
      // failed to find an extension, it returned its name
      return RouteAttempt.MISSING_EXTENSION;
    }

    // remove the extension name from the path name so we don't need to match on it anymore
    url.set("pathname", url.pathname.slice(extension.name.length + 1));


    try {
      const handlers = iter.map(extension.protocolHandlers, ({ pathSchema, handler }) => [pathSchema, handler] as [string, RouteHandler]);

      return this._route(handlers, url, extension.name);
    } catch (error) {
      if (error instanceof RoutingError) {
        error.extensionName = extension.name;
      }

      throw error;
    }
  }

  /**
   * Add a handler under the `lens://app` tree of routing.
   * @param pathSchema the URI path schema to match against for this handler
   * @param handler a function that will be called if a protocol path matches
   */
  public addInternalHandler(urlSchema: string, handler: RouteHandler): this {
    pathToRegexp(urlSchema); // verify now that the schema is valid
    logger.info(`${LensProtocolRouter.LoggingPrefix}: internal registering ${urlSchema}`);
    this.internalRoutes.set(urlSchema, handler);

    return this;
  }

  /**
   * Remove an internal protocol handler.
   * @param pathSchema the path schema that the handler was registered under
   */
  public removeInternalHandler(urlSchema: string): void {
    this.internalRoutes.delete(urlSchema);
  }
}

/**
 * a comparison function for `array.sort(...)`. Sort order should be most path
 * parts to least path parts.
 * @param a the left side to compare
 * @param b the right side to compare
 */
function compareMatches<T>(a: match<T>, b: match<T>): number {
  if (a.path === "/") {
    return 1;
  }

  if (b.path === "/") {
    return -1;
  }

  return countBy(b.path)["/"] - countBy(a.path)["/"];
}
