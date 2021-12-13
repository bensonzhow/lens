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

import { render } from "@testing-library/react";
import React from "react";
import { KubernetesCluster } from "../../../../common/catalog-entities";
import { EntityIcon } from "../entity-icon";

describe("<EntityIcon />", () => {
  it("should render w/o errors when given undefined", () => {
    expect(render(<EntityIcon />).container).toBeInstanceOf(HTMLElement);
  });

  it("should render w/o errors", () => {
    const kc = new KubernetesCluster({
      metadata: {
        labels: {},
        name: "foobar",
        uid: "foobar",
      },
      spec: {
        kubeconfigContext: "default",
        kubeconfigPath: "",
      },
      status: {
        phase: "disconnected",
      },
    });

    expect(render(<EntityIcon entity={kc} />).container).toBeInstanceOf(HTMLElement);
  });

  it("should render icon if KubernetesCluster has one in spec", () => {
    const kc = new KubernetesCluster({
      metadata: {
        labels: {},
        name: "foobar",
        uid: "foobar",
      },
      spec: {
        kubeconfigContext: "default",
        kubeconfigPath: "",
        icon: {
          material: "cog",
        },
      },
      status: {
        phase: "disconnected",
      },
    });



    expect(render(<EntityIcon entity={kc} />).container.querySelector(".Icon")).toBeInstanceOf(HTMLElement);
  });

  it("should render img if KubernetesCluster has one in spec", () => {
    const kc = new KubernetesCluster({
      metadata: {
        labels: {},
        name: "foobar",
        uid: "foobar",
      },
      spec: {
        kubeconfigContext: "default",
        kubeconfigPath: "",
        icon: {
          src: "data:,Hello%2C%20World%21",
        },
      },
      status: {
        phase: "disconnected",
      },
    });

    expect(render(<EntityIcon entity={kc} />).container.querySelector("img")).toBeInstanceOf(HTMLElement);
  });

  it("should render short name", () => {
    const kc = new KubernetesCluster({
      metadata: {
        labels: {},
        name: "foobar",
        uid: "foobar",
      },
      spec: {
        kubeconfigContext: "default",
        kubeconfigPath: "",
      },
      status: {
        phase: "disconnected",
      },
    });

    expect(render(<EntityIcon entity={kc} />).getByText("fo")).toBeInstanceOf(HTMLElement);
  });

  it("should render specified short name", () => {
    const kc = new KubernetesCluster({
      metadata: {
        labels: {},
        name: "foobar",
        uid: "foobar",
        shortName: "high",
      },
      spec: {
        kubeconfigContext: "default",
        kubeconfigPath: "",
      },
      status: {
        phase: "disconnected",
      },
    });

    expect(render(<EntityIcon entity={kc} />).getByText("high")).toBeInstanceOf(HTMLElement);
  });
});
