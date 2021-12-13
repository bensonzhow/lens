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

import { merge } from "lodash";
import { action, makeObservable, observable } from "mobx";
import type { PartialDeep } from "type-fest";
import { BaseStore } from "./base-store";
import logger from "./logger";

export interface EntityPreferencesModel {
  /**
   * Is used for displaying entity icons.
   */
  shortName?: string;
}

export interface EntityPreferencesStoreModel {
  entities?: [string, EntityPreferencesModel][];
}

export class EntityPreferencesStore extends BaseStore<EntityPreferencesStoreModel> {
  @observable preferences = observable.map<string, EntityPreferencesModel>();

  constructor() {
    super({
      configName: "lens-entity-preferences-store",
    });

    makeObservable(this);
    this.load();
  }

  @action
  mergePreferences(entityId: string, preferences: PartialDeep<EntityPreferencesModel>): void {
    if (!this.preferences.has(entityId)) {
      this.preferences.set(entityId, preferences);
    } else {
      this.preferences.set(entityId, merge(this.preferences.get(entityId), preferences));
    }
  }

  @action
  protected fromStore(data: EntityPreferencesStoreModel): void {
    logger.debug("EntityPreferencesStore.fromStore()", data);

    this.preferences.replace(data.entities ?? []);
  }

  toJSON(): EntityPreferencesStoreModel {
    return {
      entities: this.preferences.toJSON(),
    };
  }
}
