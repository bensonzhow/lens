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

import EventEmitter from "events";
import type TypedEmitter from "typed-emitter";
import { observable, makeObservable } from "mobx";
import { once } from "lodash";
import { iter, Disposer } from "../utils";

export type ExtractEntityMetadataType<Entity> = Entity extends CatalogEntity<infer Metadata> ? Metadata : never;
export type ExtractEntityStatusType<Entity> = Entity extends CatalogEntity<any, infer Status> ? Status : never;
export type ExtractEntitySpecType<Entity> = Entity extends CatalogEntity<any, any, infer Spec> ? Spec : never;

export type CatalogEntityConstructor<Entity extends CatalogEntity> = (
  (new (data: CatalogEntityData<
    ExtractEntityMetadataType<Entity>,
    ExtractEntityStatusType<Entity>,
    ExtractEntitySpecType<Entity>
  >) => Entity)
);

export interface CatalogCategoryVersion<Entity extends CatalogEntity> {
  name: string;
  entityClass: CatalogEntityConstructor<Entity>;
}

export interface CatalogCategorySpec {
  group: string;
  versions: CatalogCategoryVersion<CatalogEntity>[];
  names: {
    kind: string;
  };
}

/**
 * If the filter returns true, the menu item is displayed
 */
export type AddMenuFilter = (menu: CatalogEntityAddMenu) => any;

/**
 * The events that can be emitted onto a catalog category
 */
export interface CatalogCategoryEvents {
  /**
   * An event which is emitted when the category becomes active on the catalog
   * view.
   */
  load: () => void;

  /**
   * An event which is emitted when the menu for adding new catalog entities
   * is opened.
   * @param context The event context
   */
  catalogAddMenu: (context: CatalogEntityAddMenuContext) => void;

  /**
   * An event which is emitted when the context menu on a entity versioned by
   * this category is opened.
   * @param entity The entity that was opened
   * @param context The event context
   */
  contextMenuOpen: (entity: CatalogEntity, context: CatalogEntityContextMenuContext) => void;
}

/**
 * A declartion of supported versions a specific kind of CatalogEntity
 */
export abstract class CatalogCategory extends (EventEmitter as new () => TypedEmitter<CatalogCategoryEvents>) {
  abstract readonly apiVersion: string;
  abstract readonly kind: string;
  abstract metadata: {
    name: string;
    icon: string;
  };
  abstract spec: CatalogCategorySpec;

  protected filters = observable.set<AddMenuFilter>([], {
    deep: false,
  });

  static parseId(id = ""): { group?: string, kind?: string } {
    const [group, kind] = id.split("/") ?? [];

    return { group, kind };
  }

  public getId(): string {
    return `${this.spec.group}/${this.spec.names.kind}`;
  }

  /**
   * Add a filter for menu items of catalogAddMenu
   * @param fn The function that should return a truthy value if that menu item should be displayed
   * @returns A function to remove that filter
   */
  public addMenuFilter(fn: AddMenuFilter): Disposer {
    this.filters.add(fn);

    return once(() => void this.filters.delete(fn));
  }

  /**
   * Filter menuItems according to the Category's set filters
   * @param menuItems menu items to filter
   * @returns filtered menu items
   */
  public filteredItems(menuItems: CatalogEntityAddMenu[]) {
    return Array.from(
      iter.reduce(
        this.filters,
        iter.filter,
        menuItems.values(),
      ),
    );
  }
}

export interface CatalogEntityMetadata {
  uid: string;
  name: string;
  description?: string;
  source?: string;
  labels: Record<string, string>;
  [key: string]: string | object;
}

/**
 * The minimal information that all entities must use to describe their current status
 */
export interface CatalogEntityStatus {
  phase: string;
  reason?: string;

  /**
   * @default true
   */
  enabled?: boolean;
  message?: string;
  active?: boolean;
}

/**
 * The event context for when an entity is activated
 */
export interface CatalogEntityActionContext {
  /**
   * A function to navigate around the application
   * @param pathname The path to navigate to
   */
  navigate: (pathname: string) => void;

  /**
   * A function to change the active entity for the command palette
   */
  setCommandPaletteContext: (entity?: CatalogEntity) => void;
}

/**
 * The descriptor for entities' context menus and detail panels' topbars
 */
export interface CatalogEntityContextMenu {
  /**
   * When in a context menu, the text displayed
   */
  title: string;

  /**
   * When in a toolbar the icon's material or svg data
   *
   * If not present then this item will not be displayed in the toolbar
   */
  icon?: string;

  /**
   * The function that will be called when the menu item is clicked
   */
  onClick: () => void | Promise<void>;

  /**
   * If present then a confirmation dialog will be displayed to the user with
   * the given message before the `onClick` handler is called.
   */
  confirm?: {
    message: string;
  }
}

/**
 * The context type for the add menu event in the catalog view
 */
export interface CatalogEntityAddMenu extends CatalogEntityContextMenu {
  /**
   * The icon's material or svg data for the menu item.
   */
  icon: string;

  /**
   * If this menu item should be the default action. If multiple items are
   * declared as the default one then none are executed.
   */
  defaultAction?: boolean;
}

/**
 * The context type for entity context menus and drawer detail topbar menus
 */
export interface CatalogEntityContextMenuContext {
  /**
   * A function to navigate around the application
   * @param pathname The path to navigate to
   */
  navigate: (pathname: string) => void;

  /**
   * The output array of items
   */
  menuItems: CatalogEntityContextMenu[];
}

/**
 * @deprecated Not used
 */
export interface CatalogEntitySettingsContext {
  /**
   * The output array of items
   */
  menuItems: CatalogEntityContextMenu[];
}

export interface CatalogEntityAddMenuContext {
  /**
   * A function to navigate around the application
   * @param pathname The path to navigate to
   */
  navigate: (url: string) => void;

  /**
   * The output array of items
   */
  menuItems: CatalogEntityAddMenu[];
}

export type CatalogEntitySpec = Record<string, any>;


export interface CatalogEntityData<
  Metadata extends CatalogEntityMetadata = CatalogEntityMetadata,
  Status extends CatalogEntityStatus = CatalogEntityStatus,
  Spec extends CatalogEntitySpec = CatalogEntitySpec,
> {
  metadata: Metadata;
  status: Status;
  spec: Spec;
}

export interface CatalogEntityKindData {
  readonly apiVersion: string;
  readonly kind: string;
}

export abstract class CatalogEntity<
  Metadata extends CatalogEntityMetadata = CatalogEntityMetadata,
  Status extends CatalogEntityStatus = CatalogEntityStatus,
  Spec extends CatalogEntitySpec = CatalogEntitySpec,
> implements CatalogEntityKindData {
  public abstract readonly apiVersion: string;
  public abstract readonly kind: string;

  @observable metadata: Metadata;
  @observable status: Status;
  @observable spec: Spec;

  constructor(data: CatalogEntityData<Metadata, Status, Spec>) {
    makeObservable(this);
    this.metadata = data.metadata;
    this.status = data.status;
    this.spec = data.spec;
  }

  /**
   * A convenience function for getting the entity ID
   */
  public getId(): string {
    return this.metadata.uid;
  }

  /**
   * A convenience function for getting the entity name
   */
  public getName(): string {
    return this.metadata.name;
  }

  /**
   * The function that will be called when the entity is activated
   */
  public abstract onRun?(context: CatalogEntityActionContext): void | Promise<void>;

  /**
   * The function
   */
  public abstract onContextMenuOpen?(context: CatalogEntityContextMenuContext): void | Promise<void>;

  /**
   * @deprecated This is not used. Use the `RenderExtension.entitySettings` field instead
   */
  public abstract onSettingsOpen?(context: CatalogEntitySettingsContext): void | Promise<void>;
}
