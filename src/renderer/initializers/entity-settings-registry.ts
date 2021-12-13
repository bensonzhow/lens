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

import { EntitySettingRegistry } from "../../extensions/registries";
import * as clusterSettings from "../components/cluster-settings";
import * as entitySettings from "../components/entity-settings/short-name-setting";

export function initEntitySettingsRegistry() {
  EntitySettingRegistry.getInstance()
    .add([
      {
        apiVersions: ["entity.k8slens.dev/v1alpha1"],
        kind: "KubernetesCluster",
        source: "local",
        title: "General",
        group: "Settings",
        components: {
          View: clusterSettings.GeneralSettings,
        },
      },
      {
        apiVersions: ["entity.k8slens.dev/v1alpha1"],
        kind: "KubernetesCluster",
        title: "Proxy",
        group: "Settings",
        components: {
          View: clusterSettings.ProxySettings,
        },
      },
      {
        apiVersions: ["entity.k8slens.dev/v1alpha1"],
        kind: "KubernetesCluster",
        title: "Terminal",
        group: "Settings",
        components: {
          View: clusterSettings.TerminalSettings,
        },
      },
      {
        apiVersions: ["entity.k8slens.dev/v1alpha1"],
        kind: "KubernetesCluster",
        title: "Namespaces",
        group: "Settings",
        components: {
          View: clusterSettings.NamespacesSettings,
        },
      },
      {
        apiVersions: ["entity.k8slens.dev/v1alpha1"],
        kind: "KubernetesCluster",
        title: "Metrics",
        group: "Settings",
        components: {
          View: clusterSettings.MetricsSettings,
        },
      },
      {
        apiVersions: ["entity.k8slens.dev/v1alpha1"],
        kind: "KubernetesCluster",
        title: "Node Shell",
        group: "Settings",
        components: {
          View: clusterSettings.NodeShellSettings,
        },
      },
      {
        apiVersions: "*",
        kind: "*",
        title: "Short Name",
        group: "Settings",
        components: {
          View: entitySettings.ShortNameSetting,
        },
      },
    ]);
}
