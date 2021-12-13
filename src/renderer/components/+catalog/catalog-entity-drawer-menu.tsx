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

import React from "react";
import { cssNames } from "../../utils";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import type { CatalogEntity, CatalogEntityContextMenu, CatalogEntityContextMenuContext } from "../../api/catalog-entity";
import { observer } from "mobx-react";
import { makeObservable, observable } from "mobx";
import { navigate } from "../../navigation";
import { MenuItem } from "../menu";
import { ConfirmDialog } from "../confirm-dialog";
import { Icon } from "../icon";
import { HotbarToggleMenuItem } from "./hotbar-toggle-menu-item";

export interface CatalogEntityDrawerMenuProps extends MenuActionsProps {
  entity: CatalogEntity | null | undefined;
}

@observer
export class CatalogEntityDrawerMenu extends React.Component<CatalogEntityDrawerMenuProps> {
  @observable private contextMenu: CatalogEntityContextMenuContext;

  constructor(props: CatalogEntityDrawerMenuProps) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    this.contextMenu = {
      menuItems: [],
      navigate: (url: string) => navigate(url),
    };
    this.props.entity?.onContextMenuOpen(this.contextMenu);
  }

  onMenuItemClick(menuItem: CatalogEntityContextMenu) {
    if (menuItem.confirm) {
      ConfirmDialog.open({
        okButtonProps: {
          primary: false,
          accent: true,
        },
        ok: () => {
          menuItem.onClick();
        },
        message: menuItem.confirm.message,
      });
    } else {
      menuItem.onClick();
    }
  }

  getMenuItems(entity: CatalogEntity): React.ReactChild[] {
    if (!entity) {
      return [];
    }

    const items: React.ReactChild[] = [];

    for (const menuItem of this.contextMenu.menuItems) {
      if (!menuItem.icon) {
        continue;
      }

      const key = menuItem.icon.includes("<svg") ? "svg" : "material";

      items.push(
        <MenuItem key={menuItem.title} onClick={() => this.onMenuItemClick(menuItem)}>
          <Icon
            interactive
            tooltip={menuItem.title}
            {...{ [key]: menuItem.icon }}
          />
        </MenuItem>,
      );
    }

    items.push(
      <HotbarToggleMenuItem
        key="hotbar-toggle"
        entity={entity}
        addContent={<Icon material="push_pin" interactive small tooltip="Add to Hotbar"/>}
        removeContent={<Icon svg="push_off" interactive small tooltip="Remove from Hotbar"/>}
      />,
    );

    return items;
  }

  render() {
    const { className, entity, ...menuProps } = this.props;

    if (!this.contextMenu || !entity.isEnabled()) {
      return null;
    }

    return (
      <MenuActions
        className={cssNames("CatalogEntityDrawerMenu", className)}
        toolbar
        {...menuProps}
      >
        {this.getMenuItems(entity)}
      </MenuActions>
    );
  }
}
