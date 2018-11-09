/**
 * @fileoverview Defines the <route-selector> custom element.
 */

// import { RouteDescription } from "wsdot-route-utils";

function splitRouteID(
  routeId: string
): [string, string | null, string | null, string | null] {
  const re = /^(\d{3})(?:(\w{2})(\w{0,6}?))?([id]?)$/;
  const match = routeId.match(re);
  if (!match) {
    throw new Error("Route ID not in correct format");
  }

  const [, sr, rrt, rrq, dir] = match;
  return [sr, rrt || null, rrq || null, dir || null];
}

function compareRouteIds(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  const [asr, arrt, arrq, adir] = splitRouteID(a);
  const [bsr, brrt, brrq, bdir] = splitRouteID(b);

  if (asr !== bsr) {
    return asr.localeCompare(bsr);
  }

  if (!arrt) {
    return -1;
  } else if (!brrt) {
    return 1;
  }

  if (arrq !== brrq) {
    if (!arrq) {
      return 1;
    }
    if (!brrq) {
      return -1;
    }
    const [amp, bmp] = [arrq, brrq].map(s => parseInt(s, 10));
    if (!isNaN(amp) && !isNaN(bmp)) {
      return amp === bmp ? 0 : amp > bmp ? 1 : -1;
    }
  }
  return a.localeCompare(b);
}

export interface IGroupedRoutes {
  [sr: string]: string[];
}

export class WsdotRouteSelector extends HTMLElement {
  static get observedAttributes() {
    return ["routes"];
  }
  private readonly routeSelect: HTMLSelectElement;
  private readonly rrtRrqSelect: HTMLSelectElement;
  private routeGroups: IGroupedRoutes = {};
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });
    const wrapper = document.createElement("div");
    this.routeSelect = document.createElement("select");
    this.rrtRrqSelect = document.createElement("select");
    wrapper.appendChild(this.routeSelect);
    wrapper.appendChild(this.rrtRrqSelect);
    shadowRoot.appendChild(wrapper);

    const self = this;

    this.routeSelect.addEventListener("change", () => {
      self.populateRrtRrqBox();
    });

    const routeList = this.getAttribute("routes");
    if (routeList) {
      this.populateBoxes(routeList);
    }
  }
  public populateRrtRrqBox() {
    const sr = this.routeSelect.value;
    const associatedRoutes = this.routeGroups[sr].sort(compareRouteIds);
    this.rrtRrqSelect.innerHTML = "";
    if (associatedRoutes) {
      for (const routeId of associatedRoutes) {
        const option = document.createElement("option");
        option.value = routeId;
        const [, rrt, rrq, dir] = splitRouteID(routeId);
        if (rrt && rrq) {
          option.textContent = `${rrt} ${rrq}`;
        } else if (rrt) {
          option.textContent = rrt;
        } else {
          option.textContent = "mainline";
        }
        if (dir) {
          option.textContent += ` ${dir}`;
        }

        this.rrtRrqSelect.appendChild(option);
      }
    }
  }
  public attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ) {
    if (name === "routes" && newValue !== oldValue) {
      this.populateBoxes(newValue);
    }
  }
  private populateBoxes(routes: string) {
    // Clear existing content.
    this.routeSelect.innerHTML = "";
    this.rrtRrqSelect.innerHTML = "";
    const routeList = routes.split(/[,\s]+/).sort();
    this.routeGroups = {};
    for (const routeId of routeList) {
      const [sr, rrt, rrq, dir] = splitRouteID(routeId);
      if (!this.routeGroups[sr!]) {
        this.routeGroups[sr!] = [];
        const option = document.createElement("option");
        option.textContent = sr;
        this.routeSelect.appendChild(option);
      }
      const rrtRrqList = this.routeGroups[sr!];
      rrtRrqList.push(routeId);
    }
    this.populateRrtRrqBox();
  }
}

customElements.define("route-selector", WsdotRouteSelector);
