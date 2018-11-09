/**
 * @fileoverview Defines the <route-selector> custom element.
 */

// tslint:disable:max-classes-per-file

/**
 * An error that is thrown when a function receives an invalidly formatted route ID.
 */
export class RouteFormatError extends Error {
  /**
   * Creates a new instance of this error class.
   * @param routeId The invalid route ID.
   */
  constructor(routeId: string) {
    super(`Invalid route format: ${routeId}`);
  }
}

/**
 * Splits a WSDOT route identifier into its SR, RRT, RRQ, and direction components.
 * @param routeId A state route identifier.
 * @returns an array of four string elements: SR, RRT, RRQ, direction. (All but the SR element could be null.)
 * @throws {RouteFormatError} Thrown if routeId is not a properly formatted WSDOT route ID.
 */
function splitRouteID(
  routeId: string
): [string, string | null, string | null, string | null] {
  const re = /^(\d{3})(?:(\w{2})(\w{0,6}?))?([id]?)$/;
  const match = routeId.match(re);
  if (!match) {
    throw new RouteFormatError(routeId);
  }

  const [, sr, rrt, rrq, dir] = match;
  return [sr, rrt || null, rrq || null, dir || null];
}

/**
 * Comparison function used for sorting route ID strings.
 *
 * 1. Compare SR values
 * 2. Compare numerical RRQ values.
 * 3. Standard string compare.
 * @param a Route ID
 * @param b Route ID
 */
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

/**
 * Routes grouped by three digit route IDs.
 */
export interface IGroupedRoutes {
  [sr: string]: string[];
}

/**
 * Route Selector custom HTML Element class.
 */
export class RouteSelector extends HTMLElement {
  /**
   * Defines which attributes will be observed by this class.
   */
  static get observedAttributes() {
    return ["routes"];
  }
  private readonly routeSelect: HTMLSelectElement;
  private readonly rrtRrqSelect: HTMLSelectElement;
  /**
   * routes grouped by SR will be stored here.
   */
  private routeGroups: IGroupedRoutes = {};
  public get value() {
    return this.rrtRrqSelect.value;
  }
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
  private dispatchInvalidRouteEvent(routeId: string) {
    const customEvent = new CustomEvent("invalidroute", {
      detail: { routeId }
    });
    this.dispatchEvent(customEvent);
  }
  private populateBoxes(routes: string) {
    // Clear existing content.
    this.routeSelect.innerHTML = "";
    this.rrtRrqSelect.innerHTML = "";
    const routeList = routes.split(/[,\s]+/).sort();
    this.routeGroups = {};
    for (const routeId of routeList) {
      try {
        const [sr, rrt, rrq, dir] = splitRouteID(routeId);
        if (!this.routeGroups[sr!]) {
          this.routeGroups[sr!] = [];
          const option = document.createElement("option");
          option.textContent = sr;
          this.routeSelect.appendChild(option);
        }
        const rrtRrqList = this.routeGroups[sr!];
        rrtRrqList.push(routeId);
      } catch (err) {
        if (err instanceof RouteFormatError) {
          this.dispatchInvalidRouteEvent(routeId);
        } else {
          throw err;
        }
      }
    }
    this.populateRrtRrqBox();
  }
}

customElements.define("route-selector", RouteSelector);
