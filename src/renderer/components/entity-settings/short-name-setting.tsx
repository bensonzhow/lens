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

import React, { useState } from "react";
import { observer } from "mobx-react";
import type { EntitySettingViewProps } from "../../../extensions/registries";
import { SubTitle } from "../layout/sub-title";
import { Input } from "../input";
import { EntityPreferencesStore } from "../../../common/entity-preferences-store";
import { computeDefaultShortName } from "../../../common/catalog/helpers";

export const ShortNameSetting = observer(({ entity }: EntitySettingViewProps) => {
  const [shortName, setShortName] = useState(entity.metadata.shortName ?? "");
  const store = EntityPreferencesStore.getInstance();

  return (
    <section>
      <section>
        <SubTitle title="Entity Short Name" />
        <Input
          theme="round-black"
          value={shortName}
          placeholder={computeDefaultShortName(entity.getName())}
          onChange={setShortName}
          onBlur={() => store.mergePreferences(entity.getId(), { shortName })}
        />
        <small className="hint">
          The text for entity icons. By default it is calculated from the entity name.
        </small>
      </section>
    </section>
  );
});
