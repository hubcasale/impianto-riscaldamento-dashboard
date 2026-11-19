var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i5 = decorators.length - 1, decorator; i5 >= 0; i5--)
    if (decorator = decorators[i5])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t3, e5, o6) {
    if (this._$cssResult$ = true, o6 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t3, this.t = e5;
  }
  get styleSheet() {
    let t3 = this.o;
    const s4 = this.t;
    if (e && void 0 === t3) {
      const e5 = void 0 !== s4 && 1 === s4.length;
      e5 && (t3 = o.get(s4)), void 0 === t3 && ((this.o = t3 = new CSSStyleSheet()).replaceSync(this.cssText), e5 && o.set(s4, t3));
    }
    return t3;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t3) => new n("string" == typeof t3 ? t3 : t3 + "", void 0, s);
var i = (t3, ...e5) => {
  const o6 = 1 === t3.length ? t3[0] : e5.reduce((e6, s4, o7) => e6 + ((t4) => {
    if (true === t4._$cssResult$) return t4.cssText;
    if ("number" == typeof t4) return t4;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t3[o7 + 1], t3[0]);
  return new n(o6, t3, s);
};
var S = (s4, o6) => {
  if (e) s4.adoptedStyleSheets = o6.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet);
  else for (const e5 of o6) {
    const o7 = document.createElement("style"), n5 = t.litNonce;
    void 0 !== n5 && o7.setAttribute("nonce", n5), o7.textContent = e5.cssText, s4.appendChild(o7);
  }
};
var c = e ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
  let e5 = "";
  for (const s4 of t4.cssRules) e5 += s4.cssText;
  return r(e5);
})(t3) : t3;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t3, s4) => t3;
var u = { toAttribute(t3, s4) {
  switch (s4) {
    case Boolean:
      t3 = t3 ? l : null;
      break;
    case Object:
    case Array:
      t3 = null == t3 ? t3 : JSON.stringify(t3);
  }
  return t3;
}, fromAttribute(t3, s4) {
  let i5 = t3;
  switch (s4) {
    case Boolean:
      i5 = null !== t3;
      break;
    case Number:
      i5 = null === t3 ? null : Number(t3);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t3);
      } catch (t4) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t3, s4) => !i2(t3, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ??= Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
  static addInitializer(t3) {
    this._$Ei(), (this.l ??= []).push(t3);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t3, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t3) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t3, s4), !s4.noAccessor) {
      const i5 = Symbol(), h3 = this.getPropertyDescriptor(t3, i5, s4);
      void 0 !== h3 && e2(this.prototype, t3, h3);
    }
  }
  static getPropertyDescriptor(t3, s4, i5) {
    const { get: e5, set: r6 } = h(this.prototype, t3) ?? { get() {
      return this[s4];
    }, set(t4) {
      this[s4] = t4;
    } };
    return { get: e5, set(s5) {
      const h3 = e5?.call(this);
      r6?.call(this, s5), this.requestUpdate(t3, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t3) {
    return this.elementProperties.get(t3) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t3 = n2(this);
    t3.finalize(), void 0 !== t3.l && (this.l = [...t3.l]), this.elementProperties = new Map(t3.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t4 = this.properties, s4 = [...r2(t4), ...o2(t4)];
      for (const i5 of s4) this.createProperty(i5, t4[i5]);
    }
    const t3 = this[Symbol.metadata];
    if (null !== t3) {
      const s4 = litPropertyMetadata.get(t3);
      if (void 0 !== s4) for (const [t4, i5] of s4) this.elementProperties.set(t4, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t4, s4] of this.elementProperties) {
      const i5 = this._$Eu(t4, s4);
      void 0 !== i5 && this._$Eh.set(i5, t4);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e5 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e5) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t3, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t3 ? t3.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t3) => this.enableUpdating = t3), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t3) => t3(this));
  }
  addController(t3) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t3), void 0 !== this.renderRoot && this.isConnected && t3.hostConnected?.();
  }
  removeController(t3) {
    this._$EO?.delete(t3);
  }
  _$E_() {
    const t3 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t3.set(i5, this[i5]), delete this[i5]);
    t3.size > 0 && (this._$Ep = t3);
  }
  createRenderRoot() {
    const t3 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t3, this.constructor.elementStyles), t3;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t3) => t3.hostConnected?.());
  }
  enableUpdating(t3) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t3) => t3.hostDisconnected?.());
  }
  attributeChangedCallback(t3, s4, i5) {
    this._$AK(t3, i5);
  }
  _$ET(t3, s4) {
    const i5 = this.constructor.elementProperties.get(t3), e5 = this.constructor._$Eu(t3, i5);
    if (void 0 !== e5 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t3, null == h3 ? this.removeAttribute(e5) : this.setAttribute(e5, h3), this._$Em = null;
    }
  }
  _$AK(t3, s4) {
    const i5 = this.constructor, e5 = i5._$Eh.get(t3);
    if (void 0 !== e5 && this._$Em !== e5) {
      const t4 = i5.getPropertyOptions(e5), h3 = "function" == typeof t4.converter ? { fromAttribute: t4.converter } : void 0 !== t4.converter?.fromAttribute ? t4.converter : u;
      this._$Em = e5;
      const r6 = h3.fromAttribute(s4, t4.type);
      this[e5] = r6 ?? this._$Ej?.get(e5) ?? r6, this._$Em = null;
    }
  }
  requestUpdate(t3, s4, i5, e5 = false, h3) {
    if (void 0 !== t3) {
      const r6 = this.constructor;
      if (false === e5 && (h3 = this[t3]), i5 ??= r6.getPropertyOptions(t3), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t3) && !this.hasAttribute(r6._$Eu(t3, i5)))) return;
      this.C(t3, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t3, s4, { useDefault: i5, reflect: e5, wrapped: h3 }, r6) {
    i5 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t3) && (this._$Ej.set(t3, r6 ?? s4 ?? this[t3]), true !== h3 || void 0 !== r6) || (this._$AL.has(t3) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t3, s4)), true === e5 && this._$Em !== t3 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t3));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t4) {
      Promise.reject(t4);
    }
    const t3 = this.scheduleUpdate();
    return null != t3 && await t3, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t5, s5] of this._$Ep) this[t5] = s5;
        this._$Ep = void 0;
      }
      const t4 = this.constructor.elementProperties;
      if (t4.size > 0) for (const [s5, i5] of t4) {
        const { wrapped: t5 } = i5, e5 = this[s5];
        true !== t5 || this._$AL.has(s5) || void 0 === e5 || this.C(s5, void 0, i5, e5);
      }
    }
    let t3 = false;
    const s4 = this._$AL;
    try {
      t3 = this.shouldUpdate(s4), t3 ? (this.willUpdate(s4), this._$EO?.forEach((t4) => t4.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t3 = false, this._$EM(), s5;
    }
    t3 && this._$AE(s4);
  }
  willUpdate(t3) {
  }
  _$AE(t3) {
    this._$EO?.forEach((t4) => t4.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t3) {
    return true;
  }
  update(t3) {
    this._$Eq &&= this._$Eq.forEach((t4) => this._$ET(t4, this[t4])), this._$EM();
  }
  updated(t3) {
  }
  firstUpdated(t3) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t3) => t3;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t3) => null === t3 || "object" != typeof t3 && "function" != typeof t3;
var u2 = Array.isArray;
var d2 = (t3) => u2(t3) || "function" == typeof t3?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t3) => (i5, ...s4) => ({ _$litType$: t3, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = Symbol.for("lit-noChange");
var A = Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t3, i5) {
  if (!u2(t3) || !t3.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t3, i5) => {
  const s4 = t3.length - 1, e5 = [];
  let n5, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t3[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
    const x2 = c4 === p2 && t3[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e5.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t3, l3 + (t3[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e5];
};
var S2 = class _S {
  constructor({ strings: t3, _$litType$: i5 }, e5) {
    let r6;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t3.length - 1, d3 = this.parts, [f3, v2] = N(t3, i5);
    if (this.el = _S.createElement(f3, e5), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t4 = this.el.content.firstChild;
      t4.replaceWith(...t4.childNodes);
    }
    for (; null !== (r6 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r6.nodeType) {
        if (r6.hasAttributes()) for (const t4 of r6.getAttributeNames()) if (t4.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r6.getAttribute(t4).split(o3), e6 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e6[2], strings: s4, ctor: "." === e6[1] ? I : "?" === e6[1] ? L : "@" === e6[1] ? z : H }), r6.removeAttribute(t4);
        } else t4.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t4));
        if (y2.test(r6.tagName)) {
          const t4 = r6.textContent.split(o3), i6 = t4.length - 1;
          if (i6 > 0) {
            r6.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r6.append(t4[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r6.append(t4[i6], c3());
          }
        }
      } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t4 = -1;
        for (; -1 !== (t4 = r6.data.indexOf(o3, t4 + 1)); ) d3.push({ type: 7, index: l3 }), t4 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t3, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t3, s4;
  }
};
function M(t3, i5, s4 = t3, e5) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e5 ? s4._$Co?.[e5] : s4._$Cl;
  const o6 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o6 && (h3?._$AO?.(false), void 0 === o6 ? h3 = void 0 : (h3 = new o6(t3), h3._$AT(t3, s4, e5)), void 0 !== e5 ? (s4._$Co ??= [])[e5] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t3, h3._$AS(t3, i5.values), h3, e5)), i5;
}
var R = class {
  constructor(t3, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t3) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e5 = (t3?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e5;
    let h3 = P.nextNode(), o6 = 0, n5 = 0, r6 = s4[0];
    for (; void 0 !== r6; ) {
      if (o6 === r6.index) {
        let i6;
        2 === r6.type ? i6 = new k(h3, h3.nextSibling, this, t3) : 1 === r6.type ? i6 = new r6.ctor(h3, r6.name, r6.strings, this, t3) : 6 === r6.type && (i6 = new Z(h3, this, t3)), this._$AV.push(i6), r6 = s4[++n5];
      }
      o6 !== r6?.index && (h3 = P.nextNode(), o6++);
    }
    return P.currentNode = l2, e5;
  }
  p(t3) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t3, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t3[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t3, i5, s4, e5) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t3, this._$AB = i5, this._$AM = s4, this.options = e5, this._$Cv = e5?.isConnected ?? true;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t3?.nodeType && (t3 = i5.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, i5 = this) {
    t3 = M(this, t3, i5), a2(t3) ? t3 === A || null == t3 || "" === t3 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t3 !== this._$AH && t3 !== E && this._(t3) : void 0 !== t3._$litType$ ? this.$(t3) : void 0 !== t3.nodeType ? this.T(t3) : d2(t3) ? this.k(t3) : this._(t3);
  }
  O(t3) {
    return this._$AA.parentNode.insertBefore(t3, this._$AB);
  }
  T(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.O(t3));
  }
  _(t3) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t3 : this.T(l2.createTextNode(t3)), this._$AH = t3;
  }
  $(t3) {
    const { values: i5, _$litType$: s4 } = t3, e5 = "number" == typeof s4 ? this._$AC(t3) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e5) this._$AH.p(i5);
    else {
      const t4 = new R(e5, this), s5 = t4.u(this.options);
      t4.p(i5), this.T(s5), this._$AH = t4;
    }
  }
  _$AC(t3) {
    let i5 = C.get(t3.strings);
    return void 0 === i5 && C.set(t3.strings, i5 = new S2(t3)), i5;
  }
  k(t3) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e5 = 0;
    for (const h3 of t3) e5 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e5], s4._$AI(h3), e5++;
    e5 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e5), i5.length = e5);
  }
  _$AR(t3 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t3 !== this._$AB; ) {
      const s5 = i3(t3).nextSibling;
      i3(t3).remove(), t3 = s5;
    }
  }
  setConnected(t3) {
    void 0 === this._$AM && (this._$Cv = t3, this._$AP?.(t3));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t3, i5, s4, e5, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t3, this.name = i5, this._$AM = e5, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t3, i5 = this, s4, e5) {
    const h3 = this.strings;
    let o6 = false;
    if (void 0 === h3) t3 = M(this, t3, i5, 0), o6 = !a2(t3) || t3 !== this._$AH && t3 !== E, o6 && (this._$AH = t3);
    else {
      const e6 = t3;
      let n5, r6;
      for (t3 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r6 = M(this, e6[s4 + n5], i5, n5), r6 === E && (r6 = this._$AH[n5]), o6 ||= !a2(r6) || r6 !== this._$AH[n5], r6 === A ? t3 = A : t3 !== A && (t3 += (r6 ?? "") + h3[n5 + 1]), this._$AH[n5] = r6;
    }
    o6 && !e5 && this.j(t3);
  }
  j(t3) {
    t3 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t3) {
    this.element[this.name] = t3 === A ? void 0 : t3;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t3) {
    this.element.toggleAttribute(this.name, !!t3 && t3 !== A);
  }
};
var z = class extends H {
  constructor(t3, i5, s4, e5, h3) {
    super(t3, i5, s4, e5, h3), this.type = 5;
  }
  _$AI(t3, i5 = this) {
    if ((t3 = M(this, t3, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e5 = t3 === A && s4 !== A || t3.capture !== s4.capture || t3.once !== s4.once || t3.passive !== s4.passive, h3 = t3 !== A && (s4 === A || e5);
    e5 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t3) : this._$AH.handleEvent(t3);
  }
};
var Z = class {
  constructor(t3, i5, s4) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    M(this, t3);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
var D = (t3, i5, s4) => {
  const e5 = s4?.renderBefore ?? i5;
  let h3 = e5._$litPart$;
  if (void 0 === h3) {
    const t4 = s4?.renderBefore ?? null;
    e5._$litPart$ = h3 = new k(i5.insertBefore(c3(), t4), t4, void 0, s4 ?? {});
  }
  return h3._$AI(t3), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t3 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t3.firstChild, t3;
  }
  update(t3) {
    const r6 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Do = D(r6, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ??= []).push("4.2.2");

// node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t3 = o5, e5, r6) => {
  const { kind: n5, metadata: i5 } = r6;
  let s4 = globalThis.litPropertyMetadata.get(i5);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i5, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t3 = Object.create(t3)).wrapped = true), s4.set(r6.name, t3), "accessor" === n5) {
    const { name: o6 } = r6;
    return { set(r7) {
      const n6 = e5.get.call(this);
      e5.set.call(this, r7), this.requestUpdate(o6, n6, t3, true, r7);
    }, init(e6) {
      return void 0 !== e6 && this.C(o6, void 0, t3, e6), e6;
    } };
  }
  if ("setter" === n5) {
    const { name: o6 } = r6;
    return function(r7) {
      const n6 = this[o6];
      e5.call(this, r7), this.requestUpdate(o6, n6, t3, true, r7);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n4(t3) {
  return (e5, o6) => "object" == typeof o6 ? r4(t3, e5, o6) : ((t4, e6, o7) => {
    const r6 = e6.hasOwnProperty(o7);
    return e6.constructor.createProperty(o7, t4), r6 ? Object.getOwnPropertyDescriptor(e6, o7) : void 0;
  })(t3, e5, o6);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r5(r6) {
  return n4({ ...r6, state: true, attribute: false });
}

// src/sections-logic.ts
var SECTION_KEYS = ["boiler", "caldaia", "stufa", "termostato"];
var SECTION_INFO = {
  boiler: { label: "Boiler solare", hint: "Temperature, docce, puffer e pannello solare.", icon: "mdi:water-boiler" },
  caldaia: { label: "Caldaia a pellet (Polygon)", hint: "Stato, serbatoio del pellet, programma e preferenze dell'impianto.", icon: "mdi:fire" },
  stufa: { label: "Stufa a pellet", hint: "Stato, potenza, accensione e programma della stufa.", icon: "mdi:stove" },
  termostato: { label: "Termostato ambiente", hint: "Temperatura, obiettivo, modalit\xE0 e programma.", icon: "mdi:thermostat" }
};
var SECTIONS_USER_KEY = "impianto_riscaldamento_sezioni";
function defaultSections(show) {
  const list = Array.isArray(show) ? show.filter((k2) => SECTION_KEYS.includes(k2)) : [];
  const only = list.length > 0;
  return { boiler: !only || list.includes("boiler"), caldaia: !only || list.includes("caldaia"), stufa: !only || list.includes("stufa"), termostato: !only || list.includes("termostato") };
}
function normalizeSections(stored, show) {
  const base = defaultSections(show);
  const raw = stored && typeof stored === "object" ? stored.sections : void 0;
  if (raw && typeof raw === "object") {
    for (const k2 of SECTION_KEYS) {
      const v2 = raw[k2];
      if (typeof v2 === "boolean") base[k2] = v2;
    }
  }
  return visibleKeys(base).length === 0 ? defaultSections(show) : base;
}
function visibleKeys(s4) {
  return SECTION_KEYS.filter((k2) => s4[k2]);
}
function toggleSection(s4, key) {
  const next = { ...s4, [key]: !s4[key] };
  return visibleKeys(next).length === 0 ? s4 : next;
}
function sectionsSummary(s4) {
  const v2 = visibleKeys(s4);
  if (v2.length === SECTION_KEYS.length) return "Tutte le sezioni";
  if (v2.length === 1) return `Solo ${SECTION_INFO[v2[0]].label.toLowerCase()}`;
  return v2.map((k2) => SECTION_INFO[k2].label.split(" (")[0].toLowerCase()).join(", ");
}
function sectionsToStore(s4) {
  return { version: 1, sections: { ...s4 } };
}

// src/settings-logic.ts
var SETTINGS_GROUPS = [
  { id: "riscaldamento", title: "Caldaia e acqua calda" },
  { id: "pompe", title: "Pompe" },
  { id: "casa", title: "Quando esci di casa" },
  { id: "taratura", title: "Taratura", note: "Valori che si cambiano di rado: con quelli giusti non serve toccarli." }
];
var H2 = (what, when, suggested) => ({ what, when, ...suggested ? { suggested } : {} });
var SETTINGS_SECTIONS = [
  {
    id: "caldaia",
    group: "riscaldamento",
    icon: "mdi:fire",
    title: "Caldaia a pellet (Polygon)",
    help: H2(
      "Le temperature che la Polygon deve raggiungere: l'acqua di riscaldamento e il puffer da 50 litri che serve l'acqua calda.",
      "Cambiale solo se vuoi una casa pi\xF9 calda o pi\xF9 acqua calda; i programmi della scheda di programmazione hanno i loro valori."
    ),
    fields: [
      {
        kind: "climate",
        entity: "climate.casale_acqua",
        label: "Temperatura dell'acqua della caldaia",
        hint: "Setpoint dell'acqua di riscaldamento. I programmi della scheda di programmazione hanno i loro valori.",
        help: H2("Il setpoint dell'acqua di riscaldamento della Polygon.", "Quando la casa \xE8 troppo fredda o troppo calda con i termosifoni.", "Quello che usi di solito nei programmi.")
      },
      {
        kind: "number",
        entity: "number.casale_setpoint_boiler",
        label: "Setpoint del puffer da 50 litri",
        hint: "Setpoint boiler della Polygon (consenso per l'acqua calda sanitaria).",
        help: H2("Il setpoint boiler della Polygon: sotto questa temperatura il puffer chiede calore per l'acqua calda sanitaria.", "Alzalo se l'acqua calda finisce presto, abbassalo per consumare meno pellet.")
      }
    ]
  },
  {
    id: "cless",
    group: "riscaldamento",
    master: "input_boolean.impianto_modo_cless",
    icon: "mdi:water-boiler",
    title: "Accumulo CLESS",
    help: H2(
      "Si accende quando l'accumulo REQ.A CLESS ha preso il posto del boiler solare da 200 L e del puffer da 50 L. La scheda disegna l'accumulo senza puffer n\xE9 pompa di integrazione, il modello del serbatoio passa a 510 L e le regole del vecchio boiler (salvaguardia delle partenze, blocco della pompa di integrazione, tempo per l'acqua pronta) si fermano: la caldaia resta accesa per produrre l'acqua calda.",
      "Accendilo il giorno in cui il CLESS \xE8 installato; spegnendolo torna tutto com'era."
    ),
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.impianto_modo_cless",
        label: "Modo CLESS",
        hint: "Acceso: accumulo CLESS, senza puffer n\xE9 pompa di integrazione. Spento: boiler solare e puffer di prima.",
        help: H2("Interruttore generale: passa l'impianto dal boiler solare con il puffer all'accumulo CLESS.", "Il giorno della posa del CLESS.")
      },
      {
        kind: "number",
        entity: "input_number.boiler_solare_delta_alto",
        label: "Correzione della sonda alta",
        hint: "Si somma alla sonda ESP32 in cima: confrontala con la S. BOILER della caldaia.",
        help: H2("Gradi che si sommano alla lettura della sonda ESP32 in cima al serbatoio.", "Dopo la posa: con la caldaia ferma da un po', confronta la sonda alta con la S. BOILER della Polygon e correggi la differenza.")
      },
      {
        kind: "number",
        entity: "input_number.boiler_solare_delta_basso",
        label: "Correzione della sonda bassa",
        help: H2("Gradi che si sommano alla lettura della sonda ESP32 in fondo al serbatoio.", "Dopo la posa, con il serbatoio fermo da ore: le due sonde dovrebbero segnare quasi lo stesso valore in fondo.")
      },
      {
        kind: "number",
        entity: "input_number.boiler_solare_t_minima_zona",
        label: "Temperatura minima di una zona per contare le docce",
        help: H2("Una zona del serbatoio conta per le docce solo se \xE8 almeno a questa temperatura: l'acqua sanitaria esce dalla serpentina pi\xF9 fredda dell'accumulo.", "Alzala se le docce stimate sono pi\xF9 di quelle vere, abbassala nel caso opposto.", "47 \xB0C")
      },
      {
        kind: "toggle",
        entity: "input_boolean.impianto_cless_avviso_spenta",
        label: "Avvisa se la caldaia si spegne",
        hint: "Avviso sul telefono se resta spenta senza programma settimanale e con qualcuno in casa. Non la riaccende.",
        help: H2("Manda un avviso sul telefono se la caldaia resta spenta pi\xF9 dei minuti indicati, senza programma settimanale e con qualcuno in casa.", "Con la caldaia sempre accesa per l'acqua calda: segnala un allarme o una mancanza di corrente.", "Acceso.")
      },
      {
        kind: "number",
        entity: "input_number.impianto_cless_spenta_minuti",
        label: "Minuti di caldaia spenta prima dell'avviso",
        help: H2("Quanto deve restare spenta la caldaia prima di avvisarti.", "Allungalo se la caldaia si ferma spesso per brevi pulizie.", "20 minuti.")
      }
    ]
  },
  {
    id: "partenze",
    group: "riscaldamento",
    master: "input_boolean.caldaia_salvaguardia_attiva",
    icon: "mdi:shield-check",
    title: "Salvaguardia accensioni",
    help: H2(
      "Evita che la caldaia parta quando non serve: il boiler ha gi\xE0 abbastanza acqua calda e il termostato non chiede riscaldamento.",
      "Per non sprecare pellet nelle accensioni dei programmi quando l'acqua \xE8 gi\xE0 calda."
    ),
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_salvaguardia_attiva",
        label: "Evita partenze inutili",
        hint: "Annulla l'avvio della caldaia quando il boiler ha gi\xE0 abbastanza docce e il termostato non chiede calore.",
        help: H2("Annulla la partenza di un programma se il boiler ha gi\xE0 le docce che vuoi garantire e il termostato non chiede calore. Il puffer non conta: serve solo ai termosifoni e a integrare l'acqua sanitaria.", "Lascialo acceso: se serve, la caldaia riparte da sola quando il termostato chiede calore o l'acqua sanitaria si raffredda.", "Acceso.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_salvaguardia_docce_min",
        label: "Docce da garantire prima di annullare",
        hint: "Quante docce deve avere gi\xE0 il boiler (come le conta la scheda, 40 L a 38 \xB0C) perch\xE9 la partenza di un programma venga annullata.",
        help: H2("Il numero minimo di docce disponibili nel boiler per annullare la partenza di un programma. Conta sia la sonda alta sia la bassa: con la testa calda ma il fondo freddo le docce sono poche.", "Alzalo se la sera ti serve pi\xF9 acqua calda; abbassalo per far partire la caldaia meno spesso.", "3 docce.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_salvaguardia_t_puffer",
        label: "Riparti per l'acqua calda se il puffer \xE8 sotto",
        hint: "Dopo un'annullamento, se l'acqua sanitaria chiede calore e il puffer \xE8 sotto questa temperatura la caldaia riparte; sopra, ci pensa la pompa di integrazione.",
        help: H2("La temperatura del puffer sotto la quale, dopo una partenza annullata, la caldaia riparte quando l'acqua sanitaria chiede calore.", "Alzala se vuoi che riparta prima; abbassala per lasciare lavorare pi\xF9 a lungo la pompa di integrazione.")
      }
    ]
  },
  {
    id: "acs",
    group: "riscaldamento",
    icon: "mdi:water-boiler",
    title: "Richiesta di acqua calda",
    help: H2(
      "Le temperature alte del boiler con cui Home Assistant decide che l'acqua calda sta finendo e chiede la caldaia. La richiesta riaccende il Polygon quando un programma \xE8 attivo.",
      "Per far partire la caldaia prima (soglia pi\xF9 alta) o pi\xF9 tardi (soglia pi\xF9 bassa) quando il boiler si raffredda."
    ),
    fields: [
      {
        kind: "number",
        entity: "input_number.caldaia_acs_t_accendi",
        label: "Chiedi la caldaia sotto",
        hint: "Temperatura alta del boiler (la stessa di \xABAlto S3\xBB) sotto la quale parte la richiesta di acqua calda.",
        help: H2("Quando la temperatura alta del boiler scende sotto questo valore parte la richiesta di acqua calda, a meno che il sole stia scaldando il boiler.", "Alzala se vuoi che la caldaia parta prima e l'acqua non scenda; abbassala per consumare meno pellet e lasciare pi\xF9 spazio al solare.", "40 \xB0C.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_acs_t_spegni",
        label: "La richiesta finisce sopra",
        hint: "Una volta partita, la richiesta resta finch\xE9 la temperatura alta del boiler arriva a questo valore.",
        help: H2("La temperatura alta alla quale la richiesta di acqua calda finisce. Pi\xF9 \xE8 alta, pi\xF9 a lungo lavora la caldaia a ogni accensione.", "Abbassala se la caldaia scalda pi\xF9 di quanto serve; alzala se preferisci accensioni pi\xF9 rare e pi\xF9 lunghe.", "55 \xB0C.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_acs_t_emergenza",
        label: "Chiedi anche col sole sotto",
        hint: "Se il sole sta scaldando il boiler la richiesta aspetta, ma sotto questa temperatura parte comunque.",
        help: H2("Con il sole che d\xE0 abbastanza potenza la richiesta di acqua calda aspetta. Sotto questa temperatura alta parte comunque.", "Alzala se non vuoi restare con l'acqua tiepida nelle giornate di sole incerto.", "36 \xB0C.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_acs_potenza_solare_min",
        label: "Potenza solare che fa attendere",
        hint: "Con almeno questa potenza dal collettore la richiesta aspetta il sole.",
        help: H2("La potenza del solare termico (in kW) sopra la quale la richiesta di acqua calda aspetta, perch\xE9 il sole sta gi\xE0 scaldando il boiler.", "Abbassala se vuoi che la caldaia aspetti il sole anche con poca potenza.", "1 kW.")
      }
    ]
  },
  {
    id: "integrazione",
    group: "pompe",
    icon: "mdi:pump",
    title: "Pompa di integrazione",
    help: H2(
      "La pompa che porta il calore del puffer alla serpentina del boiler. Qui si decide quando fermarla e quando forzarla.",
      "Per far lavorare bene insieme solare e caldaia, senza raffreddare il boiler con acqua meno calda."
    ),
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_integrazione_blocco_attivo",
        label: "Blocco automatico",
        hint: "Tiene ferma la pompa quando il puffer non \xE8 abbastanza pi\xF9 caldo del boiler.",
        help: H2("Tiene ferma la pompa quando il puffer non \xE8 abbastanza pi\xF9 caldo del boiler.", "Evita di portare al boiler acqua meno calda di quella che ha gi\xE0.", "Acceso.")
      },
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_integrazione_forzatura_attiva",
        label: "Accensione forzata",
        hint: "Accende la pompa anche quando l'Elios non la chiama, finch\xE9 il puffer ha calore da cedere.",
        help: H2("Accende la pompa anche quando l'Elios non la chiama, finch\xE9 il puffer ha calore da cedere.", "Per sfruttare il puffer caldo e fare meno ore di caldaia.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_delta_blocco",
        label: "Blocca se il puffer supera il boiler di meno di",
        help: H2("Se il puffer supera il boiler di meno di questi gradi la pompa si ferma.", "Alzalo se la pompa parte per differenze troppo piccole.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_delta_sblocco",
        label: "Sblocca quando il puffer supera il boiler di",
        help: H2("La differenza di temperatura oltre la quale la pompa pu\xF2 ripartire.", "Deve essere pi\xF9 alta della soglia di blocco, cos\xEC la pompa non parte e si ferma di continuo.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_temp_max",
        label: "Non scaldare la testa del boiler oltre",
        help: H2("La temperatura massima della sonda alta del boiler: oltre questo valore la pompa non lo scalda pi\xF9.", "Protegge dalle scottature e lascia spazio al solare.", "60 \xB0C.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_isteresi_max",
        label: "Isteresi su questa temperatura",
        help: H2("Di quanti gradi deve scendere la testa del boiler sotto il massimo prima che la pompa possa ripartire.", "Evita accensioni e spegnimenti ravvicinati intorno al limite.")
      }
    ]
  },
  {
    id: "assenza",
    group: "casa",
    master: "input_boolean.caldaia_assenza_attiva",
    icon: "mdi:home-off",
    title: "Spegnimento se nessuno \xE8 in casa",
    help: H2(
      "Spegne la caldaia quando tutti sono fuori casa (iPhone e Wi-Fi) e la riaccende al rientro solo se un programma \xE8 attivo.",
      "Per non scaldare una casa vuota quando ti dimentichi di spegnere."
    ),
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_assenza_attiva",
        label: "Spegni la caldaia con la casa vuota",
        hint: "Usa gli iPhone (iCloud3) e il Wi-Fi CASALE2G. Al rientro riaccende solo se un programma \xE8 attivo.",
        help: H2("Spegne la caldaia dopo il tempo indicato di casa vuota, controllando gli iPhone (iCloud3) e il Wi-Fi CASALE2G.", "Se parti e ti dimentichi di spegnere o di premere Vacanza.")
      },
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_assenza_ospiti",
        label: "Ospiti in casa (non spegnere)",
        hint: "Per chi non ha un telefono tracciato.",
        help: H2("Con gli ospiti la casa non \xE8 considerata vuota e la caldaia non si spegne.", "Quando ci sono persone che non hanno un telefono tracciato.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_assenza_minuti",
        label: "Spegni dopo questi minuti di assenza",
        help: H2("Quanto deve restare vuota la casa prima di spegnere.", "Allungalo se esci spesso per brevi commissioni.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_assenza_t_esterna_min",
        label: "Non spegnere se fuori fa meno di",
        help: H2("Con pi\xF9 freddo di questa temperatura esterna la caldaia non viene spenta.", "Per non far raffreddare troppo la casa nelle giornate pi\xF9 fredde.")
      }
    ]
  },
  {
    id: "pellet",
    group: "taratura",
    icon: "mdi:grain",
    title: "Consumo di pellet (stima)",
    advanced: true,
    help: H2(
      "I valori con cui la scheda stima quanto pellet consuma la caldaia (non c'\xE8 un sensore del pellet).",
      "Si ritarano una volta, confrontando la stima con i sacchi realmente usati."
    ),
    fields: [
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_kg_h_min",
        label: "Consumo a potenza minima (30 %)",
        hint: "Chili all'ora quando la caldaia modula al minimo.",
        help: H2("I chili di pellet all'ora quando la caldaia modula al minimo.", "Per la stima del consumo.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_kg_h_max",
        label: "Consumo a potenza 100 %",
        hint: "Chili all'ora quando la caldaia lavora al massimo.",
        help: H2("I chili di pellet all'ora quando la caldaia lavora al massimo.", "Per la stima del consumo.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_kg_h_mantenimento",
        label: "Consumo in stand-by e spegnimento",
        help: H2("I chili all'ora consumati durante lo stand-by e lo spegnimento.", "Per la stima del consumo.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_g_accensione",
        label: "Consumo per accensione",
        help: H2("I grammi di pellet usati a ogni accensione.", "Per la stima del consumo.")
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_fattore",
        label: "Fattore di taratura",
        hint: "Pellet realmente consumato diviso la stima: 1,10 = la stima \xE8 bassa del 10 %.",
        help: H2("Pellet realmente consumato diviso la stima: 1,10 significa che la stima \xE8 bassa del 10 %.", "Dopo aver finito un sacco o una scorta, per allineare la stima alla realt\xE0.", "1,00 finch\xE9 non hai un confronto.")
      }
    ]
  },
  {
    id: "pompe",
    group: "taratura",
    master: "input_boolean.centralina_pompe_misura_attiva",
    icon: "mdi:flash-outline",
    title: "Misura delle pompe",
    advanced: true,
    help: H2(
      "Le soglie in watt con cui la scheda capisce se le pompe del collettore e dell'integrazione sono ferme o accese.",
      "Servono solo se cambi le pompe o il misuratore: altrimenti lasciale come sono."
    ),
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.centralina_pompe_misura_attiva",
        label: "Misura della potenza attiva",
        hint: "Spenta se il misuratore \xE8 scollegato: gli indicatori delle pompe spariscono.",
        help: H2("Attiva la lettura della potenza delle pompe. Spenta, gli indicatori delle pompe spariscono.", "Spegnila se il misuratore \xE8 scollegato.")
      },
      { kind: "number", entity: "input_number.centralina_pompe_w_ferme", label: "Pompe ferme sotto", help: H2("Sotto questa potenza le pompe sono considerate ferme.", "Alzala se il misuratore legge un po' anche a pompe ferme.") },
      { kind: "number", entity: "input_number.centralina_pompe_w_collettore_max", label: "Solo collettore fino a", help: H2("Fino a questa potenza \xE8 accesa solo la pompa del collettore.", "Si ritara con le misure reali delle due pompe.") },
      { kind: "number", entity: "input_number.centralina_pompe_w_entrambe_min", label: "Entrambe le pompe da", help: H2("Da questa potenza risultano accese entrambe le pompe.", "Si ritara con le misure reali delle due pompe.") },
      { kind: "number", entity: "input_number.centralina_pompa_integrazione_w_min", label: "Integrazione accesa sopra (Shelly 1PM)", help: H2("Sopra questa potenza, misurata dallo Shelly 1PM, la pompa di integrazione \xE8 considerata accesa.", "Si ritara se cambi pompa.") }
    ]
  },
  {
    id: "solare",
    group: "taratura",
    icon: "mdi:solar-power-variant",
    title: "Modello del collettore solare",
    advanced: true,
    help: H2(
      "I valori con cui la scheda stima la temperatura del collettore e la resa del sole: posizione dei pannelli, quanto si scaldano e quanto ci mettono.",
      "Si ritarano confrontando la stima con il display del regolatore, a pompa ferma e con il sole pieno; altrimenti lasciali come sono."
    ),
    fields: [
      {
        kind: "number",
        entity: "input_number.solare_termico_k",
        label: "Riscaldamento al sole",
        hint: "Di quanti gradi il collettore ferma supera l'aria per ogni W/m\xB2 di sole sul piano.",
        help: H2("Quanto si scalda il collettore a pompa ferma per ogni W/m\xB2 di sole: pi\xF9 \xE8 alto, pi\xF9 la stima \xE8 calda.", "Alzalo se la stima \xE8 pi\xF9 fredda del display del regolatore a sole pieno, abbassalo nel caso opposto.", "0,078 (ritarato il 15/10/2026).")
      },
      {
        kind: "number",
        entity: "input_number.solare_termico_tau",
        label: "Inerzia del collettore",
        hint: "Quanto tempo ci mette a scaldarsi e a raffreddarsi.",
        help: H2("La costante di tempo con cui la stima segue la temperatura che il sole richiederebbe.", "Alzala se la stima sale e scende troppo in fretta rispetto al display, abbassala nel caso opposto.", "120 minuti (ritarato il 15/10/2026).")
      },
      {
        kind: "number",
        entity: "input_number.solare_termico_inclinazione",
        label: "Inclinazione dei collettori",
        hint: "Rispetto all'orizzontale: 0\xB0 piatti, 90\xB0 verticali.",
        help: H2("L'inclinazione reale dei pannelli, per calcolare quanto sole ricevono.", "Si cambia solo se si spostano i pannelli.", "22\xB0.")
      },
      {
        kind: "number",
        entity: "input_number.solare_termico_orientamento",
        label: "Orientamento dei collettori",
        hint: "180\xB0 \xE8 sud, 270\xB0 \xE8 ovest.",
        help: H2("La direzione verso cui guardano i pannelli.", "Si cambia solo se si spostano i pannelli.", "270\xB0 (ovest).")
      },
      {
        kind: "number",
        entity: "input_number.solare_fattore_stazione",
        label: "Correzione del sensore di sole",
        hint: "Il sensore della stazione legge circa il 54 % del satellite: 1,6 lo porta a valori reali.",
        help: H2("Moltiplica il sole misurato dalla stazione per ottenere i W/m\xB2 reali nei grafici di confronto con il satellite e l'allsky. Non cambia il sensore originale.", "Si ritara se il sensore viene spostato o sostituito.", "1,6.")
      },
      {
        kind: "number",
        entity: "input_number.solare_pannello_fattore_sereno",
        label: "Correzione del cielo sereno",
        hint: "Aggiusta la previsione della massima del pannello nelle giornate limpide.",
        help: H2("Moltiplica il sole a cielo sereno usato per prevedere la massima del pannello.", "Si ritara dopo qualche giornata limpida, confrontando la massima prevista con quella raggiunta.", "1,00.")
      },
      {
        kind: "toggle",
        entity: "input_boolean.solare_orizzonte_attivo",
        label: "Considera colline e alberi",
        hint: "Toglie il sole diretto quando il terreno lo nasconde (profilo misurato con l'allsky).",
        help: H2("Quando il sole \xE8 sotto il profilo del terreno, nelle previsioni conta solo la luce diffusa.", "Spegnilo solo per confrontare le previsioni senza il terreno.", "Acceso.")
      }
    ]
  }
];
function num(v2, fallback) {
  const n5 = typeof v2 === "number" ? v2 : Number(v2);
  return Number.isFinite(n5) ? n5 : fallback;
}
var LIVE_PUFFER = ["sensor.puffer_temperatura_effettiva", "sensor.casale_temperatura_boiler"];
var LIVE_BOILER = ["sensor.boiler_solare_alto_stimato"];
function firstNumber(states, ids) {
  for (const id of ids) {
    const st = states[id];
    if (st && st.state !== "unavailable" && st.state !== "unknown" && Number.isFinite(Number(st.state))) return Number(st.state);
  }
  return null;
}
function buildSettingsView(states, sections = SETTINGS_SECTIONS) {
  const out = [];
  for (const sec of sections) {
    const all = [];
    for (const f3 of sec.fields) {
      const st = states[f3.entity];
      if (!st) continue;
      const unavailable = st.state === "unavailable" || st.state === "unknown";
      const isClimate = f3.kind === "climate";
      let value = null;
      if (f3.kind === "number" && !unavailable && Number.isFinite(Number(st.state))) value = Number(st.state);
      if (isClimate && !unavailable && st.attributes.temperature !== null && st.attributes.temperature !== void 0 && Number.isFinite(Number(st.attributes.temperature))) {
        value = Number(st.attributes.temperature);
      }
      all.push({
        kind: f3.kind,
        entity: f3.entity,
        domain: f3.entity.split(".")[0],
        label: f3.label,
        hint: f3.hint,
        help: f3.help,
        on: st.state === "on",
        value,
        unit: isClimate ? "\xB0C" : String(st.attributes.unit_of_measurement ?? ""),
        min: isClimate ? num(st.attributes.min_temp, 30) : num(st.attributes.min, 0),
        max: isClimate ? num(st.attributes.max_temp, 90) : num(st.attributes.max, 100),
        step: (isClimate ? num(st.attributes.target_temp_step, 1) : num(st.attributes.step, 1)) || 1,
        unavailable
      });
    }
    if (!all.length) continue;
    const master = sec.master ? all.find((r6) => r6.entity === sec.master) : void 0;
    const rows = master ? all.filter((r6) => r6 !== master) : all;
    const view = {
      id: sec.id,
      group: sec.group,
      icon: sec.icon,
      title: sec.title,
      advanced: !!sec.advanced,
      help: sec.help,
      master,
      rows,
      summary: "",
      notes: []
    };
    if (sec.id === "integrazione") view.live = { puffer: firstNumber(states, LIVE_PUFFER), boiler: firstNumber(states, LIVE_BOILER) };
    out.push(describeSection(view));
  }
  return out;
}
function decimals(step) {
  const s4 = String(step);
  const i5 = s4.indexOf(".");
  return i5 < 0 ? 0 : s4.length - i5 - 1;
}
function clampValue(v2, min, max, step) {
  const snapped = min + Math.round((v2 - min) / step) * step;
  const c4 = Math.min(max, Math.max(min, snapped));
  return Number(c4.toFixed(decimals(step)));
}
function stepValue(value, dir, min, max, step) {
  const base = value ?? min;
  return clampValue(base + dir * step, min, max, step);
}
function valueText(row) {
  if (row.value === null) return "\u2013";
  const d3 = decimals(row.step);
  return `${row.value.toFixed(d3)}${row.unit ? ` ${row.unit}` : ""}`;
}
function writeService(row, value) {
  if (row.domain === "climate") return { domain: "climate", service: "set_temperature", data: { entity_id: row.entity, temperature: value } };
  if (row.domain === "number") return { domain: "number", service: "set_value", data: { entity_id: row.entity, value } };
  return { domain: "input_number", service: "set_value", data: { entity_id: row.entity, value } };
}
var PENDING_MS = 3e4;
function applyPending(sections, pending, now) {
  const settled = [];
  const out = sections.map((sec) => {
    let touched = false;
    const rows = sec.rows.map((row) => {
      const p3 = pending[row.entity];
      if (!p3 || row.kind === "toggle") return row;
      if (now >= p3.until || row.value === p3.value) {
        settled.push(row.entity);
        return row;
      }
      touched = true;
      return { ...row, value: p3.value, saving: true };
    });
    return touched ? describeSection({ ...sec, rows }) : { ...sec, rows };
  });
  return { sections: out, settled };
}
var byEntity = (rows, entity) => rows.find((r6) => r6.entity === entity);
function italianValue(row) {
  if (!row || row.value === null) return "\u2013";
  return valueText(row).replace(".", ",");
}
function bare(row) {
  return row && row.value !== null ? valueText({ value: row.value, unit: "", step: row.step }).replace(".", ",") : "\u2013";
}
function sectionSummaryText(sec, rows) {
  const g2 = (e5) => byEntity(rows, e5);
  if (sec.master?.unavailable) return "Non disponibile";
  switch (sec.id) {
    case "caldaia":
      return `Acqua ${italianValue(g2("climate.casale_acqua"))} \xB7 puffer ${italianValue(g2("number.casale_setpoint_boiler"))}`;
    case "cless":
      return sec.master?.on ? "Acceso: accumulo CLESS, senza puffer n\xE9 integrazione" : "Spento: boiler solare da 200 L e puffer";
    case "partenze":
      return sec.master?.on ? `Attiva: annulla la partenza se il boiler ha gi\xE0 ${bare(g2("input_number.caldaia_salvaguardia_docce_min"))} docce` : "Disattivata: la caldaia parte sempre con il programma";
    case "acs":
      return `Richiesta sotto ${italianValue(g2("input_number.caldaia_acs_t_accendi"))} \xB7 fine sopra ${italianValue(g2("input_number.caldaia_acs_t_spegni"))}`;
    case "integrazione": {
      const blocco = g2("input_boolean.caldaia_integrazione_blocco_attivo");
      const forza = g2("input_boolean.caldaia_integrazione_forzatura_attiva");
      const parts = [blocco ? blocco.on ? "Blocco attivo" : "Blocco spento" : null, forza?.on ? "forzatura attiva" : null, `testa boiler max ${italianValue(g2("input_number.caldaia_integrazione_temp_max"))}`];
      return parts.filter(Boolean).join(" \xB7 ");
    }
    case "assenza": {
      if (!sec.master?.on) return "Disattivato: la caldaia non si spegne da sola";
      const ospiti = g2("input_boolean.caldaia_assenza_ospiti");
      return `Spegne dopo ${italianValue(g2("input_number.caldaia_assenza_minuti"))} di casa vuota${ospiti?.on ? " \xB7 ospiti in casa" : ""}`;
    }
    case "pellet":
      return `${bare(g2("input_number.caldaia_pellet_kg_h_min"))}\u2013${italianValue(g2("input_number.caldaia_pellet_kg_h_max"))} \xB7 fattore ${bare(g2("input_number.caldaia_pellet_fattore"))}`;
    case "pompe":
      return sec.master?.on ? `Pompe ferme sotto ${italianValue(g2("input_number.centralina_pompe_w_ferme"))}` : "Misura spenta: gli indicatori delle pompe non compaiono";
    case "solare":
      return `k ${bare(g2("input_number.solare_termico_k"))} \xB7 inerzia ${italianValue(g2("input_number.solare_termico_tau"))} \xB7 ${bare(g2("input_number.solare_termico_inclinazione"))}\xB0 verso ${bare(g2("input_number.solare_termico_orientamento"))}\xB0`;
    default: {
      const n5 = rows.length;
      return `${n5} ${n5 === 1 ? "impostazione" : "impostazioni"}`;
    }
  }
}
function sectionNotes(sec, rows) {
  const g2 = (e5) => byEntity(rows, e5);
  if (sec.id === "integrazione") {
    const max = g2("input_number.caldaia_integrazione_temp_max");
    const ist = g2("input_number.caldaia_integrazione_isteresi_max");
    if (max?.value == null) return [];
    const riparte = ist?.value != null ? ` e riparte sotto ${bare({ ...max, value: max.value - ist.value })} \xB0C` : "";
    return [`La pompa smette di scaldare quando la testa del boiler arriva a ${bare(max)} \xB0C${riparte}.`];
  }
  if (sec.id === "cless") {
    return [
      sec.master?.on ? "La scheda mostra l'accumulo CLESS. La salvaguardia delle partenze, il blocco della pompa di integrazione e il tempo per l'acqua pronta sono fermi: la caldaia resta accesa per l'acqua calda." : "Sono attive le regole del boiler solare e del puffer da 50 litri."
    ];
  }
  if (sec.id === "assenza") {
    const min = g2("input_number.caldaia_assenza_minuti");
    const t3 = g2("input_number.caldaia_assenza_t_esterna_min");
    if (!sec.master?.on || min?.value == null) return [];
    const freddo = t3?.value != null ? ` Con meno di ${bare(t3)} \xB0C fuori non la spegne, per non far raffreddare la casa.` : "";
    return [`Se nessuno \xE8 in casa da ${bare(min)} minuti (iPhone e Wi-Fi) la caldaia si spegne; al rientro riparte solo se c'\xE8 un programma attivo.${freddo}`];
  }
  if (sec.id === "acs") {
    const on2 = g2("input_number.caldaia_acs_t_accendi");
    const off2 = g2("input_number.caldaia_acs_t_spegni");
    const em = g2("input_number.caldaia_acs_t_emergenza");
    const sole = g2("input_number.caldaia_acs_potenza_solare_min");
    if (on2?.value == null) return [];
    const fine = off2?.value != null ? ` e resta finch\xE9 arriva a ${bare(off2)} \xB0C` : "";
    const sunNote = sole?.value != null ? ` Se il solare d\xE0 almeno ${bare(sole)} kW la richiesta aspetta${em?.value != null ? `, ma sotto ${bare(em)} \xB0C parte lo stesso` : ""}.` : "";
    return [`Quando la temperatura alta del boiler scende sotto ${bare(on2)} \xB0C parte la richiesta di acqua calda${fine}. Con un programma attivo e il puffer sotto la soglia della salvaguardia, la richiesta riaccende il Polygon.${sunNote}`];
  }
  if (sec.id === "partenze") {
    const docce = g2("input_number.caldaia_salvaguardia_docce_min");
    const t3 = g2("input_number.caldaia_salvaguardia_t_puffer");
    if (!sec.master?.on || docce?.value == null) return [];
    const riparte = t3?.value != null ? ` Riparte quando il termostato chiede calore, o quando l'acqua sanitaria chiede calore con il puffer sotto ${bare(t3)} \xB0C.` : " Riparte quando il termostato chiede calore o l'acqua sanitaria si raffredda.";
    return [`All'ora di un programma, se il boiler ha gi\xE0 almeno ${bare(docce)} docce (conta anche la sonda bassa) e il termostato non chiede calore, la partenza viene annullata: si risparmia pellet.${riparte}`];
  }
  return [];
}
function integrazioneBar(rows, live) {
  const block = byEntity(rows, "input_number.caldaia_integrazione_delta_blocco")?.value;
  const unblock = byEntity(rows, "input_number.caldaia_integrazione_delta_sblocco")?.value;
  if (block == null || unblock == null) return void 0;
  const max = Math.max(Math.ceil(Math.max(block, unblock) * 1.6 / 2) * 2, 10);
  const delta = live && live.puffer !== null && live.boiler !== null ? Number((live.puffer - live.boiler).toFixed(1)) : null;
  const zone = delta === null ? null : delta < block ? "ferma" : delta > unblock ? "gira" : "attesa";
  const pct = (v2) => Math.min(100, Math.max(0, v2 / max * 100));
  const fmtD = (v2) => String(v2).replace(".", ",");
  let text = "";
  if (delta !== null && zone) {
    const quanto = delta >= 0 ? `${fmtD(delta)} \xB0C pi\xF9 caldo del boiler` : `${fmtD(-delta)} \xB0C pi\xF9 freddo del boiler`;
    const effetto = zone === "ferma" ? "la pompa resta ferma: il puffer non scalderebbe il boiler abbastanza." : zone === "gira" ? "la pompa pu\xF2 girare." : "zona di attesa: la pompa resta com'\xE8 (se gira continua, se \xE8 ferma resta ferma).";
    text = `Adesso il puffer \xE8 ${quanto}: ${effetto}`;
  }
  return { max, block, unblock, delta, zone, markerPct: delta === null ? null : pct(delta), blockPct: pct(block), unblockPct: pct(unblock), text };
}
function describeSection(view) {
  const all = view.master ? [view.master, ...view.rows] : view.rows;
  return {
    ...view,
    summary: sectionSummaryText(view, all),
    notes: sectionNotes(view, all),
    bar: view.id === "integrazione" ? integrazioneBar(all, view.live) : void 0
  };
}

// src/settings-dialog.ts
var TAG = "impianto-settings-dialog";
var ImpiantoSettingsDialog = class extends i4 {
  constructor() {
    super(...arguments);
    this.sections = null;
    this.available = [];
    this._open = null;
    this._help = null;
    this._thermoBusy = false;
    this._error = "";
    this._pending = {};
    this._timers = /* @__PURE__ */ new Map();
    this._onKey = (e5) => {
      if (e5.key !== "Escape") return;
      if (this._help) this._help = null;
      else this._close();
    };
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
    for (const t3 of this._timers.values()) window.clearTimeout(t3);
    this._timers.clear();
    if (this._expiry) window.clearTimeout(this._expiry);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }
  async _call(domain, service, data) {
    try {
      this._error = "";
      await this.hass.callService(domain, service, data);
    } catch (err) {
      this._error = `Impossibile salvare: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  _toggle(row) {
    void this._call("input_boolean", row.on ? "turn_off" : "turn_on", { entity_id: row.entity });
  }
  /**
   * Il valore scelto si vede subito; la scrittura parte dopo una breve pausa, così più pressioni di + o − diventano
   * una sola richiesta (la caldaia conferma via cloud dopo parecchi secondi).
   */
  _setNumber(row, value) {
    this._pending[row.entity] = { value, until: Date.now() + PENDING_MS };
    this.requestUpdate();
    if (this._expiry) window.clearTimeout(this._expiry);
    this._expiry = window.setTimeout(() => this.requestUpdate(), PENDING_MS + 100);
    const old = this._timers.get(row.entity);
    if (old) window.clearTimeout(old);
    this._timers.set(
      row.entity,
      window.setTimeout(() => {
        this._timers.delete(row.entity);
        const w2 = writeService(row, this._pending[row.entity]?.value ?? value);
        void this._call(w2.domain, w2.service, w2.data).then(() => {
          if (this._error) delete this._pending[row.entity];
        });
      }, 600)
    );
  }
  _step(row, dir) {
    this._setNumber(row, stepValue(row.value, dir, row.min, row.max, row.step));
  }
  _typed(row, ev) {
    const raw = ev.target.value.replace(",", ".");
    const n5 = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(n5)) {
      ev.target.value = row.value === null ? "" : String(row.value);
      return;
    }
    this._setNumber(row, clampValue(n5, row.min, row.max, row.step));
  }
  _toggleBlock(id) {
    this._open = this._open === id ? null : id;
    if (this._open) void this.updateComplete.then(() => this.renderRoot.querySelector(".block.open")?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }
  /** Link "Quando serve": apre la spiegazione completa (cosa fa, quando serve, valore consigliato). */
  _helpBtn(title, help) {
    if (!help) return A;
    return b2`<button class="why" aria-label="Quando serve: ${title}" @click=${(e5) => {
      e5.stopPropagation();
      this._help = { title, help };
    }}>Quando serve?</button>`;
  }
  _renderRow(row) {
    const text = b2`
      <div class="txt">
        <div class="lab">${row.label}</div>
        <div class="hint">${row.hint ?? row.help?.what ?? ""} ${this._helpBtn(row.label, row.help)}</div>
      </div>
    `;
    if (row.kind === "toggle") {
      return b2`
        <div class="row tog">
          ${text}
          <button
            class=${row.on ? "sw on" : "sw"}
            role="switch"
            aria-checked=${row.on ? "true" : "false"}
            aria-label=${row.label}
            ?disabled=${row.unavailable}
            @click=${() => this._toggle(row)}
          ><span class="knob"></span></button>
        </div>
      `;
    }
    return b2`
      <div class="row">
        ${text}
        <div class="num">
          <button class="st" aria-label="Diminuisci" ?disabled=${row.unavailable || row.value !== null && row.value <= row.min} @click=${() => this._step(row, -1)}>−</button>
          <input
            type="text"
            inputmode="decimal"
            class=${row.saving ? "saving" : ""}
            .value=${row.value === null ? "" : String(row.value)}
            ?disabled=${row.unavailable}
            aria-label=${row.label}
            @change=${(e5) => this._typed(row, e5)}
          />
          <span class="unit">${row.unit}</span>
          <button class="st" aria-label="Aumenta" ?disabled=${row.unavailable || row.value !== null && row.value >= row.max} @click=${() => this._step(row, 1)}>+</button>
        </div>
      </div>
    `;
  }
  /** Le due soglie della pompa su una barra: ferma, attesa, può girare; il segno è la differenza di adesso. */
  _renderBar(b3) {
    const f3 = (v2) => `+${String(v2).replace(".", ",")} \xB0C`;
    return b2`
      <div class="gauge" aria-label="Soglie della pompa di integrazione">
        <div class="gcap">Quanto il puffer è più caldo del boiler</div>
        <div class="mk">${b3.markerPct !== null ? b2`<span style="left:${b3.markerPct}%">adesso ▼</span>` : A}</div>
        <div class="track">
          <div class="seg stop" style="width:${b3.blockPct}%"><span>ferma</span></div>
          <div class="seg wait" style="width:${b3.unblockPct - b3.blockPct}%"><span>attesa</span></div>
          <div class="seg go" style="width:${100 - b3.unblockPct}%"><span>gira</span></div>
        </div>
        <div class="ticks">
          <span style="left:0%">0</span>
          <span style="left:${b3.blockPct}%">${f3(b3.block)}</span>
          <span style="left:${b3.unblockPct}%">${f3(b3.unblock)}</span>
        </div>
        ${b3.text ? b2`<div class="now ${b3.zone ?? ""}">${b3.text}</div>` : A}
      </div>
    `;
  }
  _renderBlock(sec) {
    const open = this._open === sec.id;
    const m2 = sec.master;
    return b2`
      <section class="block ${open ? "open" : ""}">
        <div class="bh" role="button" tabindex="0" aria-expanded=${open ? "true" : "false"} @click=${() => this._toggleBlock(sec.id)} @keydown=${(e5) => {
      if (e5.target === e5.currentTarget && (e5.key === "Enter" || e5.key === " ")) {
        e5.preventDefault();
        this._toggleBlock(sec.id);
      }
    }}>
          <ha-icon icon=${sec.icon}></ha-icon>
          <div class="bt"><div class="bn">${sec.title}</div><div class="bs">${sec.summary}</div></div>
          ${m2 ? b2`<button
                class=${m2.on ? "sw on" : "sw"}
                role="switch"
                aria-checked=${m2.on ? "true" : "false"}
                aria-label=${m2.label}
                title=${m2.label}
                ?disabled=${m2.unavailable}
                @click=${(e5) => {
      e5.stopPropagation();
      this._toggle(m2);
    }}
              ><span class="knob"></span></button>` : A}
          <span class="chev">${open ? "\u25BE" : "\u25B8"}</span>
        </div>
        ${open ? b2`<div class="bb">
              <p class="intro">${m2?.hint ?? sec.help.what} ${this._helpBtn(sec.title, sec.help)}</p>
              ${sec.bar ? this._renderBar(sec.bar) : A}
              ${sec.notes.map((n5) => b2`<p class="note">${n5}</p>`)}
              ${sec.rows.map((r6) => this._renderRow(r6))}
            </div>` : A}
      </section>
    `;
  }
  /** Le preferenze del termostato stanno nell'altra integrazione: si apre la sua finestra. */
  async _openThermostat() {
    this._thermoBusy = true;
    this._error = "";
    try {
      const cw = this.hass.callWS;
      if (!cw) throw new Error("callWS non disponibile");
      const info = await cw.call(this.hass, { type: "termostato_riscaldamento/info" });
      const d3 = document.createElement("termostato-settings-dialog");
      d3.hass = this.hass;
      d3.info = info;
      document.body.appendChild(d3);
    } catch (err) {
      this._error = `Termostato non raggiungibile: ${err instanceof Error ? err.message : err?.message ?? String(err)}`;
    } finally {
      this._thermoBusy = false;
    }
  }
  _renderThermostatBlock() {
    if (!customElements.get("termostato-settings-dialog")) return A;
    const id = "termostato";
    const open = this._open === id;
    const help = {
      what: "Antigelo, limiti dell'obiettivo, durata del timer, comportamento a casa vuota, annunci vocali e collegamenti del termostato ambiente.",
      when: "Per cambiare come il termostato scalda quando non c'\xE8 il programma o quando la casa \xE8 vuota."
    };
    return b2`
      <section class="block ${open ? "open" : ""}">
        <div class="bh" role="button" tabindex="0" aria-expanded=${open ? "true" : "false"} @click=${() => this._toggleBlock(id)} @keydown=${(e5) => {
      if (e5.key === "Enter" || e5.key === " ") this._toggleBlock(id);
    }}>
          <ha-icon icon="mdi:thermostat"></ha-icon>
          <div class="bt"><div class="bn">Termostato ambiente</div><div class="bs">Antigelo, timer, casa vuota, annunci</div></div>
          <span class="chev">${open ? "\u25BE" : "\u25B8"}</span>
        </div>
        ${open ? b2`<div class="bb">
              <p class="intro">${help.what} ${this._helpBtn("Termostato ambiente", help)}</p>
              <div class="row"><div class="txt"><div class="lab">Preferenze del termostato</div><div class="hint">Si apre la sua finestra.</div></div><button class="btn" ?disabled=${this._thermoBusy} @click=${() => void this._openThermostat()}>Apri</button></div>
            </div>` : A}
      </section>
    `;
  }
  /** Blocco «Cosa mostrare»: un interruttore per ogni sezione della scheda; l'ultima rimasta non si spegne. */
  _renderSections() {
    const s4 = this.sections;
    if (!s4 || this.available.length < 2) return A;
    const open = this._open === "sezioni";
    const onlyOne = visibleKeys(s4).length <= 1;
    return b2`
      <h3 class="grp">Pagina</h3>
      <section class="block ${open ? "open" : ""}">
        <div class="bh" role="button" tabindex="0" aria-expanded=${open ? "true" : "false"} @click=${() => this._toggleBlock("sezioni")} @keydown=${(e5) => {
      if (e5.key === "Enter" || e5.key === " ") this._toggleBlock("sezioni");
    }}>
          <ha-icon icon="mdi:view-dashboard-outline"></ha-icon>
          <div class="bt"><div class="bn">Cosa mostrare</div><div class="bs">${sectionsSummary(s4)}</div></div>
          <span class="chev">${open ? "\u25BE" : "\u25B8"}</span>
        </div>
        ${open ? b2`<div class="bb">
              <p class="intro">Scegli quali schede vedere in questa pagina. La scelta vale per il tuo utente e resta salvata in Home Assistant, anche su altri dispositivi.</p>
              ${this.available.map((k2) => {
      const on2 = s4[k2];
      const locked = on2 && onlyOne;
      const info = SECTION_INFO[k2];
      return b2`<div class="row tog">
                  <div class="txt"><div class="lab">${info.label}</div><div class="hint">${locked ? "Almeno una sezione deve restare visibile." : info.hint}</div></div>
                  <button class=${on2 ? "sw on" : "sw"} role="switch" aria-checked=${on2 ? "true" : "false"} aria-label=${info.label} ?disabled=${locked} @click=${() => this.dispatchEvent(new CustomEvent("sections-toggle", { detail: k2 }))}><span class="knob"></span></button>
                </div>`;
    })}
            </div>` : A}
      </section>
    `;
  }
  _renderHelp() {
    if (!this._help) return A;
    const { title, help } = this._help;
    return b2`
      <div class="hback" @click=${(e5) => e5.target === e5.currentTarget && (this._help = null)}>
        <div class="hbox" role="dialog" aria-modal="true" aria-label=${title}>
          <div class="ht">${title}</div>
          <div class="hs">Cosa fa</div><p>${help.what}</p>
          <div class="hs">Quando serve</div><p>${help.when}</p>
          ${help.suggested ? b2`<div class="hs">Valore consigliato</div><p>${help.suggested}</p>` : A}
          <button class="btn primary" @click=${() => this._help = null}>Ho capito</button>
        </div>
      </div>
    `;
  }
  render() {
    if (!this.hass) return A;
    const built = applyPending(buildSettingsView(this.hass.states), this._pending, Date.now());
    for (const e5 of built.settled) delete this._pending[e5];
    const thermo = this._renderThermostatBlock();
    const groups = SETTINGS_GROUPS.map((g2) => ({ g: g2, secs: built.sections.filter((x2) => x2.group === g2.id), extra: g2.id === "casa" ? thermo : A })).filter(
      (x2) => x2.secs.length || x2.extra !== A
    );
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Preferenze impianto">
          <div class="head">
            <div class="title">Preferenze impianto</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            ${groups.length === 0 ? b2`<div class="empty">Nessuna impostazione trovata: installa i pacchetti Home Assistant del progetto (cartella ha-packages).</div>` : b2`
                  <p class="lead">Tocca un blocco per aprirlo e cambiare i valori: ogni modifica vale subito. Gli interruttori accendono e spengono la funzione senza aprire il blocco.</p>
                  ${this._renderSections()}
                  ${groups.map(
      ({ g: g2, secs, extra }) => b2`
                      <h3 class="grp">${g2.title}</h3>
                      ${g2.note ? b2`<div class="gnote">${g2.note}</div>` : A}
                      ${secs.map((sec) => this._renderBlock(sec))}
                      ${extra}
                    `
    )}
                `}
            ${this._error ? b2`<div class="err">${this._error}</div>` : A}
          </div>
          ${this._renderHelp()}
        </div>
      </div>
    `;
  }
  static {
    this.styles = i`
    :host {
      position: fixed;
      inset: 0;
      z-index: 10000;
      color: var(--primary-text-color, #212121);
      font-family: var(--paper-font-body1_-_font-family, Roboto, Helvetica, Arial, sans-serif);
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      box-sizing: border-box;
    }
    .panel {
      position: relative;
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      width: 100%;
      max-width: 560px;
      max-height: min(86vh, 760px);
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
      overflow: hidden;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    }
    .title {
      font-size: 19px;
      font-weight: 700;
    }
    .x {
      background: none;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;
    }
    .x:hover {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
    }
    .body {
      overflow-y: auto;
      padding: 4px 18px 18px;
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 9px 0;
      border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    .txt {
      min-width: 0;
      flex: 1;
    }
    .lab {
      font-size: 15px;
      font-weight: 500;
    }
    .hint {
      font-size: 12.5px;
      line-height: 1.35;
      color: var(--secondary-text-color, #727272);
      margin-top: 2px;
    }
    .why {
      background: none;
      border: none;
      padding: 4px 2px;
      font: inherit;
      font-size: 12.5px;
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      white-space: nowrap;
    }
    .lead {
      margin: 14px 0 0;
      font-size: 13.5px;
      line-height: 1.4;
      color: var(--secondary-text-color, #727272);
    }
    .grp {
      margin: 20px 2px 0;
      font-size: 12.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--primary-color, #03a9f4);
    }
    .gnote {
      margin: 2px 2px 0;
      font-size: 12.5px;
      color: var(--secondary-text-color, #727272);
    }
    .intro {
      margin: 10px 0 2px;
      font-size: 14px;
      line-height: 1.4;
    }
    .note {
      margin: 10px 0 2px;
      padding: 8px 10px;
      border-radius: 10px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      font-size: 13px;
      line-height: 1.4;
    }
    .gauge {
      margin: 12px 0 6px;
      padding: 0 14px;
    }
    .gcap {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
      margin-bottom: 6px;
    }
    .track {
      position: relative;
      display: flex;
      height: 26px;
      border-radius: 13px;
      overflow: hidden;
    }
    .seg {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      font-size: 11.5px;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
    }
    .seg.stop {
      background: var(--error-color, #db4437);
    }
    .seg.wait {
      background: var(--warning-color, #ffa600);
    }
    .seg.go {
      background: var(--success-color, #43a047);
    }
    .mk {
      position: relative;
      height: 16px;
      font-size: 11.5px;
      font-weight: 600;
    }
    .mk span {
      position: absolute;
      bottom: 0;
      transform: translateX(-50%);
      white-space: nowrap;
    }
    .ticks {
      position: relative;
      height: 18px;
      margin-top: 3px;
      font-size: 11.5px;
      color: var(--secondary-text-color, #727272);
    }
    .ticks span {
      position: absolute;
      transform: translateX(-50%);
      white-space: nowrap;
    }
    .ticks span:first-child {
      transform: none;
    }
    .now {
      margin-top: 6px;
      font-size: 13px;
      line-height: 1.4;
      font-weight: 500;
    }
    .sw {
      flex: none;
      width: 54px;
      height: 30px;
      border-radius: 15px;
      border: none;
      padding: 0;
      background: var(--disabled-text-color, #9e9e9e);
      position: relative;
      cursor: pointer;
      transition: background 0.15s;
    }
    .sw.on {
      background: var(--primary-color, #03a9f4);
    }
    .sw .knob {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.15s;
    }
    .sw.on .knob {
      transform: translateX(24px);
    }
    .sw:disabled,
    .st:disabled,
    input:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .num {
      flex: none;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .st {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: inherit;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
    }
    input {
      width: 66px;
      min-height: 44px;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      padding: 6px 4px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--card-background-color, #fff);
      color: inherit;
      box-sizing: border-box;
    }
    input.saving {
      border-color: var(--primary-color, #03a9f4);
      font-style: italic;
    }
    .unit {
      min-width: 22px;
      font-size: 13px;
      color: var(--secondary-text-color, #727272);
    }
    .block {
      margin-top: 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 14px;
      overflow: hidden;
    }
    .block.open {
      border-color: var(--primary-color, #03a9f4);
    }
    .bh {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 58px;
      padding: 6px 12px;
      cursor: pointer;
    }
    .bh ha-icon {
      --mdc-icon-size: 26px;
      flex: none;
      color: var(--secondary-text-color, #727272);
    }
    .bt {
      flex: 1;
      min-width: 0;
    }
    .bn {
      font-size: 16px;
      font-weight: 600;
    }
    .bs {
      font-size: 12.5px;
      line-height: 1.35;
      color: var(--secondary-text-color, #727272);
    }
    .chev {
      width: 18px;
      text-align: center;
      color: var(--secondary-text-color, #727272);
    }
    .bb {
      padding: 0 12px 8px;
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
    }
    .bb .row:last-child {
      border-bottom: none;
    }
    .btn {
      min-height: 44px;
      padding: 8px 18px;
      border-radius: 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: inherit;
      font-size: 15px;
      cursor: pointer;
    }
    .btn.primary {
      background: var(--primary-color, #03a9f4);
      color: #fff;
      border-color: transparent;
    }
    .hback {
      position: absolute;
      inset: 0;
      z-index: 2;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px;
    }
    .hbox {
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      padding: 16px 18px;
      max-width: 420px;
      max-height: 90%;
      overflow-y: auto;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    }
    .ht {
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .hs {
      margin-top: 8px;
      font-size: 11.5px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--secondary-text-color, #727272);
    }
    .hbox p {
      margin: 2px 0 0;
      font-size: 15px;
      line-height: 1.4;
    }
    .hbox .btn {
      margin-top: 14px;
      width: 100%;
    }
    .empty,
    .err {
      margin-top: 16px;
      font-size: 14px;
    }
    .err {
      color: var(--error-color, #db4437);
    }
    @media (max-width: 480px) {
      .row:not(.tog) {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      .num {
        justify-content: flex-end;
      }
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], ImpiantoSettingsDialog.prototype, "hass", 2);
__decorateClass([
  n4({ attribute: false })
], ImpiantoSettingsDialog.prototype, "sections", 2);
__decorateClass([
  n4({ attribute: false })
], ImpiantoSettingsDialog.prototype, "available", 2);
__decorateClass([
  r5()
], ImpiantoSettingsDialog.prototype, "_open", 2);
__decorateClass([
  r5()
], ImpiantoSettingsDialog.prototype, "_help", 2);
__decorateClass([
  r5()
], ImpiantoSettingsDialog.prototype, "_thermoBusy", 2);
__decorateClass([
  r5()
], ImpiantoSettingsDialog.prototype, "_error", 2);
if (!customElements.get(TAG)) customElements.define(TAG, ImpiantoSettingsDialog);

// src/info-dialog.ts
var TAG2 = "impianto-info-dialog";
var ImpiantoInfoDialog = class extends i4 {
  constructor() {
    super(...arguments);
    this.lines = [];
    this._onKey = (e5) => {
      if (e5.key === "Escape") this._close();
    };
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }
  render() {
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Stato dell'impianto">
          <div class="head">
            <div class="title">Stato dell'impianto</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            ${this.lines.length === 0 ? b2`<div class="empty">Nessuna informazione disponibile.</div>` : this.lines.map(
      (l3) => b2`<div class="line ${l3.tone}"><ha-icon icon=${l3.icon}></ha-icon><span>${l3.text}</span></div>`
    )}
          </div>
        </div>
      </div>
      ${A}
    `;
  }
  static {
    this.styles = i`
    :host {
      position: fixed;
      inset: 0;
      z-index: 10000;
      color: var(--primary-text-color, #212121);
      font-family: var(--paper-font-body1_-_font-family, Roboto, Helvetica, Arial, sans-serif);
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      box-sizing: border-box;
    }
    .panel {
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      max-height: min(86vh, 700px);
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
      overflow: hidden;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    }
    .title {
      font-size: 19px;
      font-weight: 700;
    }
    .x {
      background: none;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;
    }
    .x:hover {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
    }
    .body {
      overflow-y: auto;
      padding: 8px 18px 18px;
    }
    .line {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 10px 0;
      font-size: 15px;
      line-height: 1.4;
      border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    .line:last-child {
      border-bottom: none;
    }
    .line ha-icon {
      --mdc-icon-size: 22px;
      flex: none;
      color: var(--secondary-text-color, #727272);
    }
    .line.ok ha-icon {
      color: #22c55e;
    }
    .line.warn ha-icon {
      color: #f59e0b;
    }
    .line.bad {
      color: #ef4444;
      font-weight: 600;
    }
    .line.bad ha-icon {
      color: #ef4444;
    }
    .empty {
      padding: 16px 0;
      color: var(--secondary-text-color, #727272);
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], ImpiantoInfoDialog.prototype, "lines", 2);
if (!customElements.get(TAG2)) customElements.define(TAG2, ImpiantoInfoDialog);

// src/details-dialog.ts
var TAG3 = "impianto-details-dialog";
var ImpiantoDetailsDialog = class extends i4 {
  constructor() {
    super(...arguments);
    this.groups = [];
    this._onKey = (e5) => {
      if (e5.key === "Escape") this._close();
    };
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }
  render() {
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Altri dati della caldaia">
          <div class="head">
            <div class="title">Altri dati della caldaia</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            ${this.groups.length === 0 ? b2`<div class="empty">Nessun dato disponibile.</div>` : A}
            ${this.groups.map(
      (g2) => b2`
                <div class="gt">${g2.title}</div>
                <div class="grid">
                  ${g2.tiles.map(
        (t3) => b2`<div class="tile"><span class="tl">${t3.label}</span><span class="tv" style=${t3.color ? `color:${t3.color}` : ""}>${t3.value}</span></div>`
      )}
                </div>`
    )}
          </div>
        </div>
      </div>
    `;
  }
  static {
    this.styles = i`
    :host {
      position: fixed;
      inset: 0;
      z-index: 10000;
      color: var(--primary-text-color, #212121);
      font-family: var(--paper-font-body1_-_font-family, Roboto, Helvetica, Arial, sans-serif);
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      box-sizing: border-box;
    }
    .panel {
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      width: 100%;
      max-width: 560px;
      max-height: min(86vh, 700px);
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
      overflow: hidden;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    }
    .title {
      font-size: 19px;
      font-weight: 700;
    }
    .x {
      background: none;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      padding: 10px 14px;
      border-radius: 10px;
    }
    .body {
      overflow-y: auto;
      padding: 4px 18px 18px;
    }
    .gt {
      margin: 14px 0 6px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--secondary-text-color, #727272);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 8px;
    }
    .tile {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      border-radius: 10px;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .tl {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
    }
    .tv {
      font-size: 18px;
      font-weight: 700;
    }
    .empty {
      padding: 16px 0;
      color: var(--secondary-text-color, #727272);
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], ImpiantoDetailsDialog.prototype, "groups", 2);
if (!customElements.get(TAG3)) customElements.define(TAG3, ImpiantoDetailsDialog);

// src/charts-logic.ts
function toMs(v2) {
  if (v2 === void 0 || v2 === null) return null;
  if (typeof v2 === "number") return v2 < 1e11 ? v2 * 1e3 : v2;
  const d3 = Date.parse(v2);
  return Number.isNaN(d3) ? null : d3;
}
function rawTime(r6) {
  return toMs(r6.lu ?? r6.last_updated ?? r6.lc ?? r6.last_changed);
}
function rawState(r6) {
  return r6.s ?? r6.state;
}
function parseNumeric(raw) {
  const out = [];
  for (const r6 of raw ?? []) {
    const t3 = rawTime(r6);
    const s4 = rawState(r6);
    if (t3 === null || s4 === void 0 || s4 === "" || s4 === "unavailable" || s4 === "unknown") continue;
    const v2 = Number(s4);
    if (Number.isFinite(v2)) out.push({ t: t3, v: v2 });
  }
  return out.sort((a3, b3) => a3.t - b3.t);
}
function parseStates(raw) {
  const out = [];
  for (const r6 of raw ?? []) {
    const t3 = rawTime(r6);
    const s4 = rawState(r6);
    if (t3 !== null && s4 !== void 0) out.push({ t: t3, s: s4 });
  }
  return out.sort((a3, b3) => a3.t - b3.t);
}
var MAX_GAP_MS = 3 * 3600 * 1e3;
function resample(pts, t0, t1, n5, maxGap = MAX_GAP_MS) {
  const out = new Array(n5).fill(null);
  if (n5 <= 0 || t1 <= t0) return out;
  const dt = (t1 - t0) / n5;
  let idx = 0;
  let curV = null;
  let curT = 0;
  for (let i5 = 0; i5 < n5; i5++) {
    const a3 = t0 + i5 * dt;
    const b3 = a3 + dt;
    while (idx < pts.length && pts[idx].t <= a3) {
      curV = pts[idx].v;
      curT = pts[idx].t;
      idx++;
    }
    let sum = 0;
    let cov = 0;
    let segStart = a3;
    let v2 = curV;
    let vT = curT;
    const addSeg = (end) => {
      if (v2 === null) return;
      const validEnd = Math.min(end, vT + maxGap);
      const len = validEnd - segStart;
      if (len > 0) {
        sum += v2 * len;
        cov += len;
      }
    };
    let k2 = idx;
    while (k2 < pts.length && pts[k2].t < b3) {
      addSeg(pts[k2].t);
      segStart = pts[k2].t;
      v2 = pts[k2].v;
      vT = pts[k2].t;
      k2++;
    }
    addSeg(b3);
    out[i5] = cov > 0 ? sum / cov : null;
  }
  return out;
}
function seriesStats(values) {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let cnt = 0;
  let last = null;
  for (const v2 of values) {
    if (v2 === null) continue;
    if (v2 < min) min = v2;
    if (v2 > max) max = v2;
    sum += v2;
    cnt++;
    last = v2;
  }
  return cnt === 0 || last === null ? null : { min, max, avg: sum / cnt, last };
}
function niceStep(raw) {
  const p3 = Math.pow(10, Math.floor(Math.log10(raw)));
  const f3 = raw / p3;
  const m2 = f3 <= 1 ? 1 : f3 <= 2 ? 2 : f3 <= 2.5 ? 2.5 : f3 <= 5 ? 5 : 10;
  return m2 * p3;
}
function niceAxis(min, max, count = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1, ticks: [0, 1] };
  if (max - min < 1e-9) {
    const c4 = min;
    min = c4 - 1;
    max = c4 + 1;
  }
  const step = niceStep((max - min) / Math.max(1, count - 1));
  const lo = Math.floor(min / step + 1e-9) * step;
  const hi = Math.ceil(max / step - 1e-9) * step;
  const ticks = [];
  for (let v2 = lo; v2 <= hi + step * 1e-6; v2 += step) ticks.push(Math.round(v2 / step) * step);
  return { min: lo, max: hi, ticks };
}
var DAYS = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
function hhmm(d3) {
  return `${String(d3.getHours()).padStart(2, "0")}:${String(d3.getMinutes()).padStart(2, "0")}`;
}
var STEPS_H = [1, 2, 3, 6, 12, 24, 48];
function timeTicks(t0, t1, maxTicks = 6) {
  const hours = (t1 - t0) / 36e5;
  const stepH = STEPS_H.find((s4) => hours / s4 <= maxTicks) ?? 48;
  const stepMs = stepH * 36e5;
  const first = new Date(t0);
  first.setMinutes(0, 0, 0);
  if (stepH >= 24) first.setHours(0);
  else first.setHours(Math.ceil(first.getHours() / stepH) * stepH);
  const out = [];
  for (let t3 = first.getTime(); t3 <= t1; t3 += stepMs) {
    if (t3 < t0) continue;
    const d3 = new Date(t3);
    const major = d3.getHours() === 0;
    out.push({ t: t3, major, label: hours > 30 ? major ? `${DAYS[d3.getDay()]} ${d3.getDate()}` : hhmm(d3) : hhmm(d3) });
  }
  return out;
}
function formatMoment(t3) {
  const d3 = new Date(t3);
  const mesi = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  return `${DAYS[d3.getDay()]} ${d3.getDate()} ${mesi[d3.getMonth()]}, ${hhmm(d3)}`;
}
function linePath(values, xOf, yOf) {
  let d3 = "";
  let pen = false;
  for (let i5 = 0; i5 < values.length; i5++) {
    const v2 = values[i5];
    if (v2 === null) {
      pen = false;
      continue;
    }
    d3 += `${pen ? "L" : "M"}${xOf(i5).toFixed(1)} ${yOf(v2).toFixed(1)}`;
    pen = true;
  }
  return d3;
}
function statusSegments(states, t0, t1) {
  const out = [];
  let cur = null;
  for (const p3 of states) {
    if (p3.t <= t0) cur = p3;
    else break;
  }
  let from = t0;
  let state = cur?.s ?? "";
  for (const p3 of states) {
    if (p3.t <= t0 || p3.t >= t1) continue;
    if (state !== "") out.push({ from, to: p3.t, state });
    from = p3.t;
    state = p3.s;
  }
  if (state !== "" && from < t1) out.push({ from, to: t1, state });
  const merged = [];
  for (const s4 of out) {
    const last = merged[merged.length - 1];
    if (last && last.state === s4.state && last.to === s4.from) last.to = s4.to;
    else merged.push({ ...s4 });
  }
  return merged;
}
function stateAt(states, t3) {
  let cur = null;
  for (const p3 of states) {
    if (p3.t <= t3) cur = p3.s;
    else break;
  }
  return cur;
}
function stoveStateColor(state) {
  const s4 = state.trim().toUpperCase();
  if (["WORK", "LAVORO", "WORKING"].includes(s4)) return "#ef4444";
  if (["START", "WAIT", "AVVIO", "ATTESA", "ACCENSIONE"].includes(s4)) return "#f59e0b";
  if (s4 === "ECO STOP") return "#60a5fa";
  if (["STAND BY", "STANDBY"].includes(s4)) return "#a78bfa";
  if (s4.startsWith("ALARM") || s4 === "ALLARME") return "#b91c1c";
  if (["UNAVAILABLE", "UNKNOWN"].includes(s4)) return "transparent";
  return "#475569";
}
var S3 = {
  puffer: { id: "puffer", entityKey: "puffer_effective", label: "Puffer 50 L", unit: "\xB0C", color: "#f97316", axis: "l", decimals: 1 },
  boilerTop: { id: "boilerTop", entityKey: "boiler_top", label: "Boiler alto (S3)", unit: "\xB0C", color: "#ef4444", axis: "l", decimals: 1 },
  boilerBottom: { id: "boilerBottom", entityKey: "boiler_bottom", label: "Boiler basso (S2)", unit: "\xB0C", color: "#3b82f6", axis: "l", decimals: 1 },
  integIn: { id: "integIn", entityKey: "coil_integ_in", label: "Puffer, pozzetto c (generatore)", unit: "\xB0C", color: "#ec4899", axis: "l", decimals: 1 },
  integOut: { id: "integOut", entityKey: "coil_integ_out", label: "Puffer, pozzetto b (minima riscaldamento)", unit: "\xB0C", color: "#0ea5e9", axis: "l", decimals: 1 },
  stoveWater: { id: "stoveWater", entityKey: "stove_water", label: "Acqua caldaia", unit: "\xB0C", color: "#a855f7", axis: "l", decimals: 1 },
  collector: { id: "collector", entityKey: "collector_temp", label: "Collettore solare", unit: "\xB0C", color: "#eab308", axis: "l", decimals: 1 },
  smoke: { id: "smoke", entityKey: "smoke", label: "Fumi", unit: "\xB0C", color: "#94a3b8", axis: "l", decimals: 0 },
  power: { id: "power", entityKey: "power", label: "Potenza caldaia", unit: "%", color: "#22c55e", axis: "r", decimals: 0 },
  integW: { id: "integW", entityKey: "integration_power", label: "Pompa integrazione", unit: "W", color: "#22c55e", axis: "r", decimals: 0 },
  solarIn: { id: "solarIn", entityKey: "coil_solar_in", label: "Serpentina solare, ingresso", unit: "\xB0C", color: "#f59e0b", axis: "l", decimals: 1 },
  solarOut: { id: "solarOut", entityKey: "coil_solar_out", label: "Serpentina solare, uscita", unit: "\xB0C", color: "#06b6d4", axis: "l", decimals: 1 },
  solarKw: { id: "solarKw", entityKey: "solar_power", label: "Potenza solare", unit: "kW", color: "#22c55e", axis: "r", decimals: 2 },
  gtiStation: { id: "gtiStation", entityKey: "gti_station", label: "Irraggiamento sul piano (stazione)", unit: "W/m\xB2", color: "#f59e0b", axis: "l", decimals: 0 },
  gtiForecast: { id: "gtiForecast", entityKey: "gti_forecast", label: "Irraggiamento previsto (Open-Meteo)", unit: "W/m\xB2", color: "#3b82f6", axis: "l", decimals: 0 },
  gtiSatellite: { id: "gtiSatellite", entityKey: "gti_satellite", label: "Irraggiamento osservato (satellite)", unit: "W/m\xB2", color: "#22c55e", axis: "l", decimals: 0, timeShiftMs: -2 * 36e5 },
  cloudForecast: { id: "cloudForecast", entityKey: "cloud_forecast", label: "Nuvolosit\xE0 prevista", unit: "%", color: "#94a3b8", axis: "r", decimals: 0 },
  stationRaw: { id: "stationRaw", entityKey: "irr_station_raw", label: "Irraggiamento orizzontale (stazione, originale)", unit: "W/m\xB2", color: "#9ca3af", axis: "l", decimals: 0 },
  stationCorr: { id: "stationCorr", entityKey: "irr_station_corrected", label: "Irraggiamento orizzontale (stazione, corretto)", unit: "W/m\xB2", color: "#f59e0b", axis: "l", decimals: 0 },
  allskyIrr: { id: "allskyIrr", entityKey: "allsky_irradiance", label: "Irraggiamento orizzontale (stimato dall'allsky)", unit: "W/m\xB2", color: "#8b5cf6", axis: "l", decimals: 0 },
  allskyCloud: { id: "allskyCloud", entityKey: "allsky_cloud", label: "Copertura nuvolosa (allsky)", unit: "%", color: "#64748b", axis: "r", decimals: 0 },
  collectorW: { id: "collectorW", entityKey: "collector_power", label: "Alimentazione Elios (pompa collettore)", unit: "W", color: "#84cc16", axis: "r", decimals: 0 }
};
var on = (s4) => ({ ...s4, on: true });
var off = (s4) => ({ ...s4, on: false });
var CHART_GROUPS = [
  {
    id: "temperature",
    title: "Temperature",
    series: [on(S3.puffer), on(S3.boilerTop), on(S3.boilerBottom), on(S3.stoveWater), off(S3.collector)]
  },
  {
    id: "caldaia",
    title: "Caldaia",
    series: [on(S3.stoveWater), on(S3.puffer), off(S3.smoke), on(S3.power)]
  },
  {
    id: "integrazione",
    title: "Pompa di integrazione",
    series: [on(S3.puffer), on(S3.boilerTop), off(S3.integIn), off(S3.integOut), on(S3.integW)]
  },
  {
    id: "irraggiamento",
    title: "Irraggiamento",
    series: [on(S3.gtiStation), on(S3.gtiForecast), on(S3.gtiSatellite), on(S3.cloudForecast)]
  },
  {
    id: "allsky",
    title: "AllSky",
    series: [off(S3.stationRaw), on(S3.stationCorr), on(S3.allskyIrr), on(S3.allskyCloud), off(S3.cloudForecast)]
  },
  {
    id: "solare",
    title: "Solare",
    series: [on(S3.collector), on(S3.solarIn), on(S3.solarOut), on(S3.boilerBottom), off(S3.solarKw)]
  }
];
var CLESS_LABELS = {
  puffer: "Puffer S. BOILER (caldaia)",
  boilerTop: "Puffer alto (S3)",
  boilerBottom: "Puffer basso (S2)",
  integIn: "Puffer generatore (c)",
  integOut: "Puffer minima riscaldamento (b)"
};
function clessSeries(s4) {
  const label = CLESS_LABELS[s4.id];
  return label ? { ...s4, label } : s4;
}
function chartGroups(cless = false) {
  if (!cless) return CHART_GROUPS;
  return CHART_GROUPS.map(
    (g2) => g2.id === "integrazione" ? { id: "puffer", title: "Puffer", series: [on(S3.boilerTop), on(S3.boilerBottom), on(S3.puffer), on(S3.integIn), on(S3.integOut)].map(clessSeries) } : { ...g2, series: g2.series.map(clessSeries) }
  );
}
var ROOM_COLORS = ["#f97316", "#22c55e", "#a855f7", "#ec4899", "#0ea5e9", "#14b8a6", "#eab308", "#ef4444"];
function lighten(hex, amount) {
  const m2 = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m2) return hex;
  const n5 = parseInt(m2[1], 16);
  const mix = (c4) => Math.round(c4 + (255 - c4) * amount);
  const r6 = mix(n5 >> 16 & 255), g2 = mix(n5 >> 8 & 255), b3 = mix(n5 & 255);
  return `#${(1 << 24 | r6 << 16 | g2 << 8 | b3).toString(16).slice(1)}`;
}
function roomEntityKey(id, kind) {
  return `room_${id}_${kind}`;
}
function roomEntityOf(rooms, key) {
  const m2 = /^room_(.+)_(t|h)$/.exec(key);
  if (!m2) return void 0;
  const room = rooms?.find((r6) => r6.id === m2[1]);
  return room ? m2[2] === "t" ? room.temperature : room.humidity : void 0;
}
function roomsGroup(rooms, focus) {
  const series = [];
  rooms.forEach((r6, i5) => {
    const color = ROOM_COLORS[i5 % ROOM_COLORS.length];
    series.push({ id: `${r6.id}_t`, entityKey: roomEntityKey(r6.id, "t"), label: `${r6.name}, temperatura`, unit: "\xB0C", color, axis: "l", decimals: 1, on: focus ? r6.id === focus : true });
    series.push({ id: `${r6.id}_h`, entityKey: roomEntityKey(r6.id, "h"), label: `${r6.name}, umidit\xE0`, unit: "%", color: lighten(color, 0.5), axis: "r", decimals: 0, on: focus ? r6.id === focus : false });
  });
  return { id: "stanze", title: "Stanze", series };
}
function allSeries(cless = false) {
  return Object.values(S3).filter((s4) => !(cless && s4.id === "integW")).map((s4) => ({ ...cless ? clessSeries(s4) : s4, on: ["puffer", "boilerTop", "stoveWater"].includes(s4.id) }));
}
var RANGES = [
  { id: "6h", label: "6 h", hours: 6 },
  { id: "24h", label: "24 h", hours: 24 },
  { id: "3d", label: "3 gg", hours: 72 },
  { id: "7d", label: "7 gg", hours: 168 }
];
function formatValue(v2, def) {
  if (v2 === null || v2 === void 0 || !Number.isFinite(v2)) return "\u2013";
  return `${v2.toFixed(def.decimals).replace(".", ",")} ${def.unit}`;
}
function normalizeValue(v2, st) {
  if (st.max - st.min < 1e-9) return 0.5;
  return (v2 - st.min) / (st.max - st.min);
}

// src/charts-dialog.ts
var TAG4 = "impianto-charts-dialog";
var H_MS = 36e5;
var PLOT_H = 210;
var MT = 10;
var LABELS_H = 22;
var STRIP_H = 12;
var libero = (cless) => ({ id: "libero", title: "Confronto libero", normalized: true, series: allSeries(cless) });
var ImpiantoChartsDialog = class extends i4 {
  constructor() {
    super(...arguments);
    this._group = CHART_GROUPS[0].id;
    this._range = "24h";
    this._compare = false;
    this._normalized = false;
    this._loading = false;
    this._error = "";
    this._w = 600;
    this._hover = null;
    this._hidden = /* @__PURE__ */ new Set();
    this._shown = /* @__PURE__ */ new Set();
    this._computed = [];
    this._t0 = 0;
    this._t1 = 0;
    this._n = 240;
    this._rawCur = /* @__PURE__ */ new Map();
    this._rawPrev = /* @__PURE__ */ new Map();
    this._states = [];
    this._seq = 0;
    this._onKey = (e5) => {
      if (e5.key === "Escape") this._close();
    };
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.focusRoom && this.rooms?.length) this._group = "stanze";
    window.addEventListener("keydown", this._onKey);
    this._timer = window.setInterval(() => void this._load(), 6e4);
    void this._load();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
    this._ro?.disconnect();
    if (this._timer) window.clearInterval(this._timer);
  }
  firstUpdated() {
    const wrap = this.renderRoot.querySelector(".chartwrap");
    if (!wrap) return;
    this._ro = new ResizeObserver((entries) => {
      const w2 = Math.floor(entries[0]?.contentRect.width ?? 600);
      if (w2 > 100 && Math.abs(w2 - this._w) > 2) {
        this._w = w2;
        this._recompute();
      }
    });
    this._ro.observe(wrap);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }
  // ---- dati ----------------------------------------------------------------
  get _def() {
    const groups = this._groups();
    return groups.find((g2) => g2.id === this._group) ?? groups[0];
  }
  /** col modo CLESS acceso i nomi delle sonde dell'accumulo sono quelli del puffer */
  _cless() {
    return this.hass?.states[this.entities?.cless_mode]?.state === "on";
  }
  _groups() {
    const c4 = this._cless();
    const stanze = this.rooms?.length ? [roomsGroup(this.rooms, this.focusRoom)] : [];
    return [...chartGroups(c4), ...stanze, libero(c4)];
  }
  _entityOf(def) {
    const room = roomEntityOf(this.rooms, def.entityKey);
    if (room !== void 0) return room;
    return this.entities[def.entityKey];
  }
  /** Serie del grafico attuale che esistono in Home Assistant. */
  _available() {
    return this._def.series.filter((s4) => {
      const id = this._entityOf(s4);
      return id !== void 0 && this.hass.states[id] !== void 0;
    });
  }
  _isOn(def) {
    const key = `${this._def.id}:${def.id}`;
    if (this._shown.has(key)) return true;
    if (this._hidden.has(key)) return false;
    return !!def.on;
  }
  async _history(ids, start, end) {
    const cw = this.hass.callWS;
    return cw.call(this.hass, {
      type: "history/history_during_period",
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      entity_ids: ids,
      include_start_time_state: true,
      significant_changes_only: false,
      minimal_response: true,
      no_attributes: true
    });
  }
  async _load() {
    if (!this.hass) return;
    const seq = ++this._seq;
    const range = RANGES.find((r6) => r6.id === this._range) ?? RANGES[1];
    const span = range.hours * H_MS;
    const now = Date.now();
    const defs = this._available();
    const ids = Array.from(new Set(defs.map((d3) => this._entityOf(d3)).concat(this.entities.stove_state)));
    this._loading = this._computed.length === 0;
    try {
      const cur = await this._history(ids, now - span, now);
      const prev = this._compare ? await this._history(ids, now - 2 * span, now - span) : null;
      if (seq !== this._seq) return;
      this._t0 = now - span;
      this._t1 = now;
      this._rawCur = new Map(Object.entries(cur).map(([k2, v2]) => [k2, parseNumeric(v2)]));
      this._rawPrev = new Map(prev ? Object.entries(prev).map(([k2, v2]) => [k2, parseNumeric(v2)]) : []);
      this._states = parseStates(cur[this.entities.stove_state]);
      this._error = "";
      this._recompute();
    } catch (err) {
      if (seq === this._seq) this._error = `Impossibile leggere lo storico: ${err instanceof Error ? err.message : String(err)}`;
    } finally {
      if (seq === this._seq) this._loading = false;
    }
  }
  _recompute() {
    const n5 = Math.max(120, Math.min(360, Math.round(this._w / 2)));
    this._n = n5;
    const span = this._t1 - this._t0;
    this._computed = this._available().map((def) => {
      const id = this._entityOf(def);
      const shift = def.timeShiftMs ?? 0;
      const moved = (pts) => shift === 0 ? pts : pts.map((p3) => ({ t: p3.t + shift, v: p3.v }));
      const cur = resample(moved(this._rawCur.get(id) ?? []), this._t0, this._t1, n5);
      const prev = this._compare ? resample(moved(this._rawPrev.get(id) ?? []), this._t0 - span, this._t0, n5) : null;
      return { def, cur, prev, stats: seriesStats(cur) };
    });
  }
  // ---- interazione -----------------------------------------------------------
  _setGroup(id) {
    this._group = id;
    this._hover = null;
    this._computed = [];
    void this._load();
  }
  _setRange(id) {
    this._range = id;
    this._hover = null;
    void this._load();
  }
  _toggleCompare() {
    this._compare = !this._compare;
    void this._load();
  }
  _toggleSeries(def) {
    const key = `${this._def.id}:${def.id}`;
    const turnOn = !this._isOn(def);
    const shown = new Set(this._shown);
    const hidden = new Set(this._hidden);
    if (turnOn) {
      shown.add(key);
      hidden.delete(key);
    } else {
      hidden.add(key);
      shown.delete(key);
    }
    this._shown = shown;
    this._hidden = hidden;
  }
  _geometry() {
    const visible = this._computed.filter((c4) => this._isOn(c4.def));
    const norm = this._normalized || !!this._def.normalized;
    const hasRight = !norm && visible.some((c4) => c4.def.axis === "r");
    const ml = norm ? 38 : 46;
    const mr = hasRight ? 46 : 12;
    const plotW = Math.max(60, this._w - ml - mr);
    return { visible, norm, hasRight, ml, mr, plotW };
  }
  _onMove(ev) {
    const g2 = this._geometry();
    const svgEl = ev.currentTarget;
    const rect = svgEl.getBoundingClientRect();
    const x2 = ev.clientX - rect.left - g2.ml;
    const i5 = Math.round(x2 / g2.plotW * (this._n - 1));
    this._hover = Math.max(0, Math.min(this._n - 1, i5));
  }
  _onLeave(ev) {
    if (ev.pointerType === "mouse") this._hover = null;
  }
  // ---- disegno ---------------------------------------------------------------
  _axisFor(visible, side) {
    let min = Infinity;
    let max = -Infinity;
    for (const c4 of visible) {
      if (c4.def.axis !== side) continue;
      for (const arr of [c4.cur, c4.prev ?? []]) {
        for (const v2 of arr) {
          if (v2 === null) continue;
          if (v2 < min) min = v2;
          if (v2 > max) max = v2;
        }
      }
    }
    return Number.isFinite(min) ? niceAxis(min, max, 5) : null;
  }
  _renderChart() {
    const g2 = this._geometry();
    const { visible, norm, hasRight, ml, plotW } = g2;
    const axL = norm ? null : this._axisFor(visible, "l");
    const axR = norm ? null : this._axisFor(visible, "r");
    const svgH = MT + PLOT_H + LABELS_H + STRIP_H + 6;
    const xOf = (i5) => ml + i5 / (this._n - 1) * plotW;
    const yBase = MT + PLOT_H;
    const yFor = (c4) => {
      if (norm) {
        const st = c4.stats;
        return (v2) => yBase - (st ? normalizeValue(v2, st) : 0.5) * PLOT_H;
      }
      const ax = c4.def.axis === "r" ? axR : axL;
      return (v2) => ax ? yBase - (v2 - ax.min) / (ax.max - ax.min) * PLOT_H : yBase;
    };
    const ticks = timeTicks(this._t0, this._t1, Math.max(3, Math.floor(plotW / 80)));
    const xOfT = (t3) => ml + (t3 - this._t0) / (this._t1 - this._t0) * plotW;
    const showStrip = this._def.id !== "stanze";
    const segs = showStrip ? statusSegments(this._states, this._t0, this._t1) : [];
    const hov = this._hover;
    const hx = hov !== null ? xOf(hov) : null;
    const gridAxis = axL ?? axR;
    return b2`
      <div class="chartwrap">
        <svg width=${this._w} height=${svgH} viewBox="0 0 ${this._w} ${svgH}" role="img" aria-label="Grafico ${this._def.title}"
          @pointermove=${(e5) => this._onMove(e5)} @pointerdown=${(e5) => this._onMove(e5)} @pointerleave=${(e5) => this._onLeave(e5)}>
          ${norm ? [0, 0.25, 0.5, 0.75, 1].map((f3) => w`<line class="grid" x1=${ml} x2=${ml + plotW} y1=${yBase - f3 * PLOT_H} y2=${yBase - f3 * PLOT_H} />`) : gridAxis?.ticks.map((tv) => {
      const y3 = yBase - (tv - gridAxis.min) / (gridAxis.max - gridAxis.min) * PLOT_H;
      return w`<line class="grid" x1=${ml} x2=${ml + plotW} y1=${y3} y2=${y3} />`;
    })}
          ${norm ? w`<text class="ax" x=${ml - 6} y=${MT + 4} text-anchor="end">max</text><text class="ax" x=${ml - 6} y=${yBase + 4} text-anchor="end">min</text>` : axL?.ticks.map((tv) => {
      const y3 = yBase - (tv - axL.min) / (axL.max - axL.min) * PLOT_H;
      return w`<text class="ax" x=${ml - 6} y=${y3 + 4} text-anchor="end">${Number.isInteger(tv) ? tv : tv.toFixed(1).replace(".", ",")}</text>`;
    })}
          ${hasRight && axR ? axR.ticks.map((tv) => {
      const y3 = yBase - (tv - axR.min) / (axR.max - axR.min) * PLOT_H;
      return w`<text class="ax" x=${ml + plotW + 6} y=${y3 + 4}>${Number.isInteger(tv) ? tv : tv.toFixed(1).replace(".", ",")}</text>`;
    }) : A}
          ${ticks.map(
      (t3) => w`<line class=${t3.major ? "vgrid major" : "vgrid"} x1=${xOfT(t3.t)} x2=${xOfT(t3.t)} y1=${MT} y2=${yBase} />
              <text class="ax" x=${xOfT(t3.t)} y=${yBase + 15} text-anchor="middle">${t3.label}</text>`
    )}
          ${visible.map(
      (c4) => c4.prev ? w`<path class="line prev" d=${linePath(c4.prev, xOf, yFor(c4))} stroke=${c4.def.color} />` : A
    )}
          ${visible.map((c4) => w`<path class="line" d=${linePath(c4.cur, xOf, yFor(c4))} stroke=${c4.def.color} />`)}
          <!-- stato della caldaia -->
          ${segs.map(
      (s4) => w`<rect x=${xOfT(s4.from)} y=${yBase + LABELS_H + 2} width=${Math.max(1, xOfT(s4.to) - xOfT(s4.from))} height=${STRIP_H} fill=${stoveStateColor(s4.state)}><title>${s4.state}</title></rect>`
    )}
          ${hx !== null ? w`<line class="cursor" x1=${hx} x2=${hx} y1=${MT} y2=${yBase} />
                ${visible.map((c4) => {
      const v2 = c4.cur[hov];
      return v2 === null ? A : w`<circle cx=${hx} cy=${yFor(c4)(v2)} r="4" fill=${c4.def.color} class="dot" />`;
    })}` : A}
        </svg>
        ${hov !== null ? this._renderTip(visible, hov, hx) : A}
      </div>
      ${showStrip ? b2`<div class="strip-legend">
            <span class="swatch" style="background:#ef4444"></span>in lavoro
            <span class="swatch" style="background:#f59e0b"></span>accensione
            <span class="swatch" style="background:#60a5fa"></span>ECO STOP
            <span class="swatch" style="background:#475569"></span>spenta
            <small>(fascia sotto il grafico: stato della caldaia)</small>
          </div>` : A}
    `;
  }
  _renderTip(visible, i5, x2) {
    const t3 = this._t0 + i5 / (this._n - 1) * (this._t1 - this._t0);
    const st = stateAt(this._states, t3);
    const left = x2 > this._w / 2;
    return b2`
      <div class="tip ${left ? "l" : "r"}" style=${left ? `right:${this._w - x2 + 10}px` : `left:${x2 + 10}px`}>
        <div class="tt">${formatMoment(t3)}</div>
        ${visible.map(
      (c4) => b2`<div class="tr">
            <i style="background:${c4.def.color}"></i><span class="tn">${c4.def.label}</span>
            <b>${formatValue(c4.cur[i5], c4.def)}</b>
            ${c4.prev ? b2`<span class="pv">${formatValue(c4.prev[i5], c4.def)}</span>` : A}
          </div>`
    )}
        ${st ? b2`<div class="tr"><i style="background:${stoveStateColor(st)}"></i><span class="tn">Caldaia</span><b>${st}</b></div>` : A}
        ${visible.some((c4) => c4.prev) ? b2`<div class="note">grigio: stesso momento del periodo prima</div>` : A}
      </div>
    `;
  }
  _renderTable(visible) {
    const hov = this._hover;
    if (visible.length === 0) return b2`<div class="empty">Scegli almeno una serie qui sopra.</div>`;
    return b2`
      <table>
        <thead>
          <tr><th></th><th>${hov !== null ? "Cursore" : "Ora"}</th><th>Min</th><th>Media</th><th>Max</th></tr>
        </thead>
        <tbody>
          ${visible.map((c4) => {
      const v2 = hov !== null ? c4.cur[hov] : c4.stats?.last ?? null;
      return b2`<tr>
              <td><i style="background:${c4.def.color}"></i>${c4.def.label}</td>
              <td><b>${formatValue(v2, c4.def)}</b></td>
              <td>${formatValue(c4.stats?.min, c4.def)}</td>
              <td>${formatValue(c4.stats?.avg, c4.def)}</td>
              <td>${formatValue(c4.stats?.max, c4.def)}</td>
            </tr>`;
    })}
        </tbody>
      </table>
    `;
  }
  render() {
    if (!this.hass || !this.entities) return A;
    const groups = this._groups();
    const available = this._available();
    const visible = this._computed.filter((c4) => this._isOn(c4.def));
    const forced = !!this._def.normalized;
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Grafici dell'impianto">
          <div class="head">
            <div class="title">Grafici</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            <div class="tabs" role="tablist">
              ${groups.map(
      (gr) => b2`<button role="tab" aria-selected=${gr.id === this._group} class=${gr.id === this._group ? "tab on" : "tab"} @click=${() => this._setGroup(gr.id)}>${gr.title}</button>`
    )}
            </div>
            <div class="bar">
              <div class="seg">
                ${RANGES.map(
      (r6) => b2`<button class=${r6.id === this._range ? "on" : ""} @click=${() => this._setRange(r6.id)}>${r6.label}</button>`
    )}
              </div>
              <label class="chk"><input type="checkbox" .checked=${this._compare} @change=${() => this._toggleCompare()} />Confronta con il periodo prima</label>
              <label class="chk" title="Ogni serie è riportata da 0 a 100 % del proprio intervallo: serve a confrontare le forme di grandezze diverse">
                <input type="checkbox" .checked=${forced || this._normalized} ?disabled=${forced} @change=${() => this._normalized = !this._normalized} />Confronta le forme (0–100 %)
              </label>
            </div>
            <div class="chips">
              ${available.map(
      (d3) => b2`<button class=${this._isOn(d3) ? "chip on" : "chip"} aria-pressed=${this._isOn(d3)} @click=${() => this._toggleSeries(d3)}>
                  <i style="background:${this._isOn(d3) ? d3.color : "transparent"};border-color:${d3.color}"></i>${d3.label}
                </button>`
    )}
            </div>
            ${this._error ? b2`<div class="err">${this._error}</div>` : A}
            <div class="chartarea ${this._loading ? "loading" : ""}">${this._renderChart()} ${this._loading ? b2`<div class="spin">Carico lo storico…</div>` : A}</div>
            ${this._renderTable(visible)}
            <p class="hint">Passa il dito o il mouse sul grafico per leggere i valori in ogni momento.</p>
          </div>
        </div>
      </div>
    `;
  }
  static {
    this.styles = i`
    :host {
      position: fixed;
      inset: 0;
      z-index: 10000;
      color: var(--primary-text-color, #212121);
      font-family: var(--paper-font-body1_-_font-family, Roboto, Helvetica, Arial, sans-serif);
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      box-sizing: border-box;
    }
    .panel {
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      width: 100%;
      max-width: 940px;
      max-height: min(94vh, 900px);
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
      overflow: hidden;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    }
    .title {
      font-size: 19px;
      font-weight: 700;
    }
    .x {
      background: none;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;
    }
    .x:hover {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
    }
    .body {
      overflow-y: auto;
      padding: 10px 18px 18px;
    }
    .tabs {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 6px;
    }
    .tab {
      flex: none;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      background: none;
      color: inherit;
      border-radius: 999px;
      padding: 7px 14px;
      font-size: 14px;
      cursor: pointer;
      font-family: inherit;
    }
    .tab.on {
      background: var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      font-weight: 600;
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 16px;
      align-items: center;
      margin: 8px 0;
    }
    .seg {
      display: inline-flex;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      border-radius: 10px;
      overflow: hidden;
    }
    .seg button {
      background: none;
      border: none;
      color: inherit;
      padding: 7px 14px;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
    }
    .seg button.on {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.2));
      font-weight: 700;
    }
    .chk {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13.5px;
      cursor: pointer;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 6px 0 10px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      background: none;
      color: var(--secondary-text-color, #727272);
      border-radius: 999px;
      padding: 5px 11px;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
    }
    .chip.on {
      color: var(--primary-text-color, #212121);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    }
    .chip i {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      border: 2px solid;
      box-sizing: border-box;
    }
    .chartarea {
      position: relative;
    }
    .chartarea.loading svg {
      opacity: 0.35;
    }
    .spin {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary-text-color, #727272);
    }
    .chartwrap {
      position: relative;
      width: 100%;
    }
    svg {
      display: block;
      touch-action: pan-y;
      user-select: none;
    }
    .grid {
      stroke: var(--divider-color, rgba(127, 127, 127, 0.3));
      stroke-width: 1;
    }
    .vgrid {
      stroke: var(--divider-color, rgba(127, 127, 127, 0.2));
      stroke-width: 1;
      stroke-dasharray: 2 4;
    }
    .vgrid.major {
      stroke-dasharray: none;
      stroke: var(--secondary-text-color, rgba(127, 127, 127, 0.5));
    }
    .ax {
      font-size: 11.5px;
      fill: var(--secondary-text-color, #727272);
    }
    .line {
      fill: none;
      stroke-width: 2.2;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    .line.prev {
      stroke-width: 1.6;
      stroke-dasharray: 5 4;
      opacity: 0.45;
    }
    .cursor {
      stroke: var(--primary-text-color, #212121);
      stroke-width: 1;
      opacity: 0.6;
    }
    .dot {
      stroke: var(--card-background-color, #fff);
      stroke-width: 2;
    }
    .tip {
      position: absolute;
      top: 6px;
      z-index: 2;
      pointer-events: none;
      min-width: 190px;
      max-width: 300px;
      padding: 8px 10px;
      border-radius: 10px;
      font-size: 12.5px;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    }
    .tt {
      font-weight: 700;
      margin-bottom: 4px;
    }
    .tr {
      display: flex;
      align-items: center;
      gap: 6px;
      line-height: 1.55;
    }
    .tr i,
    td i {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex: none;
      display: inline-block;
      margin-right: 6px;
    }
    .tr .tn {
      flex: 1;
      color: var(--secondary-text-color, #727272);
    }
    .tr .pv {
      color: var(--secondary-text-color, #727272);
      font-size: 11.5px;
    }
    .note {
      font-size: 11px;
      color: var(--secondary-text-color, #727272);
      margin-top: 2px;
    }
    .strip-legend {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
      display: flex;
      flex-wrap: wrap;
      gap: 4px 12px;
      align-items: center;
      margin: 2px 0 10px;
    }
    .swatch {
      display: inline-block;
      width: 12px;
      height: 8px;
      border-radius: 2px;
      margin-right: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    th {
      text-align: right;
      font-weight: 600;
      color: var(--secondary-text-color, #727272);
      font-size: 12px;
      padding: 4px 6px;
    }
    th:first-child,
    td:first-child {
      text-align: left;
    }
    td {
      text-align: right;
      padding: 6px 6px;
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
      white-space: nowrap;
    }
    td:first-child {
      white-space: normal;
    }
    .empty,
    .hint {
      color: var(--secondary-text-color, #727272);
      font-size: 13px;
      margin: 10px 0 0;
    }
    .err {
      color: #ef4444;
      font-size: 13.5px;
      margin: 6px 0;
    }
    @media (max-width: 520px) {
      .body {
        padding: 8px 10px 14px;
      }
      td:nth-child(4) {
        display: none;
      }
      th:nth-child(4) {
        display: none;
      }
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], ImpiantoChartsDialog.prototype, "hass", 2);
__decorateClass([
  n4({ attribute: false })
], ImpiantoChartsDialog.prototype, "entities", 2);
__decorateClass([
  n4({ attribute: false })
], ImpiantoChartsDialog.prototype, "rooms", 2);
__decorateClass([
  n4({ attribute: false })
], ImpiantoChartsDialog.prototype, "focusRoom", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_group", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_range", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_compare", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_normalized", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_loading", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_error", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_w", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_hover", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_hidden", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_shown", 2);
__decorateClass([
  r5()
], ImpiantoChartsDialog.prototype, "_computed", 2);
if (!customElements.get(TAG4)) customElements.define(TAG4, ImpiantoChartsDialog);

// src/rooms-logic.ts
var DEFAULT_ROOMS = [
  { id: "soggiorno", name: "Soggiorno", temperature: "sensor.sensore_soggiorno_temperature", humidity: "sensor.sensore_soggiorno_humidity" },
  { id: "cucina", name: "Cucina", temperature: "sensor.sensore_cucina_temperature", humidity: "sensor.sensore_cucina_humidity" },
  {
    id: "matrimoniale",
    name: "Camera matrimoniale",
    short: "Matrimon.",
    temperature: "sensor.sensore_camera_matrimoniale_temperature",
    humidity: "sensor.sensore_camera_matrimoniale_humidity"
  },
  { id: "matilde", name: "Camera Matilde", short: "Matilde", temperature: "sensor.sensore_camera_matilde_temperature", humidity: "sensor.sensore_camera_matilde_humidity" },
  { id: "camilla", name: "Camera Camilla", short: "Camilla", temperature: "sensor.sensore_camera_camilla_temperature", humidity: "sensor.sensore_camera_camilla_humidity" },
  { id: "bagno_blu", name: "Bagno Blu", temperature: "sensor.sensore_bagno_blu_temperature", humidity: "sensor.sensore_bagno_blu_humidity" },
  { id: "bagno_verde", name: "Bagno Verde", temperature: "sensor.sensore_bagno_verde_temperature", humidity: "sensor.sensore_bagno_verde_humidity" }
];
var TEMP_WARM = 22;
var TEMP_COOL = 19;
var HUM_HIGH = 60;
var HUM_TOO_HIGH = 70;
var HUM_DRY = 40;
var BAR_MIN = 16;
var BAR_MAX = 24;
var TEMP_COLOR = { warm: "#fb923c", ok: "#4ade80", cool: "#60a5fa" };
function toNum(state) {
  if (state === null || state === void 0 || state === "" || state === "unknown" || state === "unavailable") return null;
  const n5 = Number(String(state).replace(",", "."));
  return Number.isFinite(n5) ? n5 : null;
}
function tempClass(t3) {
  return t3 >= TEMP_WARM ? "warm" : t3 < TEMP_COOL ? "cool" : "ok";
}
function humClass(h3) {
  if (h3 >= HUM_TOO_HIGH) return "bad";
  if (h3 >= HUM_HIGH) return "amber";
  if (h3 < HUM_DRY) return "dry";
  return "ok";
}
function barFraction(t3, min = BAR_MIN, max = BAR_MAX) {
  if (max <= min) return 0;
  return Math.max(0, Math.min(1, (t3 - min) / (max - min)));
}
function roomValues(rooms, stateOf) {
  return rooms.map((room) => ({ room, t: toNum(stateOf(room.temperature)), h: toNum(stateOf(room.humidity)) }));
}
function roomExists(room, exists) {
  return exists(room.temperature) || exists(room.humidity);
}
function summarize(values) {
  const withT = values.filter((v2) => v2.t !== null);
  const withH = values.filter((v2) => v2.h !== null);
  const warmest = withT.length ? withT.reduce((a3, b3) => b3.t > a3.t ? b3 : a3) : null;
  const coolest = withT.length ? withT.reduce((a3, b3) => b3.t < a3.t ? b3 : a3) : null;
  const humid = withH.filter((v2) => v2.h >= HUM_TOO_HIGH).sort((a3, b3) => b3.h - a3.h);
  const avg = (xs) => xs.length ? xs.reduce((s4, x2) => s4 + x2, 0) / xs.length : null;
  return { warmest, coolest, humid, avgT: avg(withT.map((v2) => v2.t)), avgH: avg(withH.map((v2) => v2.h)) };
}
function fmtNum(n5, decimals2 = 1) {
  return n5 === null ? "\u2013" : n5.toFixed(decimals2).replace(".", ",");
}
function shortName(room) {
  return room.short ?? room.name;
}
function normalizeRooms(raw) {
  if (!Array.isArray(raw)) return DEFAULT_ROOMS;
  const out = [];
  raw.forEach((r6, i5) => {
    if (!r6 || typeof r6 !== "object") return;
    const o6 = r6;
    const name = typeof o6.name === "string" ? o6.name.trim() : "";
    const temperature = typeof o6.temperature === "string" ? o6.temperature.trim() : "";
    const humidity = typeof o6.humidity === "string" ? o6.humidity.trim() : "";
    if (!name || !temperature && !humidity) return;
    const id = typeof o6.id === "string" && o6.id.trim() ? o6.id.trim() : `stanza${i5 + 1}`;
    out.push({ id, name, ...typeof o6.short === "string" && o6.short.trim() ? { short: o6.short.trim() } : {}, temperature, humidity });
  });
  return out.length ? out : DEFAULT_ROOMS;
}

// src/rooms-card.ts
var CARD_TAG = "impianto-rooms-card";
var HUM_COLOR = { bad: "#f87171", amber: "#fbbf24", ok: "#4ade80", dry: "#60a5fa" };
var ImpiantoRoomsCard = class extends i4 {
  constructor() {
    super(...arguments);
    this._config = {};
  }
  setConfig(config) {
    this._config = { ...config };
  }
  getCardSize() {
    return 5;
  }
  get _rooms() {
    return normalizeRooms(this._config.rooms);
  }
  /** Le stanze da mostrare: tutte quelle della configurazione, ma solo se almeno un sensore esiste in Home Assistant. */
  _values() {
    if (!this.hass) return null;
    const rooms = this._rooms;
    const exists = (id) => !!id && this.hass.states[id] !== void 0;
    if (!rooms.some((r6) => roomExists(r6, exists))) return null;
    return roomValues(rooms, (id) => this.hass.states[id]?.state);
  }
  _target() {
    const id = this._config.target_entity ?? "climate.termostato";
    return toNum(String(this.hass?.states[id]?.attributes?.temperature ?? ""));
  }
  _open(roomId) {
    if (this._dialog) return;
    const d3 = document.createElement("impianto-charts-dialog");
    d3.hass = this.hass;
    d3.entities = { stove_state: this._config.stove_state ?? "sensor.casale_stato", cless_mode: "input_boolean.impianto_modo_cless" };
    d3.rooms = this._rooms;
    d3.focusRoom = roomId;
    d3.addEventListener("closed", () => {
      this._dialog = void 0;
    });
    document.body.appendChild(d3);
    this._dialog = d3;
  }
  _column(v2) {
    const missing = v2.t === null && v2.h === null;
    const color = v2.t === null ? "var(--secondary-text-color)" : TEMP_COLOR[tempClass(v2.t)];
    const frac = v2.t === null ? 0.04 : Math.max(0.1, barFraction(v2.t));
    const hcol = v2.h === null ? "var(--secondary-text-color)" : HUM_COLOR[humClass(v2.h)];
    const title = missing ? `${v2.room.name}: sensore non disponibile` : `${v2.room.name}: ${fmtNum(v2.t)} \xB0C, ${v2.h === null ? "\u2013" : Math.round(v2.h)} %`;
    return b2`
      <div class=${missing ? "col off" : "col"} role=${missing ? "presentation" : "button"} tabindex=${missing ? "-1" : "0"} title=${title}
        @click=${() => !missing && this._open(v2.room.id)}
        @keydown=${(e5) => !missing && (e5.key === "Enter" || e5.key === " ") && this._open(v2.room.id)}>
        <div class="plot">
          <div class="bar" style="height:${(frac * 100).toFixed(1)}%;background:${missing ? "var(--divider-color)" : color}">
            <span>${fmtNum(v2.t)}</span>
          </div>
        </div>
        <div class="hum" style="color:${hcol}">${v2.h === null ? "\u2013" : `${Math.round(v2.h)} %`}</div>
        <div class="nm">${shortName(v2.room)}</div>
      </div>
    `;
  }
  render() {
    const values = this._values();
    if (!values) return A;
    const sum = summarize(values);
    const target = this._target();
    const embedded = this._config.embedded === true;
    const targetFrac = target === null ? null : barFraction(target);
    const body = b2`
      <div class="rooms">
        <div class="head"><h3>${this._config.title ?? "Stanze"}</h3></div>
        <div class="sum">
          ${sum.warmest ? b2`<div class="chip">Più calda: <b style="color:${TEMP_COLOR.warm}">${sum.warmest.room.name} ${fmtNum(sum.warmest.t)} °C</b></div>` : A}
          ${sum.coolest && sum.coolest !== sum.warmest ? b2`<div class="chip">Più fredda: <b style="color:${TEMP_COLOR.cool}">${sum.coolest.room.name} ${fmtNum(sum.coolest.t)} °C</b></div>` : A}
          ${sum.humid.map((h3) => b2`<div class="chip bad">Umidità alta: <b>${h3.room.name} ${Math.round(h3.h)} %</b></div>`)}
        </div>
        <div class="area" style="--n:${values.length}">
          ${targetFrac === null ? A : b2`<div class="tline" style="bottom:calc(var(--below) + (100% - var(--below)) * ${targetFrac.toFixed(4)})"><span>obiettivo ${fmtNum(target)}</span></div>`}
          ${values.map((v2) => this._column(v2))}
        </div>
        <div class="scale">scala ${BAR_MIN}–${BAR_MAX} °C</div>
      </div>
    `;
    return embedded ? b2`<div class="embed">${body}</div>` : b2`<ha-card>${body}</ha-card>`;
  }
  static {
    this.styles = i`
    :host {
      display: block;
      container-type: inline-size;
    }
    ha-card {
      overflow: hidden;
    }
    .embed {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 20px;
      height: 100%;
      box-sizing: border-box;
    }
    .rooms {
      padding: 14px 16px 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      height: 100%;
      box-sizing: border-box;
      --below: 60px;
    }
    h3 {
      margin: 0;
      font-size: 17px;
      font-weight: 700;
      color: var(--primary-text-color);
    }
    .sum {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .chip {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 14px;
      padding: 5px 12px;
      font-size: 13px;
      color: var(--primary-text-color);
    }
    .chip.bad {
      background: rgba(248, 113, 113, 0.14);
      border-color: rgba(248, 113, 113, 0.55);
    }
    .area {
      position: relative;
      display: grid;
      grid-template-columns: repeat(var(--n), minmax(0, 1fr));
      gap: 6px;
      flex: 1;
      min-height: 210px;
      margin-top: 6px;
    }
    .col {
      display: grid;
      grid-template-rows: 1fr auto auto;
      align-items: end;
      justify-items: center;
      cursor: pointer;
      outline: none;
      border-radius: 10px;
      min-width: 0;
    }
    .col.off {
      cursor: default;
      opacity: 0.7;
    }
    .col:focus-visible {
      box-shadow: 0 0 0 2px var(--primary-color);
    }
    .plot {
      width: 100%;
      height: 100%;
      min-height: 140px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .bar {
      width: min(46px, 78%);
      border-radius: 8px 8px 4px 4px;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 6px;
      box-sizing: border-box;
      color: #111;
      font-weight: 700;
      font-size: 13px;
      min-height: 10px;
    }
    .hum {
      margin-top: 8px;
      font-size: 13px;
      font-weight: 700;
      background: var(--card-background-color);
      border-radius: 10px;
      padding: 2px 9px;
    }
    .nm {
      margin-top: 5px;
      font-size: 11.5px;
      line-height: 1.15;
      text-align: center;
      color: var(--secondary-text-color);
      overflow-wrap: break-word;
      min-height: 26px;
    }
    .tline {
      position: absolute;
      left: 0;
      right: 0;
      border-top: 2px dashed var(--secondary-text-color);
      opacity: 0.8;
      pointer-events: none;
      z-index: 1;
    }
    .tline span {
      position: absolute;
      right: 0;
      top: -19px;
      font-size: 11px;
      color: var(--secondary-text-color);
      background: var(--secondary-background-color);
      padding: 0 4px;
    }
    /* su schermi stretti (telefono) i testi si riducono per non spezzare i nomi */
    @container (max-width: 480px) {
      .rooms {
        padding: 12px 10px 8px;
      }
      .area {
        gap: 3px;
      }
      .nm {
        font-size: 9.5px;
        letter-spacing: -0.2px;
      }
      .hum {
        font-size: 11px;
        padding: 2px 5px;
      }
      .bar {
        font-size: 11px;
        width: 84%;
      }
      .chip {
        font-size: 12px;
        padding: 4px 10px;
      }
    }
    .scale {
      font-size: 10.5px;
      color: var(--secondary-text-color);
      text-align: right;
      opacity: 0.7;
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], ImpiantoRoomsCard.prototype, "hass", 2);
__decorateClass([
  r5()
], ImpiantoRoomsCard.prototype, "_config", 2);
if (!customElements.get(CARD_TAG)) customElements.define(CARD_TAG, ImpiantoRoomsCard);

// src/hopper-logic.ts
var HOPPER = {
  depthCm: 56.5,
  topH: 28,
  topW: 54,
  midH: 50,
  midBottomW: 19,
  lowH: 16,
  lowBottomW: 7,
  lowBottomD: 12,
  rho: 0.655,
  capacityKg: 120,
  bagKg: 15
};
var HOPPER_HEIGHT = HOPPER.topH + HOPPER.midH + HOPPER.lowH;
var TOP_CM2 = HOPPER.topW * HOPPER.depthCm;
function lowArea(t3) {
  const f3 = t3 / HOPPER.lowH;
  const w2 = HOPPER.midBottomW + (HOPPER.lowBottomW - HOPPER.midBottomW) * f3;
  const d3 = HOPPER.depthCm + (HOPPER.lowBottomD - HOPPER.depthCm) * f3;
  return w2 * d3;
}
var LOW_TOTAL_CM3 = (() => {
  const n5 = 400;
  let s4 = 0;
  for (let i5 = 0; i5 < n5; i5++) s4 += lowArea((i5 + 0.5) / n5 * HOPPER.lowH) * (HOPPER.lowH / n5);
  return s4;
})();
var MID_TOTAL_CM3 = (HOPPER.topW + HOPPER.midBottomW) / 2 * HOPPER.depthCm * HOPPER.midH;
var TOP_TOTAL_CM3 = TOP_CM2 * HOPPER.topH;
function volumeBelow(depth) {
  const d3 = Math.max(0, depth);
  if (d3 <= HOPPER.topH) return MID_TOTAL_CM3 + LOW_TOTAL_CM3 + TOP_CM2 * (HOPPER.topH - d3);
  const y3 = d3 - HOPPER.topH;
  if (y3 <= HOPPER.midH) {
    const dw = HOPPER.topW - HOPPER.midBottomW;
    const k2 = dw / HOPPER.midH;
    return HOPPER.depthCm * (HOPPER.topW * (HOPPER.midH - y3) - k2 / 2 * (HOPPER.midH * HOPPER.midH - y3 * y3)) + LOW_TOTAL_CM3;
  }
  const z2 = y3 - HOPPER.midH;
  if (z2 >= HOPPER.lowH) return 0;
  const n5 = 300;
  let s4 = 0;
  for (let i5 = 0; i5 < n5; i5++) s4 += lowArea(z2 + (i5 + 0.5) / n5 * (HOPPER.lowH - z2)) * ((HOPPER.lowH - z2) / n5);
  return s4;
}
var DEAD_KG = (TOP_TOTAL_CM3 + MID_TOTAL_CM3 + LOW_TOTAL_CM3) / 1e3 * HOPPER.rho - HOPPER.capacityKg;
function kgAtDepth(depthCm) {
  return Math.min(HOPPER.capacityKg, Math.max(0, volumeBelow(depthCm) / 1e3 * HOPPER.rho - DEAD_KG));
}
function depthAtKg(kg) {
  const k2 = Math.min(HOPPER.capacityKg, Math.max(0, kg));
  let lo = 0;
  let hi = HOPPER_HEIGHT;
  for (let i5 = 0; i5 < 40; i5++) {
    const mid = (lo + hi) / 2;
    if (kgAtDepth(mid) > k2) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
function remainingKg(refKg, total, totalRef) {
  if (refKg === null || total === null || totalRef === null || totalRef <= 0) return null;
  const used = Math.max(0, total - totalRef);
  return Math.min(HOPPER.capacityKg, Math.max(0, refKg - used));
}
function daysLeft(kg, kgPerDay) {
  if (kg === null || kgPerDay === null || kgPerDay <= 0) return null;
  return kg / kgPerDay;
}
function afterBags(currentKg, bags, bagKg = HOPPER.bagKg) {
  return Math.min(HOPPER.capacityKg, Math.max(0, currentKg + bags * bagKg));
}
function checkBags(bags, depthAfter, depthBefore, estimatedKg, bagKg = HOPPER.bagKg) {
  if (!(bags > 0) || !Number.isFinite(depthAfter) || depthAfter < 0) return null;
  const afterKg = kgAtDepth(depthAfter);
  const measured = depthBefore !== null && Number.isFinite(depthBefore) && depthBefore >= 0;
  const beforeKg = measured ? kgAtDepth(depthBefore) : estimatedKg;
  if (beforeKg === null) return null;
  const gainKg = afterKg - beforeKg;
  const expectedKg = bags * bagKg;
  const impliedRho = measured && gainKg > 0.5 ? HOPPER.rho * expectedKg / gainKg : null;
  return { afterKg, beforeKg, gainKg, expectedKg, impliedRho };
}
function hopperOutline() {
  return [
    [0, 0],
    [HOPPER.topW, 0],
    [HOPPER.topW, HOPPER.topH],
    [HOPPER.midBottomW, HOPPER.topH + HOPPER.midH],
    [HOPPER.lowBottomW, HOPPER_HEIGHT],
    [0, HOPPER_HEIGHT]
  ];
}
function levelColor(kg) {
  if (kg === null) return "#64748b";
  if (kg < 20) return "#ef4444";
  if (kg < 40) return "#f59e0b";
  return "#b7791f";
}
function consumptionPerDay(week, month, now, fallback = 6) {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const frac = (now.getTime() - dayStart.getTime()) / 864e5;
  const weekDays = (now.getDay() + 6) % 7 + frac;
  const monthDays = now.getDate() - 1 + frac;
  if (week !== null && weekDays >= 2 && week / weekDays >= 0.5) return week / weekDays;
  if (month !== null && monthDays >= 3 && month / monthDays >= 0.5) return month / monthDays;
  return fallback;
}

// src/hopper-svg.ts
function widthAt(depth) {
  const top = HOPPER.topH;
  const mid = HOPPER.topH + HOPPER.midH;
  if (depth <= top) return HOPPER.topW;
  if (depth <= mid) return HOPPER.topW + (HOPPER.midBottomW - HOPPER.topW) * (depth - top) / HOPPER.midH;
  return HOPPER.midBottomW + (HOPPER.lowBottomW - HOPPER.midBottomW) * (Math.min(depth, HOPPER_HEIGHT) - mid) / HOPPER.lowH;
}
function hopperShape(kg, clipId) {
  const pts = hopperOutline().map(([x2, y3]) => `${x2},${y3}`).join(" ");
  const depth = kg === null ? HOPPER_HEIGHT : depthAtKg(kg);
  const color = levelColor(kg);
  return w`
    <defs><clipPath id=${clipId}><rect x="-3" y=${depth} width=${HOPPER.topW + 6} height=${HOPPER_HEIGHT + 6 - depth} /></clipPath></defs>
    <polygon points=${pts} fill="rgba(8,10,14,0.55)" stroke="none" />
    ${kg === null ? w`` : w`<g clip-path=${`url(#${clipId})`}><polygon points=${pts} fill=${color} opacity="0.92" /></g>`}
    ${kg === null ? w`` : w`<line x1="0" x2=${widthAt(depth)} y1=${depth} y2=${depth} stroke="rgba(255,255,255,0.6)" stroke-width="1" />`}
    <polygon points=${pts} fill="none" stroke="rgba(226,232,240,0.9)" stroke-width="1.6" stroke-linejoin="round" />
  `;
}
function hopperSvg(kg, label) {
  const pts = hopperOutline().map(([x2, y3]) => `${x2},${y3}`).join(" ");
  const depth = kg === null ? HOPPER_HEIGHT : depthAtKg(kg);
  const color = levelColor(kg);
  return w`
    <svg class="hopper-svg" viewBox="-3 -3 ${HOPPER.topW + 6} ${HOPPER_HEIGHT + 6}" role="img" aria-label=${label}>
      <defs>
        <clipPath id="hp-clip"><rect x="-3" y=${depth} width=${HOPPER.topW + 6} height=${HOPPER_HEIGHT + 6 - depth} /></clipPath>
      </defs>
      <polygon points=${pts} fill="var(--card-background-color, #1f2937)" stroke="none" />
      ${kg === null ? w`` : w`<g clip-path="url(#hp-clip)"><polygon points=${pts} fill=${color} opacity="0.9" /></g>`}
      ${kg === null ? w`` : w`<line x1="0" x2=${widthAt(depth)} y1=${depth} y2=${depth} stroke="rgba(255,255,255,0.6)" stroke-width="1" />`}
      <polygon points=${pts} fill="none" stroke="var(--secondary-text-color, #94a3b8)" stroke-width="1.6" stroke-linejoin="round" />
    </svg>
  `;
}

// src/pellet-dialog.ts
var TAG5 = "impianto-pellet-dialog";
var fmt = (n5, d3 = 0) => n5.toFixed(d3).replace(".", ",");
var _ImpiantoPelletDialog = class _ImpiantoPelletDialog extends i4 {
  constructor() {
    super(...arguments);
    this.info = { kg: null, perDay: null, bagKg: HOPPER.bagKg };
    this._bags = 1;
    this._depth = "";
    this._done = "";
    this._cBags = "";
    this._cBefore = "";
    this._cAfter = "";
    this._onKey = (e5) => {
      if (e5.key === "Escape") this._close();
    };
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }
  _step(dir) {
    this._bags = Math.max(0.5, Math.min(8, this._bags + dir * 0.5));
  }
  _addBags() {
    this.dispatchEvent(new CustomEvent("bags", { detail: this._bags }));
    this._done = `Aggiunti ${fmt(this._bags, this._bags % 1 ? 1 : 0)} ${this._bags === 1 ? "sacco" : "sacchi"}.`;
  }
  _setLevel() {
    const d3 = Number(this._depth.replace(",", "."));
    if (!Number.isFinite(d3) || d3 < 0 || d3 > 94) return;
    this.dispatchEvent(new CustomEvent("level", { detail: d3 }));
    this._done = `Livello impostato a ${fmt(d3, 1)} cm: ${fmt(kgAtDepth(d3))} kg.`;
    this._depth = "";
  }
  static _num(v2) {
    if (v2.trim() === "") return null;
    const n5 = Number(v2.replace(",", "."));
    return Number.isFinite(n5) ? n5 : null;
  }
  /** Sacchi e quota insieme: la quota dopo il carico gia' comprende i sacchi, quindi imposta quella; il confronto serve a controllare la geometria. */
  _setCombined() {
    const c4 = this._combined();
    const after = _ImpiantoPelletDialog._num(this._cAfter);
    if (!c4 || after === null) return;
    this.dispatchEvent(new CustomEvent("level", { detail: after }));
    this._done = `Livello impostato a ${fmt(after, 1)} cm: ${fmt(c4.afterKg)} kg (con ${this._cBags.trim()} ${_ImpiantoPelletDialog._num(this._cBags) === 1 ? "sacco" : "sacchi"} versati).`;
    this._cBags = this._cBefore = this._cAfter = "";
  }
  _combined() {
    const bags = _ImpiantoPelletDialog._num(this._cBags);
    const after = _ImpiantoPelletDialog._num(this._cAfter);
    const before = _ImpiantoPelletDialog._num(this._cBefore);
    if (bags === null || after === null || bags <= 0 || after > 94 || before !== null && (before < 0 || before > 94)) return null;
    return checkBags(bags, after, before, this.info.kg, this.info.bagKg);
  }
  render() {
    const { kg, perDay, bagKg } = this.info;
    const comb = this._combined();
    const days = kg !== null && perDay ? kg / perDay : null;
    const after = kg !== null ? afterBags(kg, this._bags, bagKg) : null;
    const d3 = Number(this._depth.replace(",", "."));
    const levelOk = this._depth.trim() !== "" && Number.isFinite(d3) && d3 >= 0 && d3 <= 94;
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Pellet nel serbatoio">
          <div class="head">
            <div class="title">Pellet nel serbatoio</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            <div class="top">
              <div class="fig">${hopperSvg(kg, "Serbatoio del pellet")}</div>
              <div class="num">
                <div class="big">${kg === null ? "\u2013" : fmt(kg)}<span> kg</span></div>
                <div class="sub">${kg === null ? "quantit\xE0 non nota" : `${fmt(kg / HOPPER.capacityKg * 100)} % di ${HOPPER.capacityKg} kg (${HOPPER.capacityKg / bagKg} sacchi)`}</div>
                <div class="sub">${days === null ? "" : `circa ${fmt(days, days < 10 ? 1 : 0)} giorni al consumo di ${fmt(perDay ?? 0, 1)} kg al giorno`}</div>
              </div>
            </div>

            ${kg === null ? b2`<div class="hint warn">Il conteggio non è ancora impostato: parti dal livello misurato (qui sotto), poi potrai aggiungere i sacchi.</div>` : A}
            <div class="sec">Ho versato dei sacchi</div>
            <div class="row">
              <div class="stepper">
                <button class="st" aria-label="Meno" @click=${() => this._step(-1)}>−</button>
                <div class="sv">${fmt(this._bags, this._bags % 1 ? 1 : 0)}<span> ${this._bags === 1 ? "sacco" : "sacchi"} da ${bagKg} kg</span></div>
                <button class="st" aria-label="Più" @click=${() => this._step(1)}>+</button>
              </div>
              <button class="btn primary" ?disabled=${kg === null} @click=${() => this._addBags()}>Aggiungi</button>
            </div>
            <div class="hint">${after === null ? "" : `Dopo il carico: ${fmt(after)} kg${kg !== null && kg + this._bags * bagKg > HOPPER.capacityKg ? " (il serbatoio \xE8 pieno)" : ""}.`}</div>

            <div class="sec">Oppure ho misurato il livello</div>
            <div class="row">
              <label class="field">
                <span>Quota del pellet dalla sommità (cm)</span>
                <input type="text" inputmode="decimal" .value=${this._depth} placeholder="es. 7,5" @input=${(e5) => this._depth = e5.target.value} />
              </label>
              <button class="btn primary" ?disabled=${!levelOk} @click=${() => this._setLevel()}>Imposta</button>
            </div>
            <div class="hint">${levelOk ? `${fmt(d3, 1)} cm sono circa ${fmt(kgAtDepth(d3))} kg.` : "Misura dal bordo alto del serbatoio fino alla superficie del pellet, dopo averla livellata."}</div>

            <div class="sec">Ho versato dei sacchi e misurato la quota</div>
            <div class="row">
              <label class="field">
                <span>Sacchi versati</span>
                <input type="text" inputmode="decimal" .value=${this._cBags} placeholder="es. 2" @input=${(e5) => this._cBags = e5.target.value} />
              </label>
              <label class="field">
                <span>Quota prima (cm, facoltativa)</span>
                <input type="text" inputmode="decimal" .value=${this._cBefore} placeholder="es. 38" @input=${(e5) => this._cBefore = e5.target.value} />
              </label>
              <label class="field">
                <span>Quota dopo (cm)</span>
                <input type="text" inputmode="decimal" .value=${this._cAfter} placeholder="es. 24" @input=${(e5) => this._cAfter = e5.target.value} />
              </label>
              <button class="btn primary" ?disabled=${!comb} @click=${() => this._setCombined()}>Imposta</button>
            </div>
            <div class="hint">${comb ? `${this._cBefore.trim() === "" ? "Prima (stima della scheda)" : "Prima"}: ${fmt(comb.beforeKg)} kg \xB7 dopo: ${fmt(comb.afterKg)} kg \xB7 aumento ${fmt(comb.gainKg, 1)} kg, attesi ${fmt(comb.expectedKg, 1)} kg.${comb.impliedRho === null ? "" : ` Con questi dati la densit\xE0 sarebbe ${fmt(comb.impliedRho, 3)} kg/litro (ora ${fmt(HOPPER.rho, 3)}).`}` : "Misura la quota prima di versare i sacchi, versali, livella la superficie e misura di nuovo. Senza la quota di prima il confronto usa la stima della scheda."}</div>

            ${this._done ? b2`<div class="done">${this._done}</div>` : A}
            <div class="note">Da qui in poi i chili rimasti diminuiscono con il consumo stimato dalla scheda. Aggiorna il conteggio ogni volta che riempi il serbatoio o misuri il livello.</div>
          </div>
        </div>
      </div>
    `;
  }
  static {
    this.styles = i`
    :host {
      position: fixed;
      inset: 0;
      z-index: 10000;
      color: var(--primary-text-color, #212121);
      font-family: var(--paper-font-body1_-_font-family, Roboto, Helvetica, Arial, sans-serif);
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      box-sizing: border-box;
    }
    .panel {
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      max-height: min(92vh, 720px);
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
      overflow: hidden;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    }
    .title {
      font-size: 19px;
      font-weight: 700;
    }
    .x {
      background: none;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;
    }
    .body {
      overflow-y: auto;
      padding: 12px 18px 18px;
    }
    .top {
      display: flex;
      gap: 18px;
      align-items: center;
    }
    .fig {
      flex: none;
      width: 84px;
    }
    .hopper-svg {
      width: 100%;
      height: auto;
      display: block;
    }
    .big {
      font-size: 40px;
      font-weight: 700;
      line-height: 1.1;
    }
    .big span {
      font-size: 18px;
      font-weight: 500;
      color: var(--secondary-text-color, #727272);
    }
    .sub {
      font-size: 13.5px;
      color: var(--secondary-text-color, #727272);
      margin-top: 2px;
    }
    .sec {
      margin: 18px 0 6px;
      font-size: 12.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--primary-color, #03a9f4);
    }
    .row {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    .stepper {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .st {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: inherit;
      font-size: 22px;
      cursor: pointer;
      padding: 0;
    }
    .sv {
      min-width: 130px;
      text-align: center;
      font-size: 22px;
      font-weight: 600;
    }
    .sv span {
      display: block;
      font-size: 12.5px;
      font-weight: 400;
      color: var(--secondary-text-color, #727272);
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 160px;
      font-size: 12.5px;
      color: var(--secondary-text-color, #727272);
    }
    input {
      min-height: 48px;
      font-size: 18px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      box-sizing: border-box;
    }
    .btn {
      min-height: 48px;
      padding: 8px 20px;
      border-radius: 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: inherit;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn.primary {
      background: var(--primary-color, #03a9f4);
      color: #fff;
      border-color: transparent;
    }
    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .hint.warn {
      color: #f59e0b;
      font-weight: 600;
    }
    .hint {
      margin-top: 6px;
      font-size: 13px;
      color: var(--secondary-text-color, #727272);
      min-height: 18px;
    }
    .done {
      margin-top: 14px;
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(34, 197, 94, 0.16);
      color: #22c55e;
      font-size: 14px;
      font-weight: 600;
    }
    .note {
      margin-top: 14px;
      font-size: 12.5px;
      line-height: 1.4;
      color: var(--secondary-text-color, #727272);
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], _ImpiantoPelletDialog.prototype, "info", 2);
__decorateClass([
  r5()
], _ImpiantoPelletDialog.prototype, "_bags", 2);
__decorateClass([
  r5()
], _ImpiantoPelletDialog.prototype, "_depth", 2);
__decorateClass([
  r5()
], _ImpiantoPelletDialog.prototype, "_done", 2);
__decorateClass([
  r5()
], _ImpiantoPelletDialog.prototype, "_cBags", 2);
__decorateClass([
  r5()
], _ImpiantoPelletDialog.prototype, "_cBefore", 2);
__decorateClass([
  r5()
], _ImpiantoPelletDialog.prototype, "_cAfter", 2);
var ImpiantoPelletDialog = _ImpiantoPelletDialog;
if (!customElements.get(TAG5)) customElements.define(TAG5, ImpiantoPelletDialog);

// src/pellet-charts-logic.ts
var PELLET_RANGES = [
  { id: "24h", label: "24 ore", hours: 24, bucket: "hour" },
  { id: "3d", label: "3 giorni", hours: 72, bucket: "day" },
  { id: "7d", label: "7 giorni", hours: 168, bucket: "day" },
  { id: "14d", label: "14 giorni", hours: 336, bucket: "day" },
  { id: "30d", label: "30 giorni", hours: 720, bucket: "day" },
  { id: "90d", label: "90 giorni", hours: 2160, bucket: "day" }
];
var MIN = 6e4;
var HOUR = 36e5;
var DAY = 864e5;
function rangeStart(range, now) {
  const d3 = new Date(now);
  if (range.bucket === "hour") {
    d3.setMinutes(0, 0, 0);
    return d3.getTime() - (range.hours - 1) * HOUR;
  }
  d3.setHours(0, 0, 0, 0);
  const days = Math.round(range.hours / 24);
  const start = new Date(d3);
  start.setDate(start.getDate() - (days - 1));
  return start.getTime();
}
function valueAt(pts, t3) {
  if (pts.length === 0) return null;
  let lo = 0;
  let hi = pts.length - 1;
  if (t3 < pts[0].t) return pts[0].v;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    if (pts[mid].t <= t3) lo = mid;
    else hi = mid - 1;
  }
  return pts[lo].v;
}
function classifyDelta(delta, after, bagKg, capacityKg = 120) {
  if (delta > 0 && bagKg > 0) {
    const bags = Math.round(delta / bagKg * 2) / 2;
    if (bags >= 0.5 && Math.abs(delta - bags * bagKg) <= 0.8) return { kind: "carico", bags };
    if (after >= capacityKg - 0.5 && delta >= 1) return { kind: "carico", bags: Math.round(delta / bagKg * 2) / 2 || 0.5 };
  }
  return { kind: "misura", bags: null };
}
var SMALL = 0.12;
var BIG = 0.35;
function detectEvents(rem, tot, t0, t1, bagKg) {
  if (rem.length === 0 || tot.length === 0 || t1 <= t0) return [];
  const n5 = Math.floor((t1 - t0) / MIN) + 1;
  const r6 = new Array(n5).fill(null);
  const c4 = new Array(n5).fill(null);
  let ri = 0;
  let ci = 0;
  let rv = null;
  let cv = null;
  for (let i6 = 0; i6 < n5; i6++) {
    const t3 = t0 + i6 * MIN;
    while (ri < rem.length && rem[ri].t <= t3) rv = rem[ri++].v;
    while (ci < tot.length && tot[ci].t <= t3) cv = tot[ci++].v;
    r6[i6] = rv;
    c4[i6] = cv;
  }
  const d3 = new Array(n5).fill(0);
  for (let i6 = 1; i6 < n5; i6++) {
    if (r6[i6] !== null && r6[i6 - 1] !== null && c4[i6] !== null && c4[i6 - 1] !== null) d3[i6] = r6[i6] - r6[i6 - 1] + (c4[i6] - c4[i6 - 1]);
  }
  const events = [];
  let prev = null;
  let i5 = 1;
  while (i5 < n5) {
    if (Math.abs(d3[i5]) <= SMALL) {
      i5++;
      continue;
    }
    let j = i5;
    let sum = 0;
    let at = i5;
    while (j < n5 && Math.abs(d3[j]) > SMALL) {
      sum += d3[j];
      if (Math.abs(d3[j]) > Math.abs(d3[at])) at = j;
      j++;
    }
    if (Math.abs(sum) > BIG) {
      const before = r6[i5 - 1];
      const after = r6[j - 1];
      const t3 = t0 + at * MIN;
      const cls = classifyDelta(sum, after, bagKg);
      const totNow = c4[at];
      let used = null;
      let real = null;
      let ratio = null;
      if (cls.kind === "misura" && prev) {
        used = totNow - prev.tot;
        real = prev.after - after;
        ratio = used >= 2 && real > 0 ? real / used : null;
      }
      events.push({ t: t3, kind: cls.kind, before, after, delta: sum, bags: cls.bags, from: prev && cls.kind === "misura" ? prev.t : null, used, real, ratio });
      prev = { t: t3, after, tot: totNow };
    }
    i5 = j;
  }
  return events;
}
function consumptionBuckets(tot, t0, t1, bucket) {
  const out = [];
  if (tot.length === 0) return out;
  let b0 = t0;
  while (b0 < t1) {
    let b1;
    if (bucket === "hour") b1 = b0 + HOUR;
    else {
      const d3 = new Date(b0);
      d3.setDate(d3.getDate() + 1);
      d3.setHours(0, 0, 0, 0);
      b1 = d3.getTime();
    }
    const end = Math.min(b1, t1);
    const a3 = valueAt(tot, b0);
    const b3 = valueAt(tot, end);
    out.push({ t0: b0, t1: b1, kg: a3 === null || b3 === null ? 0 : Math.max(0, b3 - a3), partial: b1 > t1 });
    b0 = b1;
  }
  return out;
}
function summarizePeriod(tot, events, t0, t1) {
  const first = tot.length ? Math.max(t0, tot[0].t) : t1;
  const days = Math.max(0, (t1 - first) / DAY);
  const a3 = valueAt(tot, first);
  const b3 = valueAt(tot, t1);
  const consumed = a3 === null || b3 === null ? 0 : Math.max(0, b3 - a3);
  const loadedEv = events.filter((e5) => e5.kind === "carico");
  return {
    consumed,
    perDay: days >= 0.5 ? consumed / days : null,
    loaded: loadedEv.reduce((s4, e5) => s4 + e5.delta, 0),
    bags: loadedEv.reduce((s4, e5) => s4 + (e5.bags ?? 0), 0),
    days
  };
}
function runOut(remKg, perDay, now) {
  if (remKg === null || perDay === null || perDay <= 0.05) return null;
  const days = remKg / perDay;
  return { days, date: now + days * DAY };
}
function calibration(events, tot, factorSeries, currentFactor) {
  const ok = events.filter((e5) => e5.kind === "misura" && e5.ratio !== null && e5.used !== null && e5.real !== null && e5.from !== null);
  if (ok.length === 0) return null;
  const used = ok.reduce((s4, e5) => s4 + e5.used, 0);
  const real = ok.reduce((s4, e5) => s4 + e5.real, 0);
  if (used <= 0) return null;
  let base = 0;
  let known = true;
  for (const e5 of ok) {
    for (let i5 = 1; i5 < tot.length; i5++) {
      const a3 = tot[i5 - 1];
      const b3 = tot[i5];
      if (b3.t <= e5.from || a3.t >= e5.t) continue;
      const d3 = b3.v - a3.v;
      if (d3 <= 0) continue;
      const f3 = valueAt(factorSeries, (a3.t + b3.t) / 2) ?? currentFactor;
      if (f3 === null || f3 <= 0) {
        known = false;
        break;
      }
      base += d3 / f3;
    }
    if (!known) break;
  }
  const usedFactor = known && base > 0 ? used / base : null;
  return {
    ratio: real / used,
    usedKg: used,
    readings: ok.length,
    usedFactor: usedFactor === null ? null : Math.round(usedFactor * 100) / 100,
    suggested: known && base > 0 ? Math.round(real / base * 100) / 100 : null
  };
}
function statsToPoints(rows, field) {
  const out = [];
  const ms = (v2) => {
    if (v2 === void 0) return null;
    if (typeof v2 === "number") return v2 < 1e11 ? v2 * 1e3 : v2;
    const x2 = Date.parse(v2);
    return Number.isNaN(x2) ? null : x2;
  };
  for (const r6 of rows ?? []) {
    const v2 = r6[field];
    const s4 = ms(r6.start);
    const e5 = ms(r6.end);
    if (typeof v2 === "number" && Number.isFinite(v2) && s4 !== null) out.push({ t: field === "state" && e5 !== null ? e5 - 1 : s4 + 30 * MIN, v: v2 });
  }
  return out.sort((a3, b3) => a3.t - b3.t);
}
function mergeSeries(stats, history) {
  if (history.length === 0) return stats;
  const from = history[0].t;
  return stats.filter((p3) => p3.t < from).concat(history);
}

// src/pellet-charts-dialog.ts
var TAG6 = "impianto-pellet-charts-dialog";
var PLOT_H2 = 230;
var BARS_H = 150;
var BT = 24;
var ML = 40;
var MR = 12;
var MT2 = 24;
var MB = 22;
var CAPACITY = 120;
var DAYS2 = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
var MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
var fmt2 = (n5, d3 = 1) => n5.toFixed(d3).replace(".", ",");
var sign = (n5, d3 = 1) => `${n5 > 0 ? "+" : n5 < 0 ? "\u2212" : ""}${fmt2(Math.abs(n5), d3)}`;
var dayLabel = (t3) => {
  const d3 = new Date(t3);
  return `${DAYS2[d3.getDay()]} ${d3.getDate()} ${MESI[d3.getMonth()]}`;
};
var ImpiantoPelletChartsDialog = class extends i4 {
  constructor() {
    super(...arguments);
    this.bagKg = 15;
    this.perDay = 6;
    this._range = "7d";
    this._showLoads = true;
    this._showReads = true;
    this._showGap = true;
    this._loading = false;
    this._error = "";
    this._w = 600;
    this._data = null;
    this._selT = null;
    this._selBar = null;
    this._seq = 0;
    this._onKey = (e5) => {
      if (e5.key === "Escape") this._close();
    };
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
    this._timer = window.setInterval(() => void this._load(), 12e4);
    void this._load();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
    this._ro?.disconnect();
    if (this._timer) window.clearInterval(this._timer);
  }
  firstUpdated() {
    const wrap = this.renderRoot.querySelector(".chartwrap");
    if (!wrap) return;
    this._ro = new ResizeObserver((entries) => {
      const w2 = Math.floor(entries[0]?.contentRect.width ?? 600);
      if (w2 > 100 && Math.abs(w2 - this._w) > 2) this._w = w2;
    });
    this._ro.observe(wrap);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }
  // ---- dati ----------------------------------------------------------------
  _ws(msg) {
    const cw = this.hass.callWS;
    return cw.call(this.hass, msg);
  }
  async _load() {
    if (!this.hass || !this.ids) return;
    const seq = ++this._seq;
    const range = PELLET_RANGES.find((r6) => r6.id === this._range) ?? PELLET_RANGES[2];
    const now = Date.now();
    const t0 = rangeStart(range, now);
    const { remaining, total } = this.ids;
    this._loading = this._data === null;
    try {
      const hist = await this._ws({
        type: "history/history_during_period",
        start_time: new Date(t0).toISOString(),
        end_time: new Date(now).toISOString(),
        entity_ids: this.ids.factor ? [remaining, total, this.ids.factor] : [remaining, total],
        include_start_time_state: true,
        significant_changes_only: false,
        minimal_response: true,
        no_attributes: true
      });
      if (seq !== this._seq) return;
      const factor = this.ids.factor ? parseNumeric(hist[this.ids.factor]) : [];
      const remH = parseNumeric(hist[remaining]);
      const totH = parseNumeric(hist[total]);
      const firstH = Math.min(remH[0]?.t ?? now, totH[0]?.t ?? now);
      const partial = firstH > t0 + 3 * 36e5;
      let rem = remH;
      let tot = totH;
      if (partial) {
        try {
          const st = await this._ws({
            type: "recorder/statistics_during_period",
            start_time: new Date(t0).toISOString(),
            end_time: new Date(firstH).toISOString(),
            statistic_ids: [remaining, total],
            period: "hour",
            types: ["mean", "state"]
          });
          rem = mergeSeries(statsToPoints(st[remaining], "mean"), remH);
          tot = mergeSeries(statsToPoints(st[total], "state"), totH);
        } catch {
        }
      }
      if (seq !== this._seq) return;
      const fineFrom = Math.max(t0, Math.min(remH[0]?.t ?? now, totH[0]?.t ?? now));
      const events = detectEvents(remH, totH, fineFrom, now, this.bagKg);
      this._data = { t0, t1: now, rem, tot, events, factor, buckets: consumptionBuckets(tot, t0, now, range.bucket), bucket: range.bucket, partial };
      this._error = "";
      if (this._selT !== null && (this._selT < t0 || this._selT > now)) this._selT = null;
    } catch (e5) {
      this._error = `Non riesco a leggere lo storico: ${e5?.message ?? e5}`;
    } finally {
      if (seq === this._seq) this._loading = false;
    }
  }
  _setRange(id) {
    if (id === this._range) return;
    this._range = id;
    this._selT = null;
    this._selBar = null;
    this._data = null;
    void this._load();
  }
  // ---- grafico dei chili rimasti ----------------------------------------------
  _renderLevel(d3) {
    const W = this._w;
    const pw = Math.max(50, W - ML - MR);
    const axis = { min: 0, max: CAPACITY, ticks: [0, 30, 60, 90, 120] };
    const x2 = (t3) => ML + (t3 - d3.t0) / Math.max(1, d3.t1 - d3.t0) * pw;
    const y3 = (v2) => MT2 + (1 - (v2 - axis.min) / (axis.max - axis.min)) * PLOT_H2;
    const inside = d3.rem.filter((p3) => p3.t >= d3.t0 && p3.t <= d3.t1);
    const stride = Math.max(1, Math.ceil(inside.length / 1400));
    const pts = inside.filter((_2, i5) => i5 % stride === 0);
    if (inside.length && pts[pts.length - 1] !== inside[inside.length - 1]) pts.push(inside[inside.length - 1]);
    if (pts.length) pts.push({ t: d3.t1, v: pts[pts.length - 1].v });
    const line = pts.map((p3, i5) => `${i5 ? "L" : "M"}${x2(p3.t).toFixed(1)} ${y3(p3.v).toFixed(1)}`).join("");
    const area = pts.length ? `${line}L${x2(pts[pts.length - 1].t).toFixed(1)} ${y3(0)}L${x2(pts[0].t).toFixed(1)} ${y3(0)}Z` : "";
    const ticks = this._ticks(d3, Math.max(3, Math.floor(pw / 90)));
    const sel = this._selT;
    const selV = sel !== null ? valueAt(d3.rem, sel) : null;
    const ev = d3.events.filter((e5) => e5.t >= d3.t0 && e5.t <= d3.t1);
    const H3 = MT2 + PLOT_H2 + MB;
    return w`
      <svg width=${W} height=${H3} viewBox="0 0 ${W} ${H3}" role="img" aria-label="Chili di pellet rimasti nel serbatoio"
        @pointerdown=${(e5) => this._pick(e5, d3, x2)} @pointermove=${(e5) => e5.pointerType === "mouse" && this._pick(e5, d3, x2)}>
        <defs><linearGradient id="pcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9922b" stop-opacity="0.45" /><stop offset="1" stop-color="#d9922b" stop-opacity="0.04" /></linearGradient></defs>
        ${axis.ticks.map((v2) => w`<line class="grid" x1=${ML} x2=${W - MR} y1=${y3(v2)} y2=${y3(v2)} /><text class="ax" x=${ML - 6} y=${y3(v2) + 4} text-anchor="end">${v2}</text>`)}
        <text class="ax" x="4" y="12">kg</text>
        ${ticks.map((tk) => w`<line class=${tk.major ? "vgrid major" : "vgrid"} x1=${x2(tk.t)} x2=${x2(tk.t)} y1=${MT2} y2=${MT2 + PLOT_H2} /><text class="ax" x=${x2(tk.t)} y=${MT2 + PLOT_H2 + 15} text-anchor="middle">${tk.label}</text>`)}
        <line class="cap" x1=${ML} x2=${W - MR} y1=${y3(CAPACITY)} y2=${y3(CAPACITY)} />
        ${area ? w`<path d=${area} fill="url(#pcg)" />` : A}
        ${line ? w`<path class="line" d=${line} />` : A}
        ${ev.map((e5) => this._marker(e5, x2, y3))}
        ${sel !== null && selV !== null ? w`<line class="cursor" x1=${x2(sel)} x2=${x2(sel)} y1=${MT2} y2=${MT2 + PLOT_H2} /><circle class="dot" cx=${x2(sel)} cy=${y3(selV)} r="4.5" fill="#d9922b" />` : A}
      </svg>
    `;
  }
  /** Tacche dell'asse del tempo: con i periodi a giorni una per giorno (mezzanotte locale, anche col cambio dell'ora), altrimenti a ore. */
  _ticks(d3, maxTicks) {
    if (d3.bucket === "hour") return timeTicks(d3.t0, d3.t1, maxTicks);
    const days = Math.ceil((d3.t1 - d3.t0) / 864e5);
    const every = Math.max(1, Math.ceil(days / maxTicks));
    const out = [];
    const c4 = new Date(d3.t0);
    c4.setHours(0, 0, 0, 0);
    for (let i5 = 0; c4.getTime() <= d3.t1; i5++, c4.setDate(c4.getDate() + 1)) {
      if (c4.getTime() < d3.t0 || i5 % every) continue;
      out.push({ t: c4.getTime(), label: days > 14 ? `${c4.getDate()} ${MESI[c4.getMonth()]}` : `${DAYS2[c4.getDay()]} ${c4.getDate()}`, major: true });
    }
    return out;
  }
  _marker(e5, x2, y3) {
    const cx = x2(e5.t);
    if (e5.kind === "carico") {
      if (!this._showLoads) return A;
      return w`
        <line class="evline load" x1=${cx} x2=${cx} y1=${y3(e5.before)} y2=${y3(e5.after)} />
        <path class="load" d="M${cx} ${y3(e5.after) - 9}l6 10h-12z" />
        <text class="evtxt load" x=${cx} y=${y3(e5.after) - 13} text-anchor="middle">${sign(e5.delta, 0)} kg</text>`;
    }
    if (!this._showReads) return A;
    return w`
      ${this._showGap ? w`<line class="evline gap" x1=${cx} x2=${cx} y1=${y3(e5.before)} y2=${y3(e5.after)} />` : A}
      <circle class="read" cx=${cx} cy=${y3(e5.after)} r="5.5" />
      <text class="evtxt read" x=${cx > this._w - 150 ? cx - 8 : cx + 8} text-anchor=${cx > this._w - 150 ? "end" : "start"} y=${y3(e5.after) + (e5.after < 20 ? -8 : 15)}>${fmt2(e5.after, 1)} kg${this._showGap ? b2` (${sign(e5.delta)})` : ""}</text>`;
  }
  _pick(ev, d3, x2) {
    const svgEl = ev.currentTarget;
    const r6 = svgEl.getBoundingClientRect();
    const px = ev.clientX - r6.left;
    const t3 = d3.t0 + (px - ML) / Math.max(1, this._w - ML - MR) * (d3.t1 - d3.t0);
    const near = d3.events.find((e5) => Math.abs(x2(e5.t) - px) <= 14);
    this._selT = Math.max(d3.t0, Math.min(d3.t1, near ? near.t : t3));
  }
  _renderTip(d3) {
    if (this._selT === null) return A;
    const t3 = this._selT;
    const v2 = valueAt(d3.rem, t3);
    const px = ML + (t3 - d3.t0) / Math.max(1, d3.t1 - d3.t0) * Math.max(50, this._w - ML - MR);
    const near = d3.events.find((e5) => Math.abs(e5.t - t3) < Math.max(5 * 6e4, (d3.t1 - d3.t0) / 200));
    const left = px > this._w / 2 ? { right: `${this._w - px + 8}px` } : { left: `${px + 8}px` };
    const style = Object.entries(left).map(([k2, val]) => `${k2}:${val}`).join(";");
    return b2`<div class="tip" style=${style}>
      <div class="tt">${formatMoment(t3)}</div>
      <div class="tr"><i style="background:#d9922b"></i><span class="tn">Rimasti</span><b>${v2 === null ? "\u2013" : `${fmt2(v2)} kg`}</b></div>
      ${near ? near.kind === "carico" ? b2`<div class="tr ev load"><span class="tn">Caricamento</span><b>${sign(near.delta)} kg${near.bags ? ` \xB7 ${fmt2(near.bags, near.bags % 1 ? 1 : 0)} ${near.bags === 1 ? "sacco" : "sacchi"}` : ""}</b></div>
              <div class="note">da ${fmt2(near.before)} a ${fmt2(near.after)} kg</div>` : b2`<div class="tr ev read"><span class="tn">Lettura del livello</span><b>${fmt2(near.after)} kg</b></div>
              <div class="note">la stima diceva ${fmt2(near.before)} kg: scarto ${sign(near.delta)} kg${near.ratio !== null ? ` \xB7 consumo reale ${fmt2(near.ratio * 100, 0)} % della stima` : ""}</div>` : A}
    </div>`;
  }
  // ---- consumo per giorno -------------------------------------------------------
  _renderBars(d3) {
    const W = this._w;
    const pw = Math.max(50, W - ML - MR);
    const bs = d3.buckets;
    if (bs.length === 0) return b2`<p class="empty">Nessun dato di consumo nel periodo.</p>`;
    const max = Math.max(0.5, ...bs.map((b3) => b3.kg));
    const axis = niceAxis(0, max, 4);
    const y3 = (v2) => BT + (1 - (v2 - axis.min) / (axis.max - axis.min)) * BARS_H;
    const slot = pw / bs.length;
    const bw = Math.max(3, Math.min(54, slot * 0.7));
    const full = bs.filter((b3) => !b3.partial);
    const avg = full.length ? full.reduce((s4, b3) => s4 + b3.kg, 0) / full.length : null;
    const labels = bs.length <= 16;
    const unit = d3.bucket === "hour" ? "kg/h" : "kg/giorno";
    const H3 = BT + BARS_H + 22;
    const every = Math.max(1, Math.ceil(bs.length / Math.max(3, Math.floor(pw / 60))));
    const label = (b3) => d3.bucket === "hour" ? `${String(new Date(b3.t0).getHours()).padStart(2, "0")}:00` : `${DAYS2[new Date(b3.t0).getDay()]} ${new Date(b3.t0).getDate()}`;
    return w`
      <svg width=${W} height=${H3} viewBox="0 0 ${W} ${H3}" role="img" aria-label="Consumo stimato di pellet">
        ${axis.ticks.map((v2) => w`<line class="grid" x1=${ML} x2=${W - MR} y1=${y3(v2)} y2=${y3(v2)} /><text class="ax" x=${ML - 6} y=${y3(v2) + 4} text-anchor="end">${fmt2(v2, v2 % 1 ? 1 : 0)}</text>`)}
        <text class="ax" x="4" y="9">${unit}</text>
        ${bs.map((b3, i5) => {
      const cx = ML + slot * (i5 + 0.5);
      const top = y3(b3.kg);
      const on2 = this._selBar === i5;
      return w`<g class="bar" @pointerdown=${() => this._selBar = on2 ? null : i5}>
            <rect x=${ML + slot * i5} y=${BT} width=${slot} height=${BARS_H} fill="transparent" />
            <rect class=${`b${b3.partial ? " partial" : ""}${on2 ? " on" : ""}`} x=${cx - bw / 2} y=${top} width=${bw} height=${Math.max(0.5, y3(0) - top)} rx="3" />
            ${labels || on2 ? w`<text class="blab" x=${cx} y=${top - 4} text-anchor="middle">${fmt2(b3.kg, 1)}</text>` : A}
            ${i5 % every === 0 ? w`<text class="ax" x=${cx} y=${BT + BARS_H + 15} text-anchor="middle">${label(b3)}</text>` : A}
          </g>`;
    })}
        ${avg !== null ? w`<line class="avg" x1=${ML} x2=${W - MR} y1=${y3(avg)} y2=${y3(avg)} /><text class="avgt" x=${W - MR} y=${y3(avg) - 4} text-anchor="end">media ${fmt2(avg, 1)}</text>` : A}
      </svg>
    `;
  }
  _renderBarReadout(d3) {
    if (this._selBar === null) return b2`<p class="hint">Tocca una colonna per leggere il consumo di quel ${d3.bucket === "hour" ? "ora" : "giorno"}.</p>`;
    const b3 = d3.buckets[this._selBar];
    if (!b3) return A;
    const when = d3.bucket === "hour" ? `${dayLabel(b3.t0)}, ${String(new Date(b3.t0).getHours()).padStart(2, "0")}:00` : dayLabel(b3.t0);
    return b2`<p class="hint"><b>${when}</b>: ${fmt2(b3.kg, 2)} kg stimati${b3.partial ? " (non ancora finito)" : ""}.</p>`;
  }
  // ---- riepilogo, eventi, taratura -----------------------------------------------
  _tile(label, value, sub = "") {
    return b2`<div class="tile"><div class="tl">${label}</div><div class="tv">${value}</div>${sub ? b2`<div class="ts">${sub}</div>` : A}</div>`;
  }
  _renderSummary(d3) {
    const s4 = summarizePeriod(d3.tot, d3.events, d3.t0, d3.t1);
    const remNow = d3.rem.length ? d3.rem[d3.rem.length - 1].v : null;
    const rate = s4.perDay !== null && s4.days >= 3 ? s4.perDay : this.perDay;
    const out = runOut(remNow, rate, d3.t1);
    const dd = out ? new Date(out.date) : null;
    return b2`<div class="tiles">
      ${this._tile("Rimasti adesso", remNow === null ? "\u2013" : `${fmt2(remNow)} kg`, remNow === null ? "" : `${fmt2(remNow / CAPACITY * 100, 0)} % del serbatoio`)}
      ${this._tile("Consumo medio", s4.perDay === null ? "\u2013" : `${fmt2(s4.perDay)} kg/giorno`, `stima su ${fmt2(s4.days, s4.days < 10 ? 1 : 0)} giorni`)}
      ${this._tile("Consumati nel periodo", `${fmt2(s4.consumed)} kg`, "stima della scheda")}
      ${this._tile("Caricati nel periodo", `${fmt2(s4.loaded, 0)} kg`, s4.bags ? `${fmt2(s4.bags, s4.bags % 1 ? 1 : 0)} ${s4.bags === 1 ? "sacco" : "sacchi"}` : "nessun caricamento")}
      ${this._tile("Finisce", dd ? `${DAYS2[dd.getDay()]} ${dd.getDate()} ${MESI[dd.getMonth()]}` : "\u2013", out ? `tra ${fmt2(out.days, out.days < 10 ? 1 : 0)} giorni a ${fmt2(rate)} kg/giorno` : "")}
    </div>`;
  }
  _renderEvents(d3) {
    const ev = d3.events.filter((e5) => e5.t >= d3.t0).slice().reverse();
    if (ev.length === 0) return b2`<p class="empty">Nel periodo non risultano caricamenti né letture del livello${d3.partial ? " nello storico dettagliato" : ""}.</p>`;
    return b2`<table>
      <thead><tr><th>Quando</th><th>Cosa</th><th>Chili</th><th>Dettaglio</th></tr></thead>
      <tbody>
        ${ev.map(
      (e5) => b2`<tr class=${e5.kind === "carico" ? "load" : "read"} @click=${() => this._selT = e5.t}>
            <td>${formatMoment(e5.t)}</td>
            <td>${e5.kind === "carico" ? b2`<span class="badge load">Caricamento</span>` : b2`<span class="badge read">Lettura</span>`}</td>
            <td>${e5.kind === "carico" ? `${sign(e5.delta)}` : fmt2(e5.after)} kg</td>
            <td class="det">${e5.kind === "carico" ? `${e5.bags ? `${fmt2(e5.bags, e5.bags % 1 ? 1 : 0)} ${e5.bags === 1 ? "sacco" : "sacchi"}, ` : ""}da ${fmt2(e5.before)} a ${fmt2(e5.after)} kg` : `stima ${fmt2(e5.before)} kg, scarto ${sign(e5.delta)} kg${e5.ratio !== null ? `, consumo reale ${fmt2(e5.ratio * 100, 0)} % della stima` : ""}`}</td>
          </tr>`
    )}
      </tbody>
    </table>`;
  }
  _renderCalibration(d3) {
    const f3 = this.ids.factor ? Number(this.hass.states[this.ids.factor]?.state) : NaN;
    const cur = Number.isFinite(f3) ? f3 : null;
    const c4 = calibration(d3.events, d3.tot, d3.factor, cur);
    if (!c4) return b2`<p class="hint">Per controllare la taratura servono almeno due eventi con una lettura del livello in mezzo: la scheda confronta quanto pellet è sceso davvero con quanto aveva stimato.</p>`;
    const same = c4.suggested !== null && cur !== null && Math.abs(c4.suggested - cur) < 0.03;
    return b2`<div class="calib">
      <b>Taratura della stima</b>
      <p>Nelle ${c4.readings} ${c4.readings === 1 ? "lettura" : "letture"} del livello il pellet sceso davvero è stato il <b>${fmt2(c4.ratio * 100, 0)} %</b> di quello stimato
      (${fmt2(c4.usedKg, 0)} kg stimati${c4.usedFactor !== null ? `, con il fattore di allora, in media ${fmt2(c4.usedFactor, 2)}` : ""}).
      ${c4.suggested !== null ? same ? b2`Il fattore attuale (${fmt2(cur, 2)}) è già quello che torna con le letture.` : b2`Il fattore che avrebbe dato la stima giusta è <b>${fmt2(c4.suggested, 2)}</b>${cur !== null ? ` (adesso ${fmt2(cur, 2)}; cambialo dalle preferenze, blocco \xABPellet\xBB)` : ""}. Dopo averlo cambiato il valore resta lo stesso: le stime passate non si ricalcolano.` : A}
      ${c4.usedKg < 15 ? " Sono pochi chili: aspetta altre letture prima di cambiare il fattore." : ""}</p>
    </div>`;
  }
  // ---- pagina ---------------------------------------------------------------
  render() {
    const d3 = this._data;
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Pellet: consumi e caricamenti">
          <div class="head">
            <div class="title">Pellet: consumi e caricamenti</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            <div class="chips" role="group" aria-label="Periodo">
              ${PELLET_RANGES.map((r6) => b2`<button class=${r6.id === this._range ? "chip on" : "chip"} aria-pressed=${r6.id === this._range} @click=${() => this._setRange(r6.id)}>${r6.label}</button>`)}
            </div>
            ${this._error ? b2`<div class="err">${this._error}</div>` : A}
            ${d3 ? this._renderSummary(d3) : A}
            <div class="sect">Chili rimasti nel serbatoio</div>
            <div class="chips" role="group" aria-label="Cosa evidenziare">
              <button class=${this._showLoads ? "chip on" : "chip"} aria-pressed=${this._showLoads} @click=${() => this._showLoads = !this._showLoads}><i class="load"></i>Caricamenti</button>
              <button class=${this._showReads ? "chip on" : "chip"} aria-pressed=${this._showReads} @click=${() => this._showReads = !this._showReads}><i class="read"></i>Letture del livello</button>
              <button class=${this._showGap ? "chip on" : "chip"} aria-pressed=${this._showGap} ?disabled=${!this._showReads} @click=${() => this._showGap = !this._showGap}><i class="gap"></i>Scarto della stima</button>
            </div>
            <div class="chartarea ${this._loading ? "loading" : ""}">
              <div class="chartwrap">${d3 ? this._renderLevel(d3) : b2`<div style="height:${PLOT_H2 + MT2 + MB}px"></div>`}${d3 ? this._renderTip(d3) : A}</div>
              ${this._loading ? b2`<div class="spin">Carico lo storico…</div>` : A}
            </div>
            ${d3?.partial ? b2`<p class="hint">Lo storico dettagliato non copre tutto il periodo (Home Assistant ne conserva pochi giorni): prima si vede solo un andamento approssimato, senza caricamenti né letture.</p>` : A}
            ${d3 ? b2`<div class="sect">Consumo stimato ${d3.bucket === "hour" ? "per ora" : "per giorno"}</div>${this._renderBars(d3)}${this._renderBarReadout(d3)}` : A}
            ${d3 ? b2`<div class="sect">Caricamenti e letture del livello</div>${this._renderEvents(d3)}${this._renderCalibration(d3)}` : A}
            <p class="hint">Il consumo è una stima della scheda (potenza, stand-by e accensioni); la lettura del livello la corregge e si vede come scarto.</p>
          </div>
        </div>
      </div>
    `;
  }
  static {
    this.styles = i`
    :host {
      position: fixed;
      inset: 0;
      z-index: 10000;
      color: var(--primary-text-color, #212121);
      font-family: var(--paper-font-body1_-_font-family, Roboto, Helvetica, Arial, sans-serif);
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      box-sizing: border-box;
    }
    .panel {
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      width: 100%;
      max-width: 940px;
      max-height: min(94vh, 900px);
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
      overflow: hidden;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    }
    .title {
      font-size: 19px;
      font-weight: 700;
    }
    .x {
      background: none;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 8px;
    }
    .x:hover {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
    }
    .body {
      overflow-y: auto;
      padding: 10px 18px 18px;
    }
    .sect {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--secondary-text-color, #727272);
      margin: 16px 0 4px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 6px 0 8px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 36px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      background: none;
      color: var(--secondary-text-color, #727272);
      border-radius: 999px;
      padding: 6px 13px;
      font-size: 13.5px;
      cursor: pointer;
      font-family: inherit;
    }
    .chip.on {
      color: var(--primary-text-color, #212121);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      border-color: var(--secondary-text-color, #727272);
    }
    .chip:disabled {
      opacity: 0.4;
    }
    .chip i {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      border: 2px solid;
      box-sizing: border-box;
      display: inline-block;
    }
    i.load {
      border-color: #22c55e;
      background: #22c55e;
      border-radius: 2px;
    }
    i.read {
      border-color: #3b82f6;
      background: #3b82f6;
    }
    i.gap {
      border-color: #f97316;
      background: #f97316;
      border-radius: 1px;
      width: 4px;
    }
    .tiles {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 8px;
      margin: 6px 0 4px;
    }
    .tile {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      border-radius: 12px;
      padding: 8px 12px;
    }
    .tl {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
    }
    .tv {
      font-size: 19px;
      font-weight: 700;
      margin-top: 1px;
    }
    .ts {
      font-size: 11.5px;
      color: var(--secondary-text-color, #727272);
    }
    .chartarea {
      position: relative;
    }
    .chartarea.loading svg {
      opacity: 0.35;
    }
    .spin {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary-text-color, #727272);
    }
    .chartwrap {
      position: relative;
      width: 100%;
    }
    svg {
      display: block;
      touch-action: pan-y;
      user-select: none;
    }
    .grid {
      stroke: var(--divider-color, rgba(127, 127, 127, 0.3));
      stroke-width: 1;
    }
    .vgrid {
      stroke: var(--divider-color, rgba(127, 127, 127, 0.2));
      stroke-width: 1;
      stroke-dasharray: 2 4;
    }
    .vgrid.major {
      stroke-dasharray: none;
      stroke: var(--secondary-text-color, rgba(127, 127, 127, 0.5));
    }
    .cap {
      stroke: #22c55e;
      stroke-width: 1;
      stroke-dasharray: 6 4;
      opacity: 0.55;
    }
    .ax {
      font-size: 11.5px;
      fill: var(--secondary-text-color, #727272);
    }
    .line {
      fill: none;
      stroke: #d9922b;
      stroke-width: 2.4;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    .evline {
      stroke-width: 2.4;
      stroke-dasharray: 4 3;
    }
    .evline.load {
      stroke: #22c55e;
    }
    .evline.gap {
      stroke: #f97316;
      stroke-dasharray: none;
      stroke-width: 3.2;
      opacity: 0.85;
    }
    path.load {
      fill: #22c55e;
    }
    circle.read {
      fill: #3b82f6;
      stroke: var(--card-background-color, #fff);
      stroke-width: 2;
    }
    .evtxt {
      font-size: 11.5px;
      font-weight: 700;
    }
    .evtxt.load {
      fill: #16a34a;
    }
    .evtxt.read {
      fill: #2563eb;
    }
    .cursor {
      stroke: var(--primary-text-color, #212121);
      stroke-width: 1;
      opacity: 0.6;
    }
    .dot {
      stroke: var(--card-background-color, #fff);
      stroke-width: 2;
    }
    .tip {
      position: absolute;
      top: 6px;
      z-index: 2;
      pointer-events: none;
      min-width: 200px;
      max-width: 300px;
      padding: 8px 10px;
      border-radius: 10px;
      font-size: 12.5px;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    }
    .tt {
      font-weight: 700;
      margin-bottom: 4px;
    }
    .tr {
      display: flex;
      align-items: center;
      gap: 6px;
      line-height: 1.55;
    }
    .tr i {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex: none;
      display: inline-block;
    }
    .tr .tn {
      flex: 1;
      color: var(--secondary-text-color, #727272);
    }
    .tr.ev.load b {
      color: #16a34a;
    }
    .tr.ev.read b {
      color: #2563eb;
    }
    .note {
      font-size: 11.5px;
      color: var(--secondary-text-color, #727272);
      margin-top: 2px;
    }
    rect.b {
      fill: #d9922b;
      opacity: 0.85;
    }
    rect.b.partial {
      opacity: 0.45;
    }
    rect.b.on {
      fill: #f59e0b;
      opacity: 1;
    }
    .blab {
      font-size: 11px;
      fill: var(--primary-text-color, #212121);
    }
    .avg {
      stroke: var(--secondary-text-color, #727272);
      stroke-width: 1.5;
      stroke-dasharray: 5 4;
    }
    .avgt {
      font-size: 11.5px;
      fill: var(--secondary-text-color, #727272);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    th {
      text-align: left;
      font-weight: 600;
      color: var(--secondary-text-color, #727272);
      font-size: 12px;
      padding: 4px 6px;
    }
    td {
      padding: 7px 6px;
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
      vertical-align: top;
    }
    tr:hover td {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
    }
    td.det {
      color: var(--secondary-text-color, #727272);
      font-size: 12.5px;
    }
    .badge {
      display: inline-block;
      border-radius: 999px;
      padding: 2px 9px;
      font-size: 12px;
      font-weight: 700;
      color: #fff;
    }
    .badge.load {
      background: #16a34a;
    }
    .badge.read {
      background: #2563eb;
    }
    .calib {
      margin-top: 10px;
      padding: 10px 14px;
      border-radius: 12px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      font-size: 13.5px;
    }
    .calib p {
      margin: 4px 0 0;
    }
    .empty,
    .hint {
      color: var(--secondary-text-color, #727272);
      font-size: 13px;
      margin: 8px 0 0;
    }
    .err {
      color: #ef4444;
      font-size: 13.5px;
      margin: 6px 0;
    }
    @media (max-width: 560px) {
      .body {
        padding: 8px 10px 14px;
      }
      td.det {
        display: none;
      }
      th:nth-child(4) {
        display: none;
      }
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], ImpiantoPelletChartsDialog.prototype, "hass", 2);
__decorateClass([
  n4({ attribute: false })
], ImpiantoPelletChartsDialog.prototype, "ids", 2);
__decorateClass([
  n4({ attribute: false })
], ImpiantoPelletChartsDialog.prototype, "bagKg", 2);
__decorateClass([
  n4({ attribute: false })
], ImpiantoPelletChartsDialog.prototype, "perDay", 2);
__decorateClass([
  r5()
], ImpiantoPelletChartsDialog.prototype, "_range", 2);
__decorateClass([
  r5()
], ImpiantoPelletChartsDialog.prototype, "_showLoads", 2);
__decorateClass([
  r5()
], ImpiantoPelletChartsDialog.prototype, "_showReads", 2);
__decorateClass([
  r5()
], ImpiantoPelletChartsDialog.prototype, "_showGap", 2);
__decorateClass([
  r5()
], ImpiantoPelletChartsDialog.prototype, "_loading", 2);
__decorateClass([
  r5()
], ImpiantoPelletChartsDialog.prototype, "_error", 2);
__decorateClass([
  r5()
], ImpiantoPelletChartsDialog.prototype, "_w", 2);
__decorateClass([
  r5()
], ImpiantoPelletChartsDialog.prototype, "_data", 2);
__decorateClass([
  r5()
], ImpiantoPelletChartsDialog.prototype, "_selT", 2);
__decorateClass([
  r5()
], ImpiantoPelletChartsDialog.prototype, "_selBar", 2);
if (!customElements.get(TAG6)) customElements.define(TAG6, ImpiantoPelletChartsDialog);

// src/card-dialog.ts
var TAG7 = "impianto-card-dialog";
var ImpiantoCardDialog = class extends i4 {
  constructor() {
    super(...arguments);
    this.tag = "";
    this.config = {};
    this.label = "";
    this.wide = false;
    this._onKey = (e5) => {
      if (e5.key === "Escape") this._close();
    };
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
  }
  _close() {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }
  _ensureCard() {
    if (!this._card) {
      const el = document.createElement(this.tag);
      el.setConfig({ type: `custom:${this.tag}`, ...this.config });
      this._card = el;
    }
    return this._card;
  }
  render() {
    const card = this._ensureCard();
    if (this.hass) card.hass = this.hass;
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class=${this.wide ? "panel wide" : "panel"} role="dialog" aria-modal="true" aria-label=${this.label || this.tag}>
          <div class="bar"><button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button></div>
          <div class="body">${card}</div>
        </div>
      </div>
    `;
  }
  static {
    this.styles = i`
    :host {
      position: fixed;
      inset: 0;
      z-index: 10000;
      color: var(--primary-text-color, #212121);
      font-family: var(--paper-font-body1_-_font-family, Roboto, Helvetica, Arial, sans-serif);
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      box-sizing: border-box;
    }
    .panel {
      position: relative;
      width: 100%;
      max-width: 620px;
      max-height: 94vh;
      display: flex;
      flex-direction: column;
      border-radius: 16px;
      overflow: hidden;
      background: var(--card-background-color, #fff);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
    }
    .panel.wide {
      max-width: 940px;
    }
    .bar {
      display: flex;
      justify-content: flex-end;
      padding: 4px 8px 0;
    }
    .x {
      width: 44px;
      height: 44px;
      background: none;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      border-radius: 50%;
    }
    .x:hover {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
    }
    .body {
      overflow-y: auto;
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], ImpiantoCardDialog.prototype, "hass", 2);
__decorateClass([
  n4()
], ImpiantoCardDialog.prototype, "tag", 2);
__decorateClass([
  n4({ attribute: false })
], ImpiantoCardDialog.prototype, "config", 2);
__decorateClass([
  n4()
], ImpiantoCardDialog.prototype, "label", 2);
__decorateClass([
  n4({ type: Boolean })
], ImpiantoCardDialog.prototype, "wide", 2);
if (!customElements.get(TAG7)) customElements.define(TAG7, ImpiantoCardDialog);

// src/confirm-dialog.ts
var TAG8 = "impianto-confirm-dialog";
var ImpiantoConfirmDialog = class extends i4 {
  constructor() {
    super(...arguments);
    this.heading = "";
    this.lines = [];
    this.confirmLabel = "Conferma";
    this.cancelLabel = "Annulla";
    this.danger = false;
    this._onKey = (e5) => {
      if (e5.key === "Escape") this._close();
    };
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
  }
  firstUpdated() {
    this.renderRoot.querySelector("button.cancel")?.focus();
  }
  _close() {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }
  _confirm() {
    this.dispatchEvent(new CustomEvent("confirmed"));
    this._close();
  }
  render() {
    return b2`
      <div class="backdrop" @click=${(e5) => e5.target === e5.currentTarget && this._close()}>
        <div class="panel" role="alertdialog" aria-modal="true" aria-label=${this.heading}>
          <div class="title">${this.heading}</div>
          ${this.lines.map((l3) => b2`<p>${l3}</p>`)}
          <div class="row">
            <button class="cancel" @click=${() => this._close()}>${this.cancelLabel}</button>
            <button class=${this.danger ? "ok danger" : "ok"} @click=${() => this._confirm()}>${this.confirmLabel}</button>
          </div>
        </div>
      </div>
    `;
  }
  static {
    this.styles = i`
    :host {
      position: fixed;
      inset: 0;
      z-index: 10001;
      color: var(--primary-text-color, #212121);
      font-family: var(--paper-font-body1_-_font-family, Roboto, Helvetica, Arial, sans-serif);
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      box-sizing: border-box;
    }
    .panel {
      width: 100%;
      max-width: 420px;
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      padding: 20px 20px 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      box-sizing: border-box;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    p {
      margin: 8px 0 0;
      font-size: 15px;
      line-height: 1.4;
      color: var(--secondary-text-color, #727272);
    }
    .row {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }
    button {
      flex: 1;
      min-height: 52px;
      border-radius: 14px;
      font: inherit;
      font-size: 17px;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
    }
    .cancel {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
      color: inherit;
    }
    .ok {
      background: var(--primary-color, #03a9f4);
      border-color: transparent;
      color: var(--text-primary-color, #fff);
    }
    .ok.danger {
      background: #ef4444;
    }
    button:focus-visible {
      outline: 3px solid var(--primary-text-color, #212121);
      outline-offset: 2px;
    }
  `;
  }
};
__decorateClass([
  n4()
], ImpiantoConfirmDialog.prototype, "heading", 2);
__decorateClass([
  n4({ attribute: false })
], ImpiantoConfirmDialog.prototype, "lines", 2);
__decorateClass([
  n4()
], ImpiantoConfirmDialog.prototype, "confirmLabel", 2);
__decorateClass([
  n4()
], ImpiantoConfirmDialog.prototype, "cancelLabel", 2);
__decorateClass([
  n4({ type: Boolean })
], ImpiantoConfirmDialog.prototype, "danger", 2);
if (!customElements.get(TAG8)) customElements.define(TAG8, ImpiantoConfirmDialog);

// src/plant-logic.ts
var DEFAULT_MODEL = {
  volume: 190,
  topShare: 0.5,
  mainsTemp: 15,
  showerVolume: 40,
  showerTemp: 38
};
function showersEstimate(top, bottom, m2) {
  if (top === null) return null;
  const span = m2.showerTemp - m2.mainsTemp;
  if (span <= 0 || m2.showerVolume <= 0) return null;
  const zones = [
    [m2.volume * m2.topShare, top],
    [m2.volume * (1 - m2.topShare), bottom ?? top]
  ];
  const floor = m2.coilMin ?? null;
  let liters = 0;
  for (const [v2, t3] of zones) {
    if (t3 === null) continue;
    if (floor !== null) {
      if (t3 >= Math.max(floor, m2.showerTemp)) liters += v2 * (t3 - floor) / span;
    } else if (t3 >= m2.showerTemp) liters += v2 * (t3 - m2.mainsTemp) / span;
  }
  return Math.floor(liters / m2.showerVolume);
}
function stoveLook(state) {
  const s4 = (state ?? "").trim().toUpperCase();
  if (["WORK", "LAVORO", "WORKING"].includes(s4)) return "work";
  if (["START", "AVVIO", "ACCENSIONE", "IGNITION"].includes(s4)) return "start";
  if (["WAIT", "ATTESA", "PRE-START"].includes(s4)) return "wait";
  if (["STAND BY", "STANDBY", "STAND-BY"].includes(s4)) return "standby";
  if (["STOP", "SPEGNIMENTO", "CLEANING", "PULIZIA"].includes(s4)) return "stopping";
  return "off";
}
var COLOR_STOPS = [
  [15, [59, 130, 246]],
  // blu
  [30, [147, 197, 253]],
  // azzurro chiaro
  [42, [252, 211, 77]],
  // giallo
  [55, [249, 115, 22]],
  // arancione
  [65, [239, 68, 68]]
  // rosso
];
function tempColor(t3) {
  if (t3 === null || Number.isNaN(t3)) return "#94a3b8";
  const first = COLOR_STOPS[0];
  const last = COLOR_STOPS[COLOR_STOPS.length - 1];
  let rgb = t3 <= first[0] ? first[1] : last[1];
  if (t3 > first[0] && t3 < last[0]) {
    for (let i5 = 1; i5 < COLOR_STOPS.length; i5++) {
      const [t1, c1] = COLOR_STOPS[i5];
      if (t3 <= t1) {
        const [t0, c0] = COLOR_STOPS[i5 - 1];
        const k2 = (t3 - t0) / (t1 - t0);
        rgb = [0, 1, 2].map((j) => Math.round(c0[j] + (c1[j] - c0[j]) * k2));
        break;
      }
    }
  }
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}
function fmt3(n5, decimals2 = 0) {
  if (n5 === null || n5 === void 0 || Number.isNaN(n5)) return "\u2013";
  return n5.toLocaleString("it-IT", { minimumFractionDigits: decimals2, maximumFractionDigits: decimals2 });
}
function toNumber(state) {
  if (state === void 0 || state === null || state === "" || state === "unknown" || state === "unavailable") return null;
  const n5 = Number(state);
  return Number.isFinite(n5) ? n5 : null;
}
var BOOST_LABEL = {
  pronta: ["Avvia caldaia", ""],
  attiva: ["Annulla", "accensione in corso"],
  non_serve: ["Non serve", "acqua gi\xE0 calda"],
  puffer_caldo: ["Puffer caldo", "il calore c'\xE8 gi\xE0"],
  accesa: ["Gi\xE0 accesa", "in accensione o al lavoro"],
  in_attesa: ["In attesa", "ECO STOP: riparte da sola"],
  in_arresto: ["In spegnimento", "riprova tra poco"],
  allarme: ["Allarme", "caldaia bloccata"],
  limite: ["Limite di oggi", "accensioni rapide"],
  non_disponibile: ["Non disponibile", "mancano dati"]
};
function boostButton(state, armed) {
  const key = state && state in BOOST_LABEL ? state : "non_disponibile";
  const [label, sub] = BOOST_LABEL[key];
  if (key === "pronta") return armed ? { label: "Conferma?", sub: "tocca ancora", action: "go" } : { label, sub, action: "go" };
  if (key === "attiva") return armed ? { label: "Conferma?", sub: "annulla e spegni", action: "cancel" } : { label, sub, action: "cancel" };
  return { label, sub, action: "none" };
}
function etaText(minutes) {
  if (minutes === null) return "\u2013";
  return `${Math.round(minutes)} min`;
}
function pelletStatus(reserve, empty, open) {
  if (empty) return { key: "vuoto", label: "Vuoto" };
  if (reserve) return { key: "riserva", label: "In riserva" };
  if (open) return { key: "aperto", label: "Aperto" };
  if (reserve === null && empty === null && open === null) return { key: "nd", label: "\u2013" };
  return { key: "ok", label: "OK" };
}
var MIN_SHOWN_W = 5;
function pumpWatts(w2) {
  return w2 !== null && w2 >= MIN_SHOWN_W ? ` \xB7 ${Math.round(w2)} W` : "";
}
function integrationPumpPill(running, called, blockEnabled, blockWanted, watts) {
  if (blockEnabled === true && blockWanted === true && called === true) return { key: "blocked", label: "integrazione bloccata" };
  if (running === true) return { key: "running", label: `integrazione${pumpWatts(watts)}` };
  return { key: "idle", label: "integrazione" };
}
function stovePumpRunning(state) {
  if (state === void 0 || state === null) return null;
  const s4 = state.trim();
  if (s4 === "" || s4 === "unknown" || s4 === "unavailable") return null;
  return s4.toUpperCase() !== "OFF";
}
function collectorPumpPill(running, watts) {
  if (running === true) return { key: "running", label: `collettore${pumpWatts(watts)}` };
  return { key: "idle", label: "collettore" };
}
function panelModel(pumpOn, measured, estimated, maxPredicted, maxToday) {
  let value = null;
  let source = "nd";
  if (estimated !== null) {
    value = estimated;
    source = "stimata";
  } else if (pumpOn === true && measured !== null) {
    value = measured;
    source = "misurata";
  }
  const caption = source === "misurata" ? "misurata (ingresso)" : source === "stimata" ? pumpOn === true ? "stimata \xB7 in marcia" : pumpOn === false ? "stimata \xB7 pompa ferma" : "stimata" : "non disponibile";
  const pred = maxPredicted !== null && maxToday !== null ? Math.max(maxPredicted, maxToday) : maxPredicted;
  return { value, source, caption, maxPredicted: pred, maxToday };
}
function panelColor(t3) {
  if (t3 === null || Number.isNaN(t3)) return "#94a3b8";
  if (t3 <= 65) return tempColor(t3);
  const k2 = Math.min(1, (t3 - 65) / 35);
  const rgb = [239, 68, 68].map((c4, i5) => Math.round(c4 + ([127, 29, 29][i5] - c4) * k2));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}
var STUFA_LABEL = {
  spenta: "Spenta",
  accensione: "Accensione",
  accesa: "In funzione",
  spegnimento: "Spegnimento",
  non_disponibile: "Non disponibile"
};
var STUFA_MODE_LABEL = {
  programma: "Programma attivo",
  manuale: "Manuale",
  fuori_programma: "Fuori programma",
  timer: "Timer"
};
function stufaKey(raw) {
  return raw === "spenta" || raw === "accensione" || raw === "accesa" || raw === "spegnimento" ? raw : "non_disponibile";
}
function stufaButton(switchOn, armed) {
  if (switchOn === null) return { label: "Interruttore non disponibile", sub: "", action: "none" };
  if (switchOn) return armed ? { label: "Conferma?", sub: "tocca ancora per spegnere", action: "off" } : { label: "Spegni la stufa", sub: "interruttore acceso", action: "off" };
  return armed ? { label: "Conferma?", sub: "tocca ancora per accendere", action: "on" } : { label: "Accendi la stufa", sub: "interruttore spento", action: "on" };
}
function sinceText(ms) {
  if (ms === null || !Number.isFinite(ms) || ms < 0) return "";
  const min = Math.floor(ms / 6e4);
  if (min < 1) return "da meno di 1 min";
  if (min < 60) return `da ${min} min`;
  const h3 = Math.floor(min / 60);
  if (h3 < 24) return `da ${h3} h ${String(min % 60).padStart(2, "0")} min`;
  const d3 = Math.floor(h3 / 24);
  return `da ${d3} ${d3 === 1 ? "giorno" : "giorni"}`;
}

// src/summary-logic.ts
var RESTART_BELOW_SETPOINT = 4;
var OFF_STATES = ["OFF", "SPENTO", "STOP", "ARRESTO", "UNKNOWN", "UNAVAILABLE", ""];
function stoveLine(i5) {
  const raw = (i5.stoveState ?? "").trim().toUpperCase();
  const look = stoveLook(i5.stoveState);
  if (raw === "UNAVAILABLE" || raw === "UNKNOWN" || raw === "") {
    return {
      icon: "mdi:lan-disconnect",
      text: i5.pufferEstimated ? "Caldaia non raggiungibile: per il puffer uso la stima dalla sonda." : "Caldaia non raggiungibile.",
      tone: "warn"
    };
  }
  if (raw === "ECO STOP") {
    const dove = i5.setBoiler !== null ? ` Riparte quando ${i5.cless ? "la sonda S. BOILER dell'accumulo" : "il puffer"} scende a circa ${fmt3(i5.setBoiler - RESTART_BELOW_SETPOINT)} \xB0C${i5.puffer !== null ? ` (ora ${fmt3(i5.puffer)} \xB0C)` : ""}.` : "";
    return { icon: "mdi:pause-circle-outline", text: `Caldaia ferma in ECO STOP: l'acqua ha raggiunto la temperatura.${dove}`, tone: "info" };
  }
  if (look === "work")
    return {
      icon: "mdi:fire",
      text: `Caldaia in lavoro${i5.power !== null ? ` al ${fmt3(i5.power)} %` : ""}${i5.setWater !== null ? `: scalda l'acqua fino a ${fmt3(i5.setWater)} \xB0C, poi va in ECO STOP` : ""}.`,
      tone: "ok"
    };
  if (look === "start" || look === "wait")
    return { icon: "mdi:fire-circle", text: "Caldaia in accensione: servono circa 15 minuti prima che scaldi.", tone: "info" };
  if (look === "standby") return { icon: "mdi:sleep", text: "Caldaia in stand-by: aspetta una richiesta di calore.", tone: "info" };
  if (raw === "STOP" || look === "stopping")
    return { icon: "mdi:fire-off", text: "Caldaia in spegnimento.", tone: "info" };
  return { icon: "mdi:fire-off", text: "Caldaia spenta.", tone: "info" };
}
function whyOffLine(i5) {
  const raw = (i5.stoveState ?? "").trim().toUpperCase();
  if (!OFF_STATES.includes(raw) || raw === "UNAVAILABLE" || raw === "UNKNOWN" || raw === "") return null;
  if (i5.awayFlag) return { icon: "mdi:home-off", text: "\xC8 spenta perch\xE9 nessuno era in casa: riparte al rientro se c'\xE8 un programma attivo.", tone: "info" };
  if (i5.guardFlag)
    return { icon: "mdi:shield-check", text: "Ho annullato una partenza inutile: il boiler aveva gi\xE0 abbastanza docce e il termostato non chiedeva calore.", tone: "info" };
  if (i5.boostActive) return null;
  if (i5.cless && i5.cronoOn === false)
    return { icon: "mdi:fire-alert", text: "Caldaia spenta: con il CLESS dovrebbe restare sempre accesa per produrre l'acqua calda.", tone: "warn" };
  if (i5.cronoOn === false)
    return { icon: "mdi:palm-tree", text: "Cronotermostato disattivato (vacanza): non parte da sola.", tone: "info" };
  if (i5.cronoOn && i5.programActive === false)
    return { icon: "mdi:calendar-clock", text: "Fuori dalle fasce del cronotermostato: riparte al prossimo programma.", tone: "info" };
  if (i5.cronoOn && i5.programActive)
    return { icon: "mdi:calendar-check", text: "C'\xE8 un programma attivo: la caldaia dovrebbe partire da sola.", tone: "info" };
  return null;
}
function pumpLine(i5) {
  if (i5.cless) return null;
  const p3 = i5.puffer !== null ? `${fmt3(i5.puffer)} \xB0C` : "\u2013";
  const b3 = i5.boilerTop !== null ? `${fmt3(i5.boilerTop)} \xB0C` : "\u2013";
  if (i5.integrationPump === "running")
    return { icon: "mdi:pump", text: `Pompa di integrazione accesa: porta il calore del puffer (${p3}) al boiler (${b3}).`, tone: "ok" };
  if (i5.integrationPump === "blocked")
    return { icon: "mdi:pump-off", text: `Pompa di integrazione ferma: il puffer (${p3}) non \xE8 abbastanza pi\xF9 caldo del boiler (${b3}).`, tone: "info" };
  return null;
}
function solarLine(i5) {
  if (i5.collectorPumpOn === true)
    return {
      icon: "mdi:solar-power",
      text: `Il solare sta scaldando ${i5.cless ? "l'accumulo" : "il boiler"}${i5.collector !== null ? ` (collettore a ${fmt3(i5.collector)} \xB0C)` : ""}.`,
      tone: "ok"
    };
  if (i5.collectorPumpOn === false && i5.collector !== null)
    return { icon: "mdi:weather-sunny-off", text: `Il solare \xE8 fermo (collettore a ${fmt3(i5.collector)} \xB0C).`, tone: "info" };
  return null;
}
function sunLine(i5) {
  if (i5.sunElevation !== null && i5.sunElevation > 0 && i5.sunAboveHorizon === false) {
    const h3 = i5.horizonElev !== null ? ` (da quella parte il terreno arriva a ${fmt3(i5.horizonElev)}\xB0)` : "";
    return { icon: "mdi:image-filter-hdr", text: `Il sole \xE8 dietro le colline${h3}: niente luce diretta sul collettore.`, tone: "info" };
  }
  if (i5.allskyOk !== true || i5.sunFree === null || i5.allskyCloud === null) return null;
  const c4 = `${fmt3(i5.allskyCloud)} %`;
  if (i5.sunFree && i5.allskyCloud >= 50)
    return {
      icon: "mdi:weather-partly-cloudy",
      text: `Cielo molto nuvoloso (${c4}) ma il sole \xE8 libero: il collettore lavora con luce diretta. La temperatura esterna pu\xF2 calare lo stesso.`,
      tone: "ok"
    };
  if (i5.sunFree) return { icon: "mdi:white-balance-sunny", text: `Il sole \xE8 libero (nuvolosit\xE0 ${c4}).`, tone: "ok" };
  if (i5.allskyCloud < 30)
    return { icon: "mdi:weather-sunny-off", text: `Poche nuvole (${c4}), ma una copre il sole: il collettore rende meno.`, tone: "warn" };
  return { icon: "mdi:weather-cloudy", text: `Il sole \xE8 coperto (nuvolosit\xE0 ${c4}): il collettore riceve solo luce diffusa.`, tone: "info" };
}
function awayLine(i5) {
  if (i5.guests) return { icon: "mdi:account-multiple", text: "Modalit\xE0 ospiti: la caldaia non si spegne per assenza.", tone: "info" };
  if (i5.nobodyHome !== true) return null;
  const min = i5.nobodyHomeMinutes !== null ? Math.round(i5.nobodyHomeMinutes) : null;
  const da = min !== null ? ` da ${min} min` : "";
  if (i5.awayEnabled === false) return { icon: "mdi:home-off", text: `Nessuno in casa${da} (lo spegnimento per assenza \xE8 disattivato).`, tone: "info" };
  const raw = (i5.stoveState ?? "").trim().toUpperCase();
  const accesa = !OFF_STATES.includes(raw);
  if (accesa && min !== null && i5.awayMinutes !== null) {
    const left = Math.max(0, Math.round(i5.awayMinutes - min));
    return {
      icon: "mdi:home-off",
      text: left > 0 ? `Nessuno in casa${da}: la caldaia si spegne tra circa ${left} min.` : `Nessuno in casa${da}: sto per spegnere la caldaia.`,
      tone: "warn"
    };
  }
  return { icon: "mdi:home-off", text: `Nessuno in casa${da}.`, tone: "info" };
}
function summarize2(i5) {
  const lines = [];
  const alarm = (i5.alarm ?? "").trim();
  if (alarm) lines.push({ icon: "mdi:alert-octagon", text: `Allarme della caldaia: ${alarm}.`, tone: "bad" });
  if (i5.pelletEmpty) lines.push({ icon: "mdi:grain", text: "Pellet esaurito: ricarica il serbatoio.", tone: "bad" });
  else if (i5.pelletReserve) lines.push({ icon: "mdi:grain", text: "Il pellet sta per finire.", tone: "warn" });
  lines.push(stoveLine(i5));
  for (const l3 of [whyOffLine(i5), pumpLine(i5), solarLine(i5), sunLine(i5), awayLine(i5)]) if (l3) lines.push(l3);
  if (i5.etaMinutes !== null) {
    lines.push(
      i5.etaMinutes > 0 ? { icon: "mdi:water-boiler", text: `L'acqua calda sar\xE0 pronta tra circa ${fmt3(i5.etaMinutes)} min.`, tone: "info" } : { icon: "mdi:water-boiler", text: "L'acqua calda \xE8 gi\xE0 a temperatura d'uso.", tone: "ok" }
    );
  }
  return lines;
}

// src/cless-render.ts
var CLESS_RENDER = "data:image/jpeg;base64,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";
var CLESS_MASK = "data:image/jpeg;base64,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pc04SyKMB2A+tSRXlzC26KeRT6hqm/tbUP8An7m/76NXrfxZrdvGI4r+YKO26pk8a6+rBhqE3H+1WunxS8SqoX7WeKX/AIWp4m/5+qvWfxh8QQMDI6yADoavf8Lt1r/nlHR/wu3Wv+eUdH/C7da/55R05PjbrIYFoUIzzWknxzuARuswR3qx/wAL2/6cf1pf+F7f9OP60f8AC9v+nH9ahufjpK0eIbMBs9TVW++ON+6oLW2VSB82apf8Lt1r/nlHUc/xp1ySJkVEUkdR2rIPxU8TE/8AH1Sf8LU8Tf8AP1UN38TPEl1CY2vGUHuKzP8AhM9f/wCgjN/31Ve+17VLkrJLfyuxH948VUOq35GDdy4/3jVYzyk5Mj5+tN3vnO459c0hJJyTmkoooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooor/2Q==";

// src/plant-card.ts
var CARD_TAG2 = "impianto-overview-card";
var DEFAULT_ENTITIES = {
  boiler_top: "sensor.boiler_solare_alto_stimato",
  boiler_bottom: "sensor.boiler_solare_basso_stimato",
  solar_power: "sensor.solare_termico_potenza",
  cless_mode: "input_boolean.impianto_modo_cless",
  collector_temp: "sensor.solare_termico_t_collettore_stimata",
  puffer: "sensor.casale_temperatura_boiler",
  stove_state: "sensor.casale_stato",
  stove_water: "sensor.casale_temperatura_acqua",
  smoke: "sensor.casale_temperatura_fumi",
  flame: "sensor.casale_temperatura_fiamma",
  power: "sensor.casale_potenza_reale",
  water_pressure: "sensor.casale_pressione_acqua",
  brazier_pressure: "sensor.casale_pressione_braciere",
  extractor: "sensor.casale_estrattore_fumi",
  pump: "sensor.casale_pompa_acqua",
  alarm: "sensor.casale_allarme",
  set_boiler: "number.casale_setpoint_boiler",
  set_water: "climate.casale_acqua",
  starts_today: "sensor.caldaia_accensioni_oggi",
  starts_yesterday: "sensor.caldaia_accensioni_ieri",
  standby_today: "sensor.caldaia_stand_by_oggi",
  work_hours_today: "sensor.caldaia_ore_in_lavoro_oggi",
  request_acs: "binary_sensor.caldaia_richiesta_acs",
  request_heating: "binary_sensor.caldaia_richiesta_riscaldamento",
  consent: "binary_sensor.caldaia_consenso_suggerito",
  eta: "sensor.caldaia_acqua_pronta_tra",
  boost_state: "sensor.caldaia_accensione_rapida_stato",
  boost_start_script: "script.caldaia_accensione_rapida",
  boost_cancel_script: "script.caldaia_accensione_rapida_annulla",
  guard: "input_boolean.caldaia_salvaguardia_attiva",
  guard_flag: "input_boolean.caldaia_salvaguardia_ha_spento",
  pellet_reserve: "binary_sensor.casale_riserva_legna",
  pellet_empty: "binary_sensor.casale_pellet_empty",
  pellet_open: "binary_sensor.casale_pellet_hopper_open",
  integration_pump: "binary_sensor.caldaia_pompa_integrazione_attiva",
  collector_pump: "binary_sensor.caldaia_pompa_collettore_attiva",
  integration_power: "sensor.garage_bs_pompa_integrazione_potenza",
  integration_call: "binary_sensor.garage_bs_pompa_integrazione_ingresso_0",
  integration_block_enabled: "input_boolean.caldaia_integrazione_blocco_attivo",
  integration_block_wanted: "binary_sensor.caldaia_integrazione_inutile",
  collector_power: "sensor.garage_centralina_solare_pompe_potenza",
  pellet_today: "sensor.caldaia_pellet_oggi",
  pellet_week: "sensor.caldaia_pellet_settimana",
  pellet_month: "sensor.caldaia_pellet_mese",
  pellet_total: "sensor.caldaia_pellet_stimato_totale",
  pellet_ref_kg: "input_number.caldaia_pellet_kg_riferimento",
  pellet_ref_total: "input_number.caldaia_pellet_totale_riferimento",
  pellet_bag: "input_number.caldaia_pellet_sacco_kg",
  coil_solar_in: "sensor.solare_termico_solare_serpentina_ingresso",
  coil_solar_out: "sensor.solare_termico_solare_serpentina_uscita",
  coil_integ_in: "sensor.locale_caldaia_solare_termico_puffer_generatore",
  coil_integ_out: "sensor.locale_caldaia_solare_termico_puffer_minima_riscaldamento",
  panel_max: "sensor.solare_pannello_massima_prevista",
  panel_max_today: "sensor.solare_pannello_massima_oggi",
  puffer_effective: "sensor.puffer_temperatura_effettiva",
  thermo_mode: "sensor.termostato_riscaldamento_modalita",
  heat_call: "binary_sensor.termostato_riscaldamento_sta_scaldando",
  gti_station: "sensor.solare_termico_irraggiamento_sul_piano",
  gti_forecast: "sensor.open_meteo_irraggiamento_previsto_sul_piano",
  gti_satellite: "sensor.open_meteo_irraggiamento_osservato_dal_satellite",
  cloud_forecast: "sensor.open_meteo_nuvolosita",
  irr_station_raw: "sensor.esterno_e_garage_stazione_meteo_sqm_irraggiamento_solare_stimato",
  irr_station_corrected: "sensor.irraggiamento_stazione_corretto",
  allsky_irradiance: "sensor.allsky_irraggiamento_stimato",
  allsky_cloud: "sensor.allsky_copertura_equivalente",
  allsky_sun_free: "binary_sensor.allsky_sole_libero",
  allsky_analysis: "sensor.allsky_analisi",
  sun_above_horizon: "binary_sensor.sole_sopra_l_orizzonte",
  horizon_elevation: "sensor.sole_elevazione_orizzonte",
  sun: "sun.sun",
  crono_master: "switch.casale_cronotermostato_settimanale",
  program_active: "binary_sensor.caldaia_programma_attivo_ora",
  away: "binary_sensor.caldaia_nessuno_in_casa",
  away_enabled: "input_boolean.caldaia_assenza_attiva",
  away_flag: "input_boolean.caldaia_assenza_ha_spento",
  away_guests: "input_boolean.caldaia_assenza_ospiti",
  away_minutes: "input_number.caldaia_assenza_minuti"
};
var DEFAULT_MODEL_ENTITIES = {
  volume: "input_number.boiler_solare_volume",
  top_share: "input_number.boiler_solare_peso_alto",
  mains_temp: "input_number.boiler_solare_t_rete",
  zone_min: "input_number.boiler_solare_t_minima_zona"
};
var FLAME_PATH = "M0,-100 C10,-70 45,-50 45,-15 C45,12 25,25 0,25 C-25,25 -45,12 -45,-15 C-45,-32 -35,-45 -25,-58 C-22,-40 -12,-32 -6,-34 C-14,-60 -8,-82 0,-100 Z";
var COIL_INTEGRATION = "M238 200 H398 M398 200 q14 12 0 24 H238 q-14 12 0 24 H398 q14 12 0 24 H238";
var COIL_SOLAR = "M238 560 H398 M398 560 q14 12 0 24 H238 q-14 12 0 24 H398 q14 12 0 24 H238 q-14 12 0 24 H398";
var COIL_INTEGRATION_SHORT = "M238 200 H398 M398 200 q14 12 0 24 H238";
var COIL_SOLAR_SHORT = "M238 512 H398 M398 512 q14 12 0 24 H238";
var SHORT_D1 = 48;
var SHORT_D2 = 72;
var HOPPER_FILL = {
  ok: "#15803d",
  riserva: "#d97706",
  vuoto: "#dc2626",
  aperto: "#2563eb",
  nd: "#475569"
};
var LOOK_LABEL = {
  off: "spenta",
  wait: "in attesa",
  start: "accensione",
  work: "in lavoro",
  standby: "stand-by",
  stopping: "spegnimento"
};
var ImpiantoOverviewCard = class extends i4 {
  constructor() {
    super(...arguments);
    this._narrow = false;
    this._wide = false;
    this._stufaCardKey = "";
    this._fit = 1;
    this._fitTargets = [];
    this._sections = defaultSections();
    this._sectionsStored = null;
    this._sectionsLoading = false;
    this._stufa = null;
    this._stufaLoadedAt = 0;
    this._stufaLoading = false;
    this._thermoKey = "";
    this._roomsKey = "";
    this._waited = false;
    this._loadInfo = {};
    /**
     * Layout split a schede larghe: l'altezza della riga la decide la scheda della caldaia. La scheda completa della stufa, se e'
     * piu' alta, si rimpicciolisce in proporzione (non sotto il 60 %) invece di allungare la riga.
     */
    this._fitStufa = () => {
      const panel = this.renderRoot.querySelector(".stufapanel.fit");
      const box = panel?.querySelector(".stufafull");
      const card = this._stufaCard;
      if (!panel || !box || !card) return;
      const avail = panel.clientHeight;
      const pad = card.shadowRoot?.querySelector(".pad");
      const natural = pad ? pad.scrollHeight : card.offsetHeight;
      if (!avail || !natural) return;
      const fit = Math.max(0.6, Math.min(1, avail / natural));
      if (Math.abs(fit - this._fit) > 5e-3) {
        this._fit = fit;
        box.style.setProperty("--fit", String(fit));
      }
    };
  }
  connectedCallback() {
    super.connectedCallback();
    this._ro = new ResizeObserver((entries) => {
      const w2 = entries[0]?.contentRect.width ?? 1e3;
      const narrow = w2 < 560;
      if (narrow !== this._narrow) this._narrow = narrow;
      const wide = w2 >= 1150;
      if (wide !== this._wide) this._wide = wide;
    });
    this._ro.observe(this);
    this._waitTimer = window.setTimeout(() => this._waited = true, 4e3);
    this._importTimer = window.setTimeout(() => void this._loadLinkedCards(), 1500);
    void customElements.whenDefined("termostato-card").then(() => this.requestUpdate());
    void customElements.whenDefined("stufa-pellet-card").then(() => this.requestUpdate());
  }
  /** Apre la finestra delle preferenze (si aggiunge alla pagina, non sta dentro la scheda). */
  _openSettings() {
    if (this._dialog) return;
    const d3 = document.createElement("impianto-settings-dialog");
    d3.hass = this.hass;
    d3.sections = this._effectiveSections();
    d3.available = this._availableSections();
    d3.addEventListener("sections-toggle", (ev) => this._toggleSectionKey(ev.detail));
    d3.addEventListener("closed", () => {
      this._dialog = void 0;
    });
    document.body.appendChild(d3);
    this._dialog = d3;
  }
  /** Le sezioni che questa scheda puo' mostrare (la stufa e il termostato dipendono dalla configurazione). */
  _availableSections() {
    return SECTION_KEYS.filter((k2) => k2 === "stufa" ? !!this._config.stufa : k2 === "termostato" ? this._config.thermostat !== false : true);
  }
  /** Scelta dell'utente limitata alle sezioni disponibili; ne resta sempre almeno una. */
  _effectiveSections() {
    const av = this._availableSections();
    const eff = { ...this._sections };
    for (const k2 of SECTION_KEYS) if (!av.includes(k2)) eff[k2] = false;
    if (!visibleKeys(eff).length) eff.boiler = true;
    return eff;
  }
  _toggleSectionKey(key) {
    const next = toggleSection(this._effectiveSections(), key);
    this._sections = { ...this._sections, [key]: next[key] };
    if (this._dialog) {
      this._dialog.sections = this._effectiveSections();
      this._dialog.available = this._availableSections();
    }
    void this._saveSections();
  }
  _wsCall(msg) {
    const cw = this.hass.callWS;
    return cw ? cw.call(this.hass, msg) : Promise.reject(new Error("callWS non disponibile"));
  }
  /** Legge una volta la scelta salvata dall'utente in Home Assistant. */
  async _loadSections() {
    this._sectionsLoading = true;
    try {
      const r6 = await this._wsCall({ type: "frontend/get_user_data", key: SECTIONS_USER_KEY });
      this._sectionsStored = r6?.value ?? null;
      this._sections = normalizeSections(this._sectionsStored, this._config.show);
    } catch {
    }
  }
  async _saveSections() {
    const value = sectionsToStore(this._sections);
    this._sectionsStored = value;
    try {
      await this._wsCall({ type: "frontend/set_user_data", key: SECTIONS_USER_KEY, value });
    } catch {
    }
  }
  updated(changed) {
    if (this.hass && this._config && !this._sectionsLoading) void this._loadSections();
    if (changed.has("hass") && this._dialog) this._dialog.hass = this.hass;
    if (changed.has("hass") && this._info) this._info.lines = this._summaryLines();
    if (changed.has("hass") && this._charts) this._charts.hass = this.hass;
    if (changed.has("hass") && this._details) this._details.groups = this._detailGroups();
    if (changed.has("hass") && this._thermo) this._thermo.hass = this.hass;
    if (changed.has("hass") && this._roomsEl) this._roomsEl.hass = this.hass;
    if (changed.has("hass") && this._stufaDlg) this._stufaDlg.hass = this.hass;
    if (changed.has("hass") && this._scheduleDlg) this._scheduleDlg.hass = this.hass;
    if (changed.has("hass") && this._pelletDlg) this._pelletDlg.info = this._pelletInfo();
    if (changed.has("hass") && this._pelletChartsDlg) {
      this._pelletChartsDlg.hass = this.hass;
      this._pelletChartsDlg.perDay = this._pelletPerDay();
    }
    if (this._config?.layout === "split") this._observeFit();
    if (this._config?.stufa && this._sections.stufa && this.hass && !this._stufaLoading && Date.now() - this._stufaLoadedAt > 5 * 6e4) void this._loadStufa();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._waitTimer) window.clearTimeout(this._waitTimer);
    if (this._importTimer) window.clearTimeout(this._importTimer);
    this._dialog?.remove();
    this._dialog = void 0;
    this._info?.remove();
    this._info = void 0;
    this._charts?.remove();
    this._charts = void 0;
    this._details?.remove();
    this._details = void 0;
    this._stufaDlg?.remove();
    this._stufaDlg = void 0;
    this._scheduleDlg?.remove();
    this._scheduleDlg = void 0;
    this._pelletDlg?.remove();
    this._pelletChartsDlg?.remove();
    this._pelletChartsDlg = void 0;
    this._pelletDlg = void 0;
    this._fitRO?.disconnect();
    this._fitTargets = [];
    this._confirm?.remove();
    this._confirm = void 0;
    this._ro?.disconnect();
  }
  /** Finestra di conferma: il comando parte solo se la si conferma (un tocco inavvertito non accende niente). */
  _ask(heading, lines, confirmLabel, danger, onYes) {
    if (this._confirm) return;
    const d3 = document.createElement("impianto-confirm-dialog");
    d3.heading = heading;
    d3.lines = lines;
    d3.confirmLabel = confirmLabel;
    d3.danger = danger;
    d3.addEventListener("confirmed", onYes);
    d3.addEventListener("closed", () => {
      this._confirm = void 0;
    });
    document.body.appendChild(d3);
    this._confirm = d3;
  }
  /** Accensione rapida (o suo annullamento): chiede conferma in una finestra. */
  _press() {
    const model = boostButton(this._s(this._e.boost_state), false);
    if (model.action === "none") return;
    const script = model.action === "go" ? this._e.boost_start_script : this._e.boost_cancel_script;
    const run = () => void this.hass.callService("script", "turn_on", { entity_id: script });
    if (model.action === "go") {
      const eta = this.hass.states[this._e.eta] ? this._n(this._e.eta) : null;
      const lines = ["La caldaia si accende subito, anche fuori programma, e si spegne da sola quando l'acqua \xE8 calda."];
      if (eta !== null && eta > 0) lines.push(`Acqua calda stimata tra circa ${etaText(eta)}.`);
      this._ask("Avviare la caldaia?", lines, "Avvia", false, run);
    } else {
      this._ask("Spegnere la caldaia?", ["Annulla l'accensione rapida e spegne la caldaia."], "Spegni", true, run);
    }
  }
  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("impianto-overview-card: configurazione non valida");
    this._config = config;
    this._sections = normalizeSections(this._sectionsStored, config.show);
  }
  getCardSize() {
    return 12;
  }
  static getStubConfig() {
    return { type: `custom:${CARD_TAG2}` };
  }
  // ---- lettura -------------------------------------------------------------
  get _e() {
    return { ...DEFAULT_ENTITIES, ...this._config.entities ?? {} };
  }
  _s(id) {
    return id ? this.hass.states[id]?.state : void 0;
  }
  _n(id) {
    if (!id) return null;
    const st = this.hass.states[id];
    if (!st) return null;
    if (id.startsWith("climate.")) return toNumber(String(st.attributes.temperature ?? ""));
    return toNumber(st.state);
  }
  _val(v2, fallbackEntity) {
    if (typeof v2 === "number") return v2;
    if (typeof v2 === "string") return this._n(v2);
    return fallbackEntity ? this._n(fallbackEntity) : null;
  }
  _model() {
    const m2 = this._config.model ?? {};
    const vol = this._val(m2.volume, DEFAULT_MODEL_ENTITIES.volume);
    let share = this._val(m2.top_share, DEFAULT_MODEL_ENTITIES.top_share);
    if (share !== null && share > 1) share = share / 100;
    return {
      volume: vol ?? DEFAULT_MODEL.volume,
      topShare: share ?? DEFAULT_MODEL.topShare,
      mainsTemp: this._val(m2.mains_temp, DEFAULT_MODEL_ENTITIES.mains_temp) ?? DEFAULT_MODEL.mainsTemp,
      showerVolume: this._val(m2.shower_volume) ?? DEFAULT_MODEL.showerVolume,
      showerTemp: this._val(m2.shower_temp) ?? DEFAULT_MODEL.showerTemp,
      // col CLESS le docce si contano sopra la temperatura minima della zona (la serpentina non scende sotto)
      coilMin: this._cless() ? this._val(void 0, DEFAULT_MODEL_ENTITIES.zone_min) ?? 47 : null
    };
  }
  _yes(id) {
    const s4 = this._s(id);
    return s4 === "on" ? true : s4 === "off" ? false : null;
  }
  // ---- boiler solare + puffer (SVG) ---------------------------------------
  _renderBoiler() {
    const e5 = this._e;
    const cless = this._cless();
    const m2 = this._model();
    const top = this._n(e5.boiler_top);
    const bottom = this._n(e5.boiler_bottom);
    const outlet = this._n(e5.outlet) ?? top;
    const showers = showersEstimate(top, bottom, m2);
    const pufferId = this.hass.states[e5.puffer_effective] ? e5.puffer_effective : e5.puffer;
    const puffer = this._n(pufferId);
    const pufferEstimated = this.hass.states[pufferId]?.attributes?.fonte === "sonda pozzetto";
    const solarKw = this._n(e5.solar_power);
    const collector = this._n(e5.collector_temp);
    const cTop = tempColor(top);
    const cBot = tempColor(bottom);
    const cMid = tempColor(top !== null && bottom !== null ? m2.topShare * top + (1 - m2.topShare) * bottom : top ?? bottom);
    const cPuf = tempColor(puffer);
    const midAt = `${Math.round(m2.topShare * 100)}%`;
    const eta = this._n(e5.eta);
    const integrationPill = integrationPumpPill(
      this._yes(e5.integration_pump),
      this._yes(e5.integration_call),
      this._yes(e5.integration_block_enabled),
      this._yes(e5.integration_block_wanted),
      this._n(e5.integration_power)
    );
    const collectorPill = collectorPumpPill(this._yes(e5.collector_pump), this._n(e5.collector_power));
    const pumpOn = integrationPill.key === "running";
    const collectorOn = collectorPill.key === "running";
    const panel = panelModel(
      this._yes(e5.collector_pump),
      this._n(e5.coil_solar_in),
      collector,
      this._n(e5.panel_max),
      this._n(e5.panel_max_today)
    );
    const panelFill = panelColor(panel.value);
    const solarIn = this._n(e5.coil_solar_in);
    const solarOut = this._n(e5.coil_solar_out);
    const integIn = this._n(e5.coil_integ_in);
    const integOut = this._n(e5.coil_integ_out);
    const thermo = this.hass.states[e5.thermo_mode]?.attributes ?? {};
    const btn = boostButton(this._s(e5.boost_state), false);
    const btnH = cless ? 0 : btn.sub ? 78 : 64;
    const short = this._config.layout === "split" && this._config.boiler === "short" && this._wide && !this._narrow;
    const fs = this._config.layout === "split" && this._wide && !this._narrow ? 1.22 : 1;
    const d1 = short ? SHORT_D1 : 0;
    const d12 = short ? SHORT_D1 + SHORT_D2 : 0;
    const coilI = short ? COIL_INTEGRATION_SHORT : COIL_INTEGRATION;
    const coilS = short ? COIL_SOLAR_SHORT : COIL_SOLAR;
    const vh = cless ? 772 : 840;
    const viewBox = this._narrow ? `0 0 640 ${vh}` : `0 0 700 ${vh - d12}`;
    const s2y = cless ? 614 : short ? 536 : 640;
    const kwy = cless ? 530 : short ? 616 : 728;
    const panIn = short ? "M598 440 H520 V512 H440" : cless ? "M536 548 H456" : "M598 500 H520 V560 H440";
    const panOut = short ? "M440 536 H548 V492 H598" : cless ? "M456 636 H578 V614" : "M440 656 H548 V552 H598";
    return b2`
      <svg class=${this._narrow ? "boiler narrow" : "boiler"} viewBox=${viewBox} role="img" aria-label=${cless ? "Accumulo CLESS" : "Boiler solare"}>
        <defs>
          <linearGradient id="acqua" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color=${cTop} />
            <stop offset=${midAt} stop-color=${cMid} />
            <stop offset="1" stop-color=${cBot} />
          </linearGradient>
          <linearGradient id="puffer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color=${cPuf} />
            <stop offset="1" stop-color=${tempColor(puffer !== null ? puffer - 12 : null)} />
          </linearGradient>
          <linearGradient id="iso" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" style="stop-color:var(--divider-color)" />
            <stop offset="0.5" style="stop-color:var(--secondary-background-color)" />
            <stop offset="1" style="stop-color:var(--divider-color)" />
          </linearGradient>
          <linearGradient id="lucido" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#fff" stop-opacity="0.28" />
            <stop offset="0.35" stop-color="#fff" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- tubi -->
        <path d=${cless ? "M305 108 V50 H540" : "M420 135 H520 V95"} class="pipe hot" />
        <path d=${cless ? "M335 108 V72 H540" : `M420 ${745 - d12} H520 V${775 - d12}`} class="pipe cold" />
        ${cless ? A : w`<g class="pufgroup">
          <path d="M440 208 H575" class="pipe hot thin" />
          <path d="M440 ${short ? 236 : 268} H520 V315 H575" class="pipe warm thin" />
          <path d="M685 215 H700" class="pipe hot thin" />
          <path d="M685 300 H700" class="pipe warm thin" />
          <text x="452" y="198" class="tv">${integIn !== null ? `${fmt3(integIn, 1)} \xB0C` : ""}</text>
          <text x="452" y=${short ? 228 : 260} class="tv">${integOut !== null ? `${fmt3(integOut, 1)} \xB0C` : ""}</text>
        </g>`}

        <!-- boiler -->
        ${cless ? this._clessSection({
      cTop,
      cMid,
      cBot,
      solarOn: collectorOn,
      boilerOn: stovePumpRunning(this._s(e5.pump)) === true,
      heatingOn: this._yes(e5.heat_call) === true,
      minProbe: integOut,
      genProbe: integIn,
      boilerProbe: this._n(e5.puffer),
      threshold: toNumber(thermo.puffer_soglia),
      waiting: thermo.puffer_in_attesa === true,
      showers
    }) : w`
        <rect x="200" y="100" width="240" height=${660 - d12} rx="52" fill="url(#iso)" class="outline" />
        <rect x="222" y="122" width="196" height=${616 - d12} rx="38" fill="url(#acqua)" />
        <g class="coil">
          ${cless ? A : w`<path d=${coilI} stroke="#7c3aed" />`}
          <path d=${coilS} stroke="#15803d" />
        </g>
        ${pumpOn && !cless ? w`<path d=${coilI} class="coilflow" />` : A}
        ${collectorOn ? w`<path d=${coilS} class="coilflow" />` : A}
        <rect x="246" y="150" width="160" height="26" rx="13" class="pill" />
        <text x="326" y="168" class="s14 b" text-anchor="middle" fill=${cless ? "#fb923c" : "#a78bfa"}>${cless ? "Caldaia (ACS)" : "Integrazione (caldaia)"}</text>
        ${integrationPill.key === "idle" || cless ? A : w`<rect x="244" y=${284 - d1} width="164" height="22" rx="11" class="pill" /><circle cx="260" cy=${295 - d1} r="4.5" fill=${integrationPill.key === "blocked" ? "#f59e0b" : "#22c55e"} class=${integrationPill.key === "blocked" ? "" : "pulse"} /><text x="336" y=${299.5 - d1} class="s13 b" text-anchor="middle" fill=${integrationPill.key === "blocked" ? "#f59e0b" : "#22c55e"}>${integrationPill.label}</text>`}
        ${collectorOn ? w`<rect x="250" y=${676 - d12} width="152" height="22" rx="11" class="pill" /><circle cx="266" cy=${687 - d12} r="4.5" fill="#22c55e" class="pulse" /><text x="334" y=${691.5 - d12} class="s13 b" text-anchor="middle" fill="#22c55e">${collectorPill.label}</text>` : A}
        <rect x="266" y=${522 - d1} width="120" height="26" rx="13" class="pill" />
        <text x="326" y=${540 - d1} class="s14 b" text-anchor="middle" fill="#4ade80">Solare</text>
        <rect x="222" y="122" width="196" height=${616 - d12} rx="38" fill="url(#lucido)" />

        <!-- scheda centrale -->
        <rect x="236" y=${338 - d1} width="168" height="176" rx="22" class="pill big" />
        <text x="320" y=${372 - d1} class="t2 s14" text-anchor="middle">Uscita acqua calda</text>
        <text x="320" y=${434 - d1} class="t1 b" font-size="50" text-anchor="middle">${fmt3(outlet, 1)}<tspan font-size="24" dy="-16"> °C</tspan></text>
        <line x1="262" y1=${456 - d1} x2="378" y2=${456 - d1} class="sep" />
        <text x="320" y=${490 - d1} class="t1 b" font-size="22" text-anchor="middle">${showers === null ? "(\u2013)" : `(\u2248 ${showers} ${showers === 1 ? "doccia" : "docce"})`}</text>
        `}

        <!-- sonde -->
        <circle cx="222" cy="168" r="8" class="probe" />
        <line x1="214" y1="168" x2="150" y2="168" class="lead" />
        <rect x="14" y="132" width="136" height="72" rx="14" class="card hi" />
        <text x="82" y="154" class="t2" font-size=${Math.round(14 * fs)} text-anchor="middle">Alto (S3)</text>
        <text x="82" y="190" class="b" font-size=${Math.round(27 * fs)} text-anchor="middle" fill="#ef4444">${fmt3(top, 1)} °C</text>

        <circle cx="222" cy=${(cless ? 650 : 676) - d12} r="8" class="probe" />
        <line x1="214" y1=${(cless ? 650 : 676) - d12} x2="150" y2=${(cless ? 650 : 676) - d12} class="lead" />
        <rect x="14" y=${s2y} width="136" height="72" rx="14" class="card lo" />
        <text x="82" y=${s2y + 24} class="t2" font-size=${Math.round(14 * fs)} text-anchor="middle">Basso (S2)</text>
        <text x="82" y=${s2y + 58} class="b" font-size=${Math.round(27 * fs)} text-anchor="middle" fill="#3b82f6">${fmt3(bottom, 1)} °C</text>

        <!-- stima e pulsante -->
        ${cless ? w`<rect x="14" y="216" width="136" height="68" rx="14" class="card eta" />
        <text x="82" y="235" class="t2" font-size=${Math.round(13 * fs)} text-anchor="middle">Caldaia imposta a</text>
        <text x="82" y="264" class="t1 b" font-size=${Math.round(28 * fs)} text-anchor="middle">${this._n(e5.set_boiler) === null ? "\u2013" : `${fmt3(this._n(e5.set_boiler), 0)} \xB0C`}</text>
        <text x="82" y="278" class="t2" font-size="11" text-anchor="middle">sonda S. BOILER</text>
        ${this._config.summary === false ? A : w`<g class="btn info" role="button" tabindex="0" aria-label="Stato dell'impianto" @click=${() => this._openInfo()}
              @keydown=${(ev) => (ev.key === "Enter" || ev.key === " ") && this._openInfo()}>
              <rect x="14" y="292" width="66" height="44" rx="14" class="infobg" />
              <circle cx="28" cy="314" r="7" class="infoc" />
              <text x="28" y="317.5" class="b" font-size="10" text-anchor="middle">i</text>
              <text x="40" y="319" class="b" font-size="12">Stato</text>
            </g>`}
        ${this._config.charts === false ? A : w`<g class="btn info" role="button" tabindex="0" aria-label="Grafici" @click=${() => this._openCharts()}
              @keydown=${(ev) => (ev.key === "Enter" || ev.key === " ") && this._openCharts()}>
              <rect x="84" y="292" width="66" height="44" rx="14" class="infobg" />
              <polyline points="90,320 95,311 99,316 105,306" class="infoc" />
              <text x="108" y="319" class="b" font-size="11">Grafici</text>
            </g>`}` : w`        <rect x="14" y="224" width="136" height="104" rx="14" class="card eta" />
        <text x="82" y="248" class="t2" font-size=${Math.round(14 * fs)} text-anchor="middle">${cless ? "Caldaia imposta a" : "Acqua pronta in"}</text>
        <text x="82" y="292" class="t1 b" font-size=${Math.round(34 * fs)} text-anchor="middle">${cless ? this._n(e5.set_boiler) === null ? "\u2013" : `${fmt3(this._n(e5.set_boiler), 0)} \xB0C` : etaText(eta)}</text>
        <text x="82" y="314" class="t2" font-size=${Math.round(13 * fs)} text-anchor="middle">${cless ? "sonda S. BOILER" : eta === 0 ? "gi\xE0 a temperatura" : eta === null ? "" : "stima media"}</text>
        ${cless ? A : w`<g class=${btn.action === "none" ? "btn off" : "btn"} role="button" tabindex=${btn.action === "none" ? "-1" : "0"}
          aria-label=${btn.label} @click=${() => this._press()} @keydown=${(ev) => (ev.key === "Enter" || ev.key === " ") && this._press()}>
          <rect x="14" y="340" width="136" height="${btn.sub ? 78 : 64}" rx="14" class="btnbg" />
          <text x="82" y=${btn.sub ? 372 : 380} class="b" font-size=${Math.round(18 * fs)} text-anchor="middle">${btn.label}</text>
          ${btn.sub ? w`<text x="82" y="396" class="s13" text-anchor="middle" opacity="0.85">${btn.sub}</text>` : A}
        </g>`}
        ${this._config.summary === false ? A : w`<g class="btn info" role="button" tabindex="0" aria-label="Stato dell'impianto" @click=${() => this._openInfo()}
              @keydown=${(ev) => (ev.key === "Enter" || ev.key === " ") && this._openInfo()}>
              <rect x="14" y=${340 + btnH + 12} width="136" height="44" rx="14" class="infobg" />
              <circle cx="40" cy=${340 + btnH + 34} r="10" class="infoc" />
              <text x="40" y=${340 + btnH + 39} class="b" font-size=${Math.round(14 * fs)} text-anchor="middle">i</text>
              <text x="92" y=${340 + btnH + 40} class="b" font-size=${Math.round(17 * fs)} text-anchor="middle">Stato</text>
            </g>`}
        ${this._config.charts === false ? A : w`<g class="btn info" role="button" tabindex="0" aria-label="Grafici" @click=${() => this._openCharts()}
              @keydown=${(ev) => (ev.key === "Enter" || ev.key === " ") && this._openCharts()}>
              <rect x="14" y=${340 + btnH + 66} width="136" height="44" rx="14" class="infobg" />
              <polyline points="28,${340 + btnH + 98} 35,${340 + btnH + 88} 41,${340 + btnH + 94} 51,${340 + btnH + 80}" class="infoc" />
              <text x="102" y=${340 + btnH + 94} class="b" font-size=${Math.round(17 * fs)} text-anchor="middle">Grafici</text>
            </g>`}`}

        <!-- solare -->
        <rect x="14" y=${kwy} width="136" height="72" rx="14" class="card sun" />
        <text x="82" y=${kwy + 24} class="t2" font-size=${Math.round(14 * fs)} text-anchor="middle">Solare</text>
        <text x="82" y=${kwy + 58} class="b" font-size=${Math.round(24 * fs)} text-anchor="middle" fill="#22c55e">${fmt3(solarKw, 1)} kW</text>

        <text x=${cless ? 548 : 532} y=${cless ? 46 : 80} class="b s14" fill="#ef4444">Acqua calda</text>
        <text x=${cless ? 548 : 532} y=${cless ? 62 : 98} class="t2 s13">verso utenze</text>
        ${cless ? w`<text x="548" y="78" class="b s14" fill="#3b82f6">Acqua fredda</text><text x="548" y="94" class="t2 s13">dalla rete</text>` : A}
        ${cless ? A : w`<text x="532" y=${796 - d12} class="b s14" fill="#3b82f6">Acqua fredda</text>
        <text x="532" y=${814 - d12} class="t2 s13">dalla rete</text>`}

        ${cless ? A : w`<g class="pufgroup">${this._pufferShape(puffer, pufferEstimated)}</g>`}

        <!-- pannello solare e circuito del collettore -->
        <g class="pufgroup pannello">
          <path d=${panIn} class="pipe hot thin" />
          <path d=${panOut} class="pipe cold thin" />
          ${collectorOn ? w`<path d=${panIn} class="coilflow" /><path d=${panOut} class="coilflow" />` : A}
          <text x="462" y=${short ? 504 : cless ? 540 : 548} class="tv">${solarIn !== null ? `${fmt3(solarIn, 1)} \xB0C` : ""}</text>
          <text x="462" y=${short ? 528 : cless ? 656 : 644} class="tv">${solarOut !== null ? `${fmt3(solarOut, 1)} \xB0C` : ""}</text>
          <g transform=${short ? "translate(0 -60)" : "translate(0 0)"}>${this._panelShape(panel, panelFill, cless)}</g>
        </g>
      </svg>
      ${this._narrow ? w`<svg class="boiler mini" viewBox="0 0 640 330" role="img" aria-label="Puffer e pannello solare">
            ${cless ? A : w`<g transform="translate(-480 -140)">${this._pufferShape(puffer, pufferEstimated)}</g>
            <text x="150" y="236" class="tv">${integIn !== null ? `\u2192 ${fmt3(integIn, 1)} \xB0C` : ""}</text>
            <text x="150" y="266" class="tv">${integOut !== null ? `\u2190 ${fmt3(integOut, 1)} \xB0C` : ""}</text>`}
            <g transform="translate(-160 -420)">${this._panelShape(panel, panelFill)}</g>
            <text x="470" y="318" class="tv" text-anchor="middle">${solarIn !== null ? `\u2192 ${fmt3(solarIn, 1)} \xB0C` : ""}   ${solarOut !== null ? `\u2190 ${fmt3(solarOut, 1)} \xB0C` : ""}</text>
          </svg>` : A}
    `;
  }
  /**
   * Percorso lungo le spire della serpentina (elica vista di lato, coordinate del render): parte a destra in alto
   * e gira verso sinistra passando davanti, poi dietro. `front` = solo i tratti davanti, altrimenti solo quelli dietro.
   */
  _coilPath(cx, r6, ry, y0, pitch, turns, front) {
    const parts = [];
    const n5 = 24;
    for (let k2 = 0; k2 < turns; k2++) {
      for (let half = 0; half < 2; half++) {
        if (half === 0 !== front) continue;
        const pts = [];
        for (let i5 = 0; i5 <= n5; i5++) {
          const t3 = (k2 + (half * 0.5 + i5 / n5 * 0.5)) * 2 * Math.PI;
          const x2 = cx + r6 * Math.cos(t3);
          const y3 = y0 + t3 / (2 * Math.PI) * pitch + ry * Math.sin(t3);
          pts.push(`${i5 === 0 ? "M" : "L"}${x2.toFixed(1)} ${y3.toFixed(1)}`);
        }
        parts.push(pts.join(" "));
      }
    }
    return parts.join(" ");
  }
  /**
   * Il CLESS in sezione: un render fisso come sfondo e, sopra, un SVG che lo colora con le temperature delle sonde
   * e anima i flussi. Le coordinate del gruppo sono quelle del render (730 x 1710), poi ridotte nel disegno.
   */
  _clessSection(o6) {
    const water = "M195 112 H477 A95 95 0 0 1 572 207 V1395 A95 95 0 0 1 477 1490 H195 A95 95 0 0 1 100 1395 V207 A95 95 0 0 1 195 112 Z";
    const silhouette = "M25 110 Q25 20 130 20 H540 Q645 20 645 110 V1470 Q645 1495 600 1502 V1640 Q600 1662 560 1662 H110 Q70 1662 70 1640 V1502 Q25 1495 25 1470 Z";
    const stubs = "M640 146 h36 v46 h-36 Z M640 372 h36 v26 h-36 Z M640 590 h36 v45 h-36 Z M640 700 h36 v200 h-36 Z";
    const minTxt = o6.minProbe === null ? "\u2013" : `${fmt3(o6.minProbe, 1)} \xB0C`;
    const tooCold = o6.waiting || o6.threshold !== null && o6.minProbe !== null && o6.minProbe < o6.threshold;
    const tag = tooCold ? "#f59e0b" : "#22c55e";
    return w`
      <g transform="translate(190.3 100) scale(0.387)">
        <defs>
          <clipPath id="clessSil"><path d=${silhouette} /><path d=${stubs} /></clipPath>
          <clipPath id="clessWater"><path d=${water} /></clipPath>
          <clipPath id="clessSides"><rect x="100" y="1080" width="130" height="380" /><rect x="440" y="1080" width="132" height="380" /></clipPath>
          <mask id="clessMask" maskUnits="userSpaceOnUse" x="0" y="0" width="730" height="1710">
            <image href=${CLESS_MASK} x="0" y="0" width="730" height="1710" />
          </mask>
          <linearGradient id="clessTint" gradientUnits="userSpaceOnUse" x1="0" y1="112" x2="0" y2="1490">
            <stop offset="0" stop-color=${o6.cTop} />
            <stop offset="0.43" stop-color=${o6.cTop} />
            <stop offset="0.52" stop-color=${o6.cMid} />
            <stop offset="0.65" stop-color=${o6.cMid} />
            <stop offset="0.70" stop-color=${o6.cBot} />
            <stop offset="1" stop-color=${o6.cBot} />
          </linearGradient>
        </defs>
        <image href=${CLESS_RENDER} x="0" y="0" width="730" height="1710" clip-path="url(#clessSil)" />
        <rect x="100" y="112" width="472" height="1378" fill="url(#clessTint)" class="clesstint" clip-path="url(#clessWater)" mask="url(#clessMask)" />
        ${o6.solarOn ? w`<path d=${this._coilPath(335, 200, 35, 1150, 40, 6, true)} class="clessflow" />
              <path d=${this._coilPath(335, 200, 35, 1150, 40, 6, false)} class="clessflow" clip-path="url(#clessSides)" />` : A}
      </g>

      <!-- attacchi del solare: mandata dal pannello in alto sulla serpentina, ritorno in basso -->
      <rect x="436" y="542" width="20" height="12" rx="2" class="stub" />
      <rect x="436" y="630" width="20" height="12" rx="2" class="stub" />

      <!-- acqua sanitaria: i due tubi escono dalla flangia in alto -->
      <rect x="298" y="98" width="14" height="12" rx="2" class="stub" />
      <rect x="328" y="98" width="14" height="12" rx="2" class="stub" />

      <!-- attacchi della caldaia, a destra: mandata (entra) e ritorno (esce) -->
      <path d="M456 396 H500" class="pipe hot thin" />
      <path d="M456 426 H500" class="pipe cold thin" />
      <polygon points="486,389 470,396 486,403" fill="#ef4444" />
      <polygon points="470,419 486,426 470,433" fill="#3b82f6" />
      ${o6.boilerOn ? w`<path d="M456 396 H500" class="coilflow" /><path d="M456 426 H500" class="coilflow" />` : A}
      <text x="506" y="274" class="b" font-size="13" fill="#fb923c">Caldaia</text>
      <rect x="506" y="282" width="136" height="90" rx="14" class="card eta" />
      <text x="574" y="304" class="t2" font-size="13" text-anchor="middle">Puffer acqua calda</text>
      <text x="574" y="334" class="t1 b" font-size="27" text-anchor="middle">${o6.boilerProbe === null ? "\u2013" : `${fmt3(o6.boilerProbe, 1)} \xB0C`}</text>
      <text x="574" y="358" class="t1 b" font-size="14" text-anchor="middle">${o6.showers === null ? "(\u2013)" : `\u2248 ${o6.showers} ${o6.showers === 1 ? "doccia" : "docce"}`}</text>
      <text x="506" y="401" class="t1 b" font-size="17">${o6.minProbe === null ? "\u2013" : `${fmt3(o6.minProbe, 1)} \xB0C`}</text>
      <text x="506" y="431" class="t1 b" font-size="17">${o6.genProbe === null ? "\u2013" : `${fmt3(o6.genProbe, 1)} \xB0C`}</text>

      <!-- impianto di riscaldamento, a sinistra: la pompa spinge l'acqua nella mandata (esce), il ritorno entra -->
      <rect x="188" y="390" width="16" height="12" rx="2" class="stub" />
      <rect x="188" y="420" width="16" height="12" rx="2" class="stub" />
      <path d="M188 396 H64" class="pipe hot thin" />
      <path d="M64 426 H188" class="pipe cold thin" />
      ${o6.heatingOn ? w`<path d="M188 396 H64" class="coilflow" /><path d="M64 426 H188" class="coilflow" />` : A}
      <polygon points="112,389 96,396 112,403" fill="#ef4444" />
      <polygon points="104,419 120,426 104,433" fill="#3b82f6" />
      ${this._pumpIcon(152, 396, 11, o6.heatingOn)}
      <g class="radiator">
        <rect x="22" y="380" width="42" height="62" rx="7" class="radbody" />
        ${[32, 41, 50, 59].map((x2) => w`<line x1=${x2} y1="386" x2=${x2} y2="436" class="radfin" />`)}
      </g>
      <text x="43" y="372" class="t2" font-size="11" text-anchor="middle">Impianto</text>
      <text x="14" y="462" class="t2" font-size="11">Minima (b): ${minTxt}</text>
      <text x="14" y="477" class="b" font-size="12" fill=${tag}>${o6.threshold === null ? "blocco riscaldamento spento" : o6.waiting ? `attende ${fmt3(o6.threshold, 0)} \xB0C` : `parte sopra ${fmt3(o6.threshold, 0)} \xB0C`}</text>
    `;
  }
  /** Modo CLESS acceso: accumulo al posto del boiler solare e del puffer, senza pompa di integrazione ne' pulsante di accensione rapida. */
  _cless() {
    return this._yes(this._e.cless_mode) === true;
  }
  /** Il puffer da 50 litri, con le coordinate del disegno largo (al centro x = 630). */
  _pufferShape(puffer, estimated = false) {
    return w`
      <text x="630" y="158" class="t1 b s15" text-anchor="middle">Puffer 50 L</text>
      <rect x="575" y="170" width="110" height="170" rx="26" fill="url(#puffer)" class="outline" />
      <rect x="587" y="224" width="86" height="64" rx="14" class="pill big" />
      <text x="630" y="${estimated ? 258 : 264}" class="t1 b val" text-anchor="middle">${fmt3(puffer, 0)} °C</text>
      ${estimated ? w`<text x="630" y="279" class="t2 s13" text-anchor="middle">stima sonda</text>` : A}`;
  }
  /** La sagoma del pannello con i suoi testi, con le coordinate del disegno largo (al centro x = 630). */
  /** `near`: il pannello accanto al puffer (CLESS), con le scritte sotto il ritorno del collettore. */
  _panelShape(panel, fill, near = false) {
    const body = w`
      <text x="630" y="440" class="t1 b s16" text-anchor="middle">Pannello solare</text>
      <polygon points="616,462 692,462 676,568 592,568" fill=${fill} class="outline panelbody" />
      <g class="panelgrid">
        <line x1="641" y1="462" x2="634" y2="568" /><line x1="667" y1="462" x2="655" y2="568" />
        <line x1="604" y1="515" x2="684" y2="515" /><line x1="610" y1="541" x2="680" y2="541" /><line x1="610" y1="489" x2="688" y2="489" />
      </g>
      <polygon points="616,462 640,462 612,568 592,568" fill="#fff" opacity="0.16" />
      <line x1="618" y1="568" x2="612" y2="586" class="panelleg" /><line x1="666" y1="568" x2="672" y2="586" class="panelleg" />`;
    const x2 = near ? 578 : 630;
    const y3 = (normal, closer) => near ? closer : normal;
    return w`
      ${near ? w`<g transform="translate(-70 40)">${body}</g>` : body}
      <text x=${x2} y=${y3(618, 668)} class="t1 b val" text-anchor="middle">${panel.value === null ? "\u2013" : `${fmt3(panel.value, 0)} \xB0C`}</text>
      <text x=${x2} y=${y3(640, 690)} class="t2 s15" text-anchor="middle">${panel.caption}</text>
      ${panel.maxPredicted !== null ? w`<text x=${x2} y=${y3(668, 716)} class="b s15" text-anchor="middle" fill="#f59e0b">max prevista ${fmt3(panel.maxPredicted, 0)} °C</text>` : A}
      ${panel.maxToday !== null ? w`<text x=${x2} y=${y3(690, 738)} class="t2 s15" text-anchor="middle">raggiunta oggi ${fmt3(panel.maxToday, 0)} °C</text>` : A}`;
  }
  // ---- caldaia -----------------------------------------------------------
  _flame(cx, cy, k2, opacity = 1) {
    return w`<g transform="translate(${cx},${cy}) scale(${k2})" opacity=${opacity}>
      <path d=${FLAME_PATH} fill="url(#fiamma)" />
      <path d=${FLAME_PATH} fill="#fde047" transform="translate(0,6) scale(0.52)" />
    </g>`;
  }
  /**
   * Circolatore della caldaia: un girante a tre palette dentro un cerchio. In marcia e' verde e gira; fermo e' grigio e
   * sbiadito (cosi' si vede sempre dove sta); con il sensore che non risponde non compare.
   */
  _pumpIcon(cx, cy, r6, running) {
    if (running === null) return A;
    const vane = (a3) => w`<path d="M0,0 Q${r6 * 0.55},${-r6 * 0.1} ${r6 * 0.78},${-r6 * 0.72}" transform="rotate(${a3})" />`;
    return w`<g class=${running ? "pump on" : "pump"} transform="translate(${cx},${cy})">
      <title>${running ? "Circolatore acceso" : "Circolatore fermo"}</title>
      <circle class="pumpring" r=${r6} />
      <g class="pumprotor">${vane(0)}${vane(120)}${vane(240)}</g>
      <circle class="pumphub" r="1.4" />
    </g>`;
  }
  _renderStoveImage(look, pellet, pump = null) {
    const flame = look === "work" ? this._flame(90, 168, 1) : look === "start" ? this._flame(90, 168, 0.4) : look === "stopping" ? this._flame(90, 168, 0.22, 0.55) : A;
    const glow = look === "work" ? 0.55 : look === "start" ? 0.3 : 0;
    return b2`
      <svg class="stoveimg ${look}" viewBox="0 0 180 250" role="img" aria-label="Caldaia a pellet">
        <defs>
          <linearGradient id="fiamma" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="#f59e0b" /><stop offset="0.55" stop-color="#f97316" /><stop offset="1" stop-color="#dc2626" />
          </linearGradient>
          <linearGradient id="vetro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#05080f" /><stop offset="1" stop-color="#1e293b" /></linearGradient>
          <radialGradient id="bagliore" cx="0.5" cy="0.85" r="0.6">
            <stop offset="0" stop-color="#f97316" stop-opacity=${glow} /><stop offset="1" stop-color="#f97316" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect x="20" y="4" width="140" height="26" rx="6" fill=${HOPPER_FILL[pellet.key]} />
        <text x="90" y="22" font-size="12" font-weight="700" text-anchor="middle" fill="#ffffff">${pellet.key === "nd" ? "pellet" : `pellet ${pellet.label.toLowerCase()}`}</text>
        <rect x="0" y="30" width="180" height="214" rx="16" fill="#1f2937" stroke="#64748b" stroke-width="2" />
        <rect x="20" y="52" width="140" height="130" rx="12" fill="url(#vetro)" stroke="#94a3b8" stroke-width="3" />
        <rect x="20" y="52" width="140" height="130" rx="12" fill="url(#bagliore)" />
        <g class="flicker">${flame}</g>
        <rect x="20" y="190" width="140" height="8" rx="4" fill="#374151" />
        <circle cx="22" cy="222" r="5" fill="#64748b" /><circle cx="42" cy="222" r="5" fill="#64748b" />
        ${this._pumpIcon(152, 220, 8, pump)}
      </svg>
    `;
  }
  _tile(label, value, color) {
    return b2`<div class="tile"><span class="tl">${label}</span><span class="tv" style=${color ? `color:${color}` : ""}>${value}</span></div>`;
  }
  _chip(label, v2) {
    return b2`<div class="chip ${v2 ? "yes" : ""}"><span>${label}</span><b>${v2 === null ? "\u2013" : v2 ? "S\xCC" : "NO"}</b></div>`;
  }
  _renderStove() {
    const e5 = this._e;
    const stateRaw = this._s(e5.stove_state);
    const look = stoveLook(stateRaw);
    const changed = this.hass.states[e5.stove_state]?.last_changed;
    const since = changed ? new Date(changed).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) : null;
    const alarmRaw = (this._s(e5.alarm) ?? "").trim();
    const noAlarm = alarmRaw === "" || /^[_\-\s0]+$/.test(alarmRaw) || alarmRaw.toLowerCase() === "unknown";
    const work = this._n(e5.work_hours_today);
    const pellet = pelletStatus(this._yes(e5.pellet_reserve), this._yes(e5.pellet_empty), this._yes(e5.pellet_open));
    const inline = this._config.layout === "split" && this._pelletEnabled();
    return b2`
      <section class="stove">
        <div class="shead">
          <h3>Caldaia a pellet (Polygon)</h3>
          ${this._config.schedule === false && this._config.settings === false ? A : b2`<div class="hbtns">
                ${this._config.schedule === false ? A : b2`<button class="progbtn" @click=${() => this._openSchedule()} aria-label="Programmazione settimanale della caldaia">
                      <ha-icon icon="mdi:calendar-clock"></ha-icon><span>Programma</span>
                    </button>`}
                ${this._config.settings === false ? A : b2`<button class="gearbtn" title="Preferenze impianto" aria-label="Preferenze impianto" @click=${() => this._openSettings()}>
                      <ha-icon icon="mdi:cog-outline"></ha-icon>
                    </button>`}
              </div>`}
        </div>
        <div class=${inline ? "top figure" : "top"}>
          ${inline ? this._renderPolygonFigure(look, pellet, { state: stateRaw ?? "\u2013", water: this._n(e5.stove_water), since, pump: stovePumpRunning(this._s(e5.pump)) }) : b2`${this._renderStoveImage(look, pellet, stovePumpRunning(this._s(e5.pump)))}
                <div class="statecard">
                  <span class="scp"><span class="tl">Stato caldaia</span><span class="statepill ${look}">${stateRaw ?? "\u2013"}</span></span>
                  <span class="scp"><span class="tl">Acqua caldaia</span><span class="water">${fmt3(this._n(e5.stove_water), 1)}<small> °C</small></span></span>
                  <span class="scp"><span class="tl">Ultimo cambio stato</span><span class="since">${since ? `alle ${since}` : "\u2013"}</span></span>
                  <span class="scp"><span class="tl">Pellet</span><span class="pelletpill ${pellet.key}">${pellet.label}</span></span>
                </div>`}
        </div>
        ${noAlarm ? A : b2`<div class="alarmbar" role="alert"><b>Allarme</b><span>${alarmRaw}</span></div>`}
        <div class="tiles">
          ${this._tile(this._cless() ? "Sonda S. BOILER" : "Puffer 50 L", `${fmt3(this._n(this.hass.states[e5.puffer_effective] ? e5.puffer_effective : e5.puffer), 1)} \xB0C${this.hass.states[e5.puffer_effective]?.attributes?.fonte === "sonda pozzetto" ? " (stima)" : ""}`, "#f59e0b")}
          ${this._tile("Set boiler", `${fmt3(this._n(e5.set_boiler), 0)} \xB0C`)}
          ${this._tile("Set acqua", `${fmt3(this._n(e5.set_water), 0)} \xB0C`)}
          ${this._tile("Potenza reale", `${fmt3(this._n(e5.power), 0)} %`)}
        </div>
        <div class="counters">
          <span class="tl">Oggi</span>
          <div>
            <b>${fmt3(this._n(e5.starts_today), 0)} accensioni</b>
            <b>${fmt3(work, 1)} h in lavoro</b>
            <b>${fmt3(this._n(e5.standby_today), 0)} stand-by</b>
          </div>
          <button class="more" @click=${() => this._openDetails()} aria-label="Altri dati della caldaia">Altri dati ▸</button>
        </div>
        <div class="chips">
          ${this._chip("Richiesta ACS", this._yes(e5.request_acs))} ${this._chip("Riscaldamento", this._yes(e5.request_heating))}
          ${this._chip("Consenso suggerito", this._yes(e5.consent))}
        </div>
        <p class="look">${LOOK_LABEL[look]}</p>
      </section>
    `;
  }
  /** Tutti i valori che non stanno nella colonna principale della caldaia. */
  _detailGroups() {
    const e5 = this._e;
    const pump = this._s(e5.pump);
    const pumpOn = pump !== void 0 && pump !== "OFF" && pump !== "unknown" && pump !== "unavailable";
    const alarmRaw = (this._s(e5.alarm) ?? "").trim();
    const noAlarm = alarmRaw === "" || /^[_\-\s0]+$/.test(alarmRaw) || alarmRaw.toLowerCase() === "unknown";
    const groups = [
      {
        title: "Combustione",
        tiles: [
          { label: "Fumi", value: `${fmt3(this._n(e5.smoke), 0)} \xB0C` },
          { label: "Fiamma", value: `${fmt3(this._n(e5.flame), 0)} \xB0C` },
          { label: "Estrattore fumi", value: `${fmt3(this._n(e5.extractor), 0)} giri` },
          { label: "Pressione braciere", value: fmt3(this._n(e5.brazier_pressure), 1) }
        ]
      },
      {
        title: "Acqua e circolatore",
        tiles: [
          { label: "Pressione acqua", value: `${fmt3(this._n(e5.water_pressure), 1)} bar` },
          { label: "Circolatore", value: pump === void 0 ? "\u2013" : pumpOn ? "ON" : "OFF", color: pumpOn ? "#22c55e" : void 0 },
          { label: "Accensioni ieri", value: fmt3(this._n(e5.starts_yesterday), 0) },
          { label: "Allarme", value: noAlarm ? "nessuno" : alarmRaw, color: noAlarm ? "#22c55e" : "#ef4444" }
        ]
      }
    ];
    if ([e5.pellet_today, e5.pellet_week, e5.pellet_month].some((id) => this.hass.states[id])) {
      groups.push({
        title: "Pellet (stima dal modello di consumo)",
        tiles: [
          { label: "Oggi", value: `${fmt3(this._n(e5.pellet_today), 1)} kg` },
          { label: "Settimana", value: `${fmt3(this._n(e5.pellet_week), 1)} kg` },
          { label: "Mese", value: `${fmt3(this._n(e5.pellet_month), 0)} kg` }
        ]
      });
    }
    return groups;
  }
  /** Apre la finestra "Altri dati" (si aggiunge alla pagina, come le altre). */
  _openDetails() {
    if (this._details) return;
    const d3 = document.createElement("impianto-details-dialog");
    d3.groups = this._detailGroups();
    d3.addEventListener("closed", () => {
      this._details = void 0;
    });
    document.body.appendChild(d3);
    this._details = d3;
  }
  /**
   * Se il browser non ha registrato una scheda collegata, ne importa il file a mano: se l'importazione riesce la scheda compare,
   * se fallisce l'errore (che sul tablet non si puo' leggere dalla console) finisce nel segnaposto.
   */
  async _loadLinkedCards() {
    const cards = [
      ["stufa-pellet-card", "/impianto_riscaldamento_static/stufa-pellet-card.js"],
      ["termostato-card", "/impianto_riscaldamento_static/termostato-card.js"]
    ];
    for (const [element, url] of cards) {
      if (customElements.get(element)) continue;
      try {
        await import(
          /* @vite-ignore */
          `${url}?r=${Date.now()}`
        );
        this._loadInfo = {
          ...this._loadInfo,
          [element]: customElements.get(element) ? "caricata a mano" : "file importato ma la scheda non si registra"
        };
      } catch (err) {
        const e5 = err;
        this._loadInfo = { ...this._loadInfo, [element]: `${e5?.name ?? "Errore"}: ${e5?.message ?? String(err)}` };
      }
      this.requestUpdate();
    }
  }
  /** Segnaposto quando una scheda collegata non si e' caricata: dice cosa manca e permette di ricaricare con un tocco. */
  _missingBox(title, element) {
    return b2`<div class="missingbox" role="alert">
      <b>${title}: scheda non caricata</b>
      <span>Il browser non ha ancora caricato «${element}». Ricarica la pagina; se resta così svuota la cache del browser.</span>
      <span class="missingdiag">${this._loadInfo[element] ?? "provo a caricarla\u2026"} · ${(navigator.userAgent.match(/Chrome\/[\d.]+/) ?? ["?"])[0]}</span>
      <button @click=${() => location.reload()}>Ricarica la pagina</button>
    </div>`;
  }
  /** Il termostato ambiente (integrazione termostato_riscaldamento): sotto la caldaia, solo se è installato. */
  _renderThermostat() {
    const opt = this._config.thermostat;
    if (opt === false) return A;
    if (!customElements.get("termostato-card")) {
      const comps = this.hass.config?.components ?? [];
      const installed = comps.includes("impianto_riscaldamento") || comps.includes("termostato_riscaldamento");
      return this._waited && installed ? this._missingBox("Termostato", "termostato-card") : A;
    }
    const cfg = typeof opt === "object" && opt !== null ? opt : {};
    const key = JSON.stringify(cfg);
    if (!this._thermo || this._thermoKey !== key) {
      const el = document.createElement("termostato-card");
      el.setConfig({ type: "custom:termostato-card", embedded: true, ...cfg.entry_id ? { entry_id: cfg.entry_id } : {}, ...cfg.title ? { title: cfg.title } : {} });
      this._thermo = el;
      this._thermoKey = key;
    }
    this._thermo.hass = this.hass;
    return b2`<div class="thermo">${this._thermo}</div>`;
  }
  /** La scheda «Stanze» accanto al termostato: compare se almeno un sensore delle stanze esiste. */
  _renderRooms() {
    const opt = this._config.rooms;
    if (opt === false) return A;
    const cfg = typeof opt === "object" && opt !== null ? opt : {};
    const rooms = cfg.rooms === void 0 ? DEFAULT_ROOMS : normalizeRooms(cfg.rooms);
    const exists = (id) => !!id && this.hass.states[id] !== void 0;
    if (!rooms.some((r6) => roomExists(r6, exists))) return A;
    const key = JSON.stringify(cfg);
    if (!this._roomsEl || this._roomsKey !== key) {
      const el = document.createElement("impianto-rooms-card");
      el.setConfig({ type: "custom:impianto-rooms-card", embedded: true, stove_state: this._e.stove_state, ...cfg });
      this._roomsEl = el;
      this._roomsKey = key;
    }
    this._roomsEl.hass = this.hass;
    return b2`<div class="roomsbox">${this._roomsEl}</div>`;
  }
  /** Le righe della finestra "Stato": poche frasi sul momento dell'impianto. */
  _summaryLines() {
    const e5 = this._e;
    const alarmRaw = (this._s(e5.alarm) ?? "").trim();
    const noAlarm = alarmRaw === "" || /^[_\-\s0]+$/.test(alarmRaw) || alarmRaw.toLowerCase() === "unknown" || alarmRaw.toLowerCase() === "unavailable";
    const pufferId = this.hass.states[e5.puffer_effective] ? e5.puffer_effective : e5.puffer;
    const awaySince = this.hass.states[e5.away]?.last_changed;
    const pill = integrationPumpPill(
      this._yes(e5.integration_pump),
      this._yes(e5.integration_call),
      this._yes(e5.integration_block_enabled),
      this._yes(e5.integration_block_wanted),
      this._n(e5.integration_power)
    );
    const eta = this.hass.states[e5.eta] ? this._n(e5.eta) : null;
    return summarize2({
      stoveState: this._s(e5.stove_state),
      alarm: noAlarm ? null : alarmRaw,
      power: this._n(e5.power),
      setWater: this._n(e5.set_water),
      setBoiler: this._n(e5.set_boiler),
      puffer: this._n(pufferId),
      pufferEstimated: this.hass.states[pufferId]?.attributes?.fonte === "sonda pozzetto",
      boilerTop: this._n(e5.boiler_top),
      collector: this._n(e5.collector_temp),
      integrationPump: pill.key,
      cless: this._cless(),
      collectorPumpOn: this._yes(e5.collector_pump),
      etaMinutes: this._cless() ? null : eta,
      cronoOn: this._yes(e5.crono_master),
      programActive: this._yes(e5.program_active),
      guardFlag: this._yes(e5.guard_flag),
      boostActive: this._s(e5.boost_state) === "attiva",
      nobodyHome: this._yes(e5.away),
      nobodyHomeMinutes: awaySince ? Math.max(0, (Date.now() - new Date(awaySince).getTime()) / 6e4) : null,
      awayEnabled: this._yes(e5.away_enabled),
      awayFlag: this._yes(e5.away_flag),
      guests: this._yes(e5.away_guests),
      awayMinutes: this._n(e5.away_minutes),
      pelletEmpty: this._yes(e5.pellet_empty),
      pelletReserve: this._yes(e5.pellet_reserve),
      allskyOk: this.hass.states[e5.allsky_analysis]?.attributes?.ok === true ? true : this.hass.states[e5.allsky_analysis] ? false : null,
      sunFree: this._yes(e5.allsky_sun_free),
      allskyCloud: this._n(e5.allsky_cloud),
      sunAboveHorizon: this._yes(e5.sun_above_horizon),
      horizonElev: this._n(e5.horizon_elevation),
      sunElevation: toNumber(String(this.hass.states[e5.sun]?.attributes?.elevation ?? ""))
    });
  }
  /** Apre la finestra "Grafici" (storico dei valori principali). */
  _openCharts() {
    if (this._charts) return;
    const d3 = document.createElement("impianto-charts-dialog");
    d3.hass = this.hass;
    d3.entities = this._e;
    d3.addEventListener("closed", () => {
      this._charts = void 0;
    });
    document.body.appendChild(d3);
    this._charts = d3;
  }
  /** Apre la finestra "Stato" (si aggiunge alla pagina, come quella delle preferenze). */
  _openInfo() {
    if (this._info) return;
    const d3 = document.createElement("impianto-info-dialog");
    d3.lines = this._summaryLines();
    d3.addEventListener("closed", () => {
      this._info = void 0;
    });
    document.body.appendChild(d3);
    this._info = d3;
  }
  // ---- pellet nel serbatoio: chili del riferimento meno il consumo stimato da allora --------------------------------
  /** Il conteggio del serbatoio c'e' solo con i due valori di riferimento e il totale stimato. */
  _pelletEnabled() {
    const e5 = this._e;
    return !!(this.hass.states[e5.pellet_ref_kg] && this.hass.states[e5.pellet_ref_total] && this.hass.states[e5.pellet_total]);
  }
  _pelletKg() {
    const e5 = this._e;
    if (!this._pelletEnabled()) return null;
    return remainingKg(this._n(e5.pellet_ref_kg), this._n(e5.pellet_total), this._n(e5.pellet_ref_total));
  }
  /** Consumo medio al giorno: dai contatori della settimana e del mese, diviso per i giorni trascorsi (vedi consumptionPerDay). */
  _pelletPerDay() {
    return consumptionPerDay(this._n(this._e.pellet_week), this._n(this._e.pellet_month), /* @__PURE__ */ new Date());
  }
  _pelletInfo() {
    return { kg: this._pelletKg(), perDay: this._pelletPerDay(), bagKg: this._n(this._e.pellet_bag) ?? HOPPER.bagKg };
  }
  /** Scrive il nuovo riferimento: i chili che ci sono adesso e il totale stimato di adesso. */
  async _pelletSetReference(kg) {
    const e5 = this._e;
    const total = this._n(e5.pellet_total);
    if (total === null) return;
    const refMax = Number(this.hass.states[e5.pellet_ref_kg]?.attributes?.max ?? 130);
    await Promise.all([
      this.hass.callService("input_number", "set_value", { entity_id: e5.pellet_ref_kg, value: Math.round(Math.min(refMax, kg) * 10) / 10 }),
      this.hass.callService("input_number", "set_value", { entity_id: e5.pellet_ref_total, value: Math.round(total * 100) / 100 })
    ]);
  }
  /** Popup con i grafici del pellet: chili rimasti, caricamenti, letture del livello, consumo per giorno. */
  _openPelletCharts() {
    if (this._pelletChartsDlg || !this._pelletEnabled()) return;
    const d3 = document.createElement("impianto-pellet-charts-dialog");
    d3.hass = this.hass;
    d3.ids = { remaining: "sensor.caldaia_pellet_serbatoio", total: this._e.pellet_total, factor: "input_number.caldaia_pellet_fattore" };
    d3.bagKg = this._pelletInfo().bagKg;
    d3.perDay = this._pelletPerDay();
    d3.addEventListener("closed", () => {
      this._pelletChartsDlg = void 0;
    });
    document.body.appendChild(d3);
    this._pelletChartsDlg = d3;
  }
  _openPellet() {
    if (this._pelletDlg || !this._pelletEnabled()) return;
    const d3 = document.createElement("impianto-pellet-dialog");
    d3.info = this._pelletInfo();
    d3.addEventListener("bags", (ev) => {
      const kg = this._pelletKg();
      const bag = this._pelletInfo().bagKg;
      if (kg !== null) void this._pelletSetReference(afterBags(kg, ev.detail, bag));
    });
    d3.addEventListener("level", (ev) => void this._pelletSetReference(kgAtDepth(ev.detail)));
    d3.addEventListener("closed", () => {
      this._pelletDlg = void 0;
    });
    document.body.appendChild(d3);
    this._pelletDlg = d3;
  }
  /**
   * Layout split: la caldaia Polygon come nella foto (armadio del serbatoio a sinistra, corpo della caldaia a destra).
   * Nell'armadio il serbatoio del pellet riempito fino ai chili rimasti (si tocca per aggiornare il conteggio); nel corpo la
   * finestra con la fiamma, in alto l'ultimo cambio di stato, in basso lo stato e la temperatura dell'acqua.
   */
  _renderPolygonFigure(look, pellet, d3) {
    const kg = this._pelletKg();
    const days = daysLeft(kg, this._pelletPerDay());
    const fullDays = daysLeft(HOPPER.capacityKg, this._pelletPerDay());
    const dayText = (n5) => `${n5 < 10 ? fmt3(n5, 1) : fmt3(n5, 0)} giorni`;
    const glow = look === "work" ? 0.55 : look === "start" ? 0.3 : 0;
    const flame = look === "work" ? this._flame(272, 156, 0.82) : look === "start" ? this._flame(272, 156, 0.32) : look === "stopping" ? this._flame(272, 156, 0.18, 0.55) : A;
    const pelletFill = HOPPER_FILL[pellet.key];
    const stateFont = d3.state.length > 5 ? 10.5 : 14;
    return b2`
      <svg class="polyfig ${look}" viewBox="0 0 360 262" role="img" aria-label="Caldaia a pellet Polygon">
        <defs>
          <linearGradient id="pf-corpo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2b2b31" /><stop offset="0.6" stop-color="#1c1c21" /><stop offset="1" stop-color="#141418" /></linearGradient>
          <linearGradient id="pf-armadio" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#26262b" /><stop offset="1" stop-color="#1a1a1f" /></linearGradient>
          <linearGradient id="pf-vetro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#05080f" /><stop offset="1" stop-color="#1e293b" /></linearGradient>
          <radialGradient id="pf-bagliore" cx="0.5" cy="0.9" r="0.7"><stop offset="0" stop-color="#f97316" stop-opacity=${glow} /><stop offset="1" stop-color="#f97316" stop-opacity="0" /></radialGradient>
          <linearGradient id="fiamma" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f59e0b" /><stop offset="0.55" stop-color="#f97316" /><stop offset="1" stop-color="#dc2626" /></linearGradient>
        </defs>
        <!-- corpo della caldaia (a destra, piu' alto) -->
        <rect x="196" y="6" width="152" height="224" rx="5" fill="url(#pf-corpo)" stroke="#3b3b44" stroke-width="1.5" />
        <rect x="206" y="14" width="132" height="22" rx="11" fill="#334155" />
        <text x="272" y="29.5" font-size="11.5" font-weight="700" text-anchor="middle" fill="#e2e8f0">${d3.since ? `ultimo cambio ${d3.since}` : "ultimo cambio \u2013"}</text>
        <rect x="212" y="48" width="120" height="126" rx="10" fill="url(#pf-vetro)" stroke="#94a3b8" stroke-width="2.5" />
        <rect x="212" y="48" width="120" height="126" rx="10" fill="url(#pf-bagliore)" />
        <g class="flicker">${flame}</g>
        <rect class="sp ${look}" x="206" y="188" width="62" height="28" rx="14" />
        <text class="spt ${look}" x="237" y="207" font-size=${stateFont} font-weight="700" text-anchor="middle">${d3.state}</text>
        <text x="342" y="208" font-size="19" font-weight="700" text-anchor="end" fill="#f1f5f9">${fmt3(d3.water, 1)}<tspan font-size="11" font-weight="500" fill="#94a3b8"> °C</tspan></text>
        ${d3.pump === null ? A : w`${this._pumpIcon(215, 223, 6, d3.pump)}<text class=${d3.pump ? "pumplab on" : "pumplab"} x="225" y="226.3" font-size="9.5">circolatore</text>`}
        <!-- armadio del serbatoio (a sinistra) -->
        <g class="cabinet" role="button" tabindex="0" aria-label="Pellet nel serbatoio: aggiorna il conteggio" @click=${() => this._openPellet()} @keydown=${(ev) => (ev.key === "Enter" || ev.key === " ") && this._openPellet()}>
          <rect x="10" y="56" width="178" height="174" rx="4" fill="url(#pf-armadio)" stroke="#3b3b44" stroke-width="1.5" />
          <rect x="10" y="56" width="178" height="9" rx="3" fill="#0f0f13" />
          <polygon points="22,72 96,72 60,120" fill="rgba(148,163,184,0.07)" /><polygon points="96,72 176,72 140,128 60,120" fill="rgba(148,163,184,0.04)" />
          <polygon points="22,72 60,120 28,176" fill="rgba(148,163,184,0.05)" /><polygon points="60,120 140,128 100,190 28,176" fill="rgba(148,163,184,0.08)" />
          <polygon points="140,128 176,72 176,180 100,190" fill="rgba(148,163,184,0.05)" /><polygon points="28,176 100,190 70,222 24,222" fill="rgba(148,163,184,0.06)" />
          <g transform="translate(26 74) scale(1.46)">${hopperShape(kg, "pf-clip")}</g>
          <g class="chartbtn" role="button" tabindex="0" aria-label="Grafici del pellet" @click=${(ev) => {
      ev.stopPropagation();
      this._openPelletCharts();
    }}
            @keydown=${(ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.stopPropagation();
        ev.preventDefault();
        this._openPelletCharts();
      }
    }}>
            <rect x="114" y="69" width="68" height="24" rx="12" />
            <polyline points="122,86 128,79 133,83 140,75" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            <text x="144" y="85" font-size="11" font-weight="700">Grafici</text>
          </g>
          <text x="104" y="138" font-size="28" font-weight="700" fill="#f1f5f9">${kg === null ? "\u2013" : fmt3(kg, 0)}<tspan font-size="13" font-weight="500" fill="#94a3b8"> kg</tspan></text>
          <text x="92" y="155" font-size="13" fill="#94a3b8">${days === null ? "" : dayText(days)}</text>
          <text x="76" y="171" font-size="9.5" fill="#94a3b8">${fullDays === null ? "" : `(100% pellet ${dayText(fullDays)})`}</text>
          <text x="72" y="192" font-size="10.5" fill="#94a3b8">pellet</text>
          <rect x="72" y="197" width="58" height="20" rx="10" fill=${pelletFill} />
          <text x="101" y="211.5" font-size="11" font-weight="700" text-anchor="middle" fill="#ffffff">${pellet.label}</text>
        </g>
        <rect x="14" y="230" width="22" height="8" rx="2" fill="#0f0f13" /><rect x="320" y="230" width="22" height="8" rx="2" fill="#0f0f13" />
      </svg>
    `;
  }
  /** Rimisura quando cambiano la scheda della caldaia, la scheda della stufa o il pannello. */
  _observeFit() {
    const targets = [this.renderRoot.querySelector(".stove"), this.renderRoot.querySelector(".stufapanel.fit"), this._stufaCard].filter((x2) => !!x2);
    const same = targets.length === this._fitTargets.length && targets.every((t3, i5) => t3 === this._fitTargets[i5]);
    if (!same) {
      this._fitRO?.disconnect();
      this._fitRO = new ResizeObserver(() => this._fitStufa());
      for (const t3 of targets) this._fitRO.observe(t3);
      this._fitTargets = targets;
    }
    this._fitStufa();
  }
  /** Legge dall'integrazione stufa_pellet gli id delle entità; se non c'è la sintesi non compare. */
  async _loadStufa() {
    this._stufaLoading = true;
    try {
      const opt = this._config.stufa;
      const cfg = typeof opt === "object" && opt !== null ? opt : {};
      const msg = { type: "stufa_pellet/info", ...cfg.entry_id ? { entry_id: cfg.entry_id } : {} };
      const info = await this.hass.callWS(msg);
      this._stufa = info && info.entities && info.sources ? info : null;
    } catch {
      this._stufa = null;
    } finally {
      this._stufaLoadedAt = Date.now();
      this._stufaLoading = false;
    }
  }
  /** Accensione o spegnimento della stufa: chiede conferma in una finestra e poi comanda l'interruttore. */
  _stufaPress() {
    const sw = this._stufa?.sources.switch;
    if (!sw) return;
    const on2 = this.hass.states[sw]?.state === "on" ? true : this.hass.states[sw]?.state === "off" ? false : null;
    const btn = stufaButton(on2, false);
    if (btn.action === "none") return;
    const run = () => void this.hass.callService("homeassistant", btn.action === "on" ? "turn_on" : "turn_off", { entity_id: sw });
    if (btn.action === "on") this._ask("Accendere la stufa?", ["Chiude l'interruttore: la stufa a pellet si accende e parte la sua sequenza di accensione."], "Accendi", false, run);
    else this._ask("Spegnere la stufa?", ["Apre l'interruttore: la stufa a pellet inizia lo spegnimento."], "Spegni", true, run);
  }
  /** Popup con la programmazione settimanale della caldaia (caldaia-schedule-card), senza passare da altri pop-up della dashboard. */
  _openSchedule() {
    if (this._scheduleDlg) return;
    const opt = this._config.schedule;
    const d3 = document.createElement("impianto-card-dialog");
    d3.hass = this.hass;
    d3.tag = "caldaia-schedule-card";
    d3.label = "Programmazione caldaia";
    d3.wide = true;
    d3.config = typeof opt === "object" && opt !== null ? opt : {};
    d3.addEventListener("closed", () => {
      this._scheduleDlg = void 0;
    });
    document.body.appendChild(d3);
    this._scheduleDlg = d3;
  }
  /** Popup con la scheda completa della stufa (stufa-pellet-card, dell'integrazione stufa_pellet). */
  _openStufa() {
    if (this._stufaDlg || !customElements.get("stufa-pellet-card")) return;
    const opt = this._config.stufa;
    const cfg = typeof opt === "object" && opt !== null ? opt : {};
    const d3 = document.createElement("impianto-card-dialog");
    d3.hass = this.hass;
    d3.tag = "stufa-pellet-card";
    d3.label = "Stufa a pellet";
    d3.config = { ...cfg.entry_id ? { entry_id: cfg.entry_id } : {}, ...cfg.title ? { title: cfg.title } : {} };
    d3.addEventListener("closed", () => {
      this._stufaDlg = void 0;
    });
    document.body.appendChild(d3);
    this._stufaDlg = d3;
  }
  /** Sintesi della stufa a pellet: stato, modo, potenza, accensione manuale e pulsante della scheda completa. */
  /** Layout split: la scheda completa della stufa (stufa-pellet-card) incorporata, senza pulsante e popup. */
  _stufaEmbedded() {
    if (!customElements.get("stufa-pellet-card")) return this._waited ? this._missingBox("Stufa a pellet", "stufa-pellet-card") : A;
    const opt = this._config.stufa;
    const cfg = typeof opt === "object" && opt !== null ? opt : {};
    const key = JSON.stringify(cfg) + this._config.layout;
    if (!this._stufaCard || this._stufaCardKey !== key) {
      const el = document.createElement("stufa-pellet-card");
      el.setConfig({ type: "custom:stufa-pellet-card", ...this._config.layout === "split" ? { compact: true } : {}, ...cfg.entry_id ? { entry_id: cfg.entry_id } : {}, ...cfg.title ? { title: cfg.title } : {} });
      this._stufaCard = el;
      this._stufaCardKey = key;
    }
    this._stufaCard.hass = this.hass;
    return b2`<div class=${this._config.layout === "split" && this._wide && this._sections.caldaia ? "stufapanel fit" : "stufapanel"}><div class="stufafull">${this._stufaCard}</div></div>`;
  }
  _renderStufa() {
    if (this._config.stufa && this._config.layout === "split") return this._stufaEmbedded();
    const info = this._stufa;
    if (!this._config.stufa || !info) return A;
    const st = info.entities.stato ? this.hass.states[info.entities.stato] : void 0;
    const key = stufaKey(st?.state);
    const attrs = st?.attributes ?? {};
    const power = toNumber(String(attrs.potenza ?? "")) ?? toNumber(this.hass.states[info.sources.power_sensor]?.state);
    const sinceRaw = attrs.da;
    const since = sinceRaw && key !== "non_disponibile" ? sinceText(Date.now() - Date.parse(sinceRaw)) : "";
    const modeRaw = info.entities.modo ? this.hass.states[info.entities.modo]?.state : void 0;
    const sw = info.sources.switch;
    const swRaw = sw ? this.hass.states[sw]?.state : void 0;
    const btn = stufaButton(swRaw === "on" ? true : swRaw === "off" ? false : null, false);
    const cls = btn.action === "none" ? "sbtn off" : swRaw === "on" ? "sbtn stop" : "sbtn";
    return b2`
      <section class="stufa">
        <h3>${typeof this._config.stufa === "object" && this._config.stufa.title || info.title || "Stufa a pellet"}</h3>
        <div class="mid">
          <div class="sumstate">
            <span class="statepill st-${key}">${STUFA_LABEL[key]}</span>
            <span class="since">${since}</span>
          </div>
          ${modeRaw && STUFA_MODE_LABEL[modeRaw] ? b2`<div class="sumrow"><span class="tl">Modo</span><b>${STUFA_MODE_LABEL[modeRaw]}</b></div>` : A}
          <div class="sumrow"><span class="tl">Potenza</span><b>${power === null ? "\u2013" : `${fmt3(power, power % 1 ? 1 : 0)} W`}</b></div>
        </div>
        ${sw ? b2`<button class=${cls} ?disabled=${btn.action === "none"} @click=${() => this._stufaPress()}>
              <span>${btn.label}</span>${btn.sub ? b2`<small>${btn.sub}</small>` : A}
            </button>` : A}
        ${customElements.get("stufa-pellet-card") ? b2`<button class="more full" @click=${() => this._openStufa()} aria-label="Apri la scheda completa della stufa">Scheda completa ▸</button>` : A}
      </section>
    `;
  }
  render() {
    if (!this._config || !this.hass) return A;
    const sec = this._effectiveSections();
    const thermo = sec.termostato ? this._renderThermostat() : A;
    const rooms = sec.termostato ? this._renderRooms() : A;
    const stufa = sec.stufa ? this._renderStufa() : A;
    const split = this._config.layout === "split";
    const gear = !sec.caldaia && this._config.settings !== false;
    const head = b2`${this._config.title || gear ? b2`<div class="topbar">
          <div class="ctitle">${this._config.title ?? ""}</div>
          ${gear ? b2`<button class="gearbtn" title="Preferenze impianto" aria-label="Preferenze impianto" @click=${() => this._openSettings()}>
                <ha-icon icon="mdi:cog-outline"></ha-icon>
              </button>` : A}
        </div>` : A}`;
    if (split) {
      const cols = [sec.boiler ? "minmax(0,1fr)" : "", sec.caldaia ? "minmax(0,1.15fr)" : "", sec.stufa && stufa !== A ? "minmax(0,1fr)" : ""].filter(Boolean);
      const cards = cols.length > 0;
      return b2`
        <ha-card>
          ${head}
          <div class="layout split" style=${cards ? `--cols: ${cols.join(" ")}` : ""}>
            ${sec.boiler ? b2`<section class="boilerpanel">${this._renderBoiler()}</section>` : A}
            ${sec.caldaia ? this._renderStove() : A}
            ${stufa}
            ${thermo === A && rooms === A ? A : b2`<div class=${thermo !== A && rooms !== A ? "splitthermo two" : "splitthermo"}>${thermo}${rooms}</div>`}
          </div>
        </ha-card>
      `;
    }
    const right = b2`${sec.caldaia ? stufa === A ? this._renderStove() : b2`<div class="stoverow">${this._renderStove()}${stufa}</div>` : stufa}${thermo}${rooms}`;
    const hasRight = sec.caldaia || stufa !== A || thermo !== A || rooms !== A;
    const two = sec.boiler && hasRight;
    return b2`
      <ha-card>
        ${head}
        <div class=${two ? "layout" : "layout solo"}>${sec.boiler ? this._renderBoiler() : A}${hasRight ? b2`<div class="rightcol">${right}</div>` : A}</div>
      </ha-card>
    `;
  }
  static {
    this.styles = i`
    :host {
      display: block;
      container-type: inline-size;
    }
    ha-card {
      padding: 12px;
      color: var(--primary-text-color);
      position: relative;
    }
    /* layout split: la scheda della caldaia in versione compatta (tessere in una riga, contatori, richieste e salvaguardia piu' stretti) */
    .layout.split .stove {
      padding: 10px 12px;
      border-radius: 20px;
    }
    .layout.split .stove h3 {
      font-size: 15px;
    }
    .layout.split .shead {
      margin: 0 0 6px;
    }
    .layout.split .tiles {
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      margin-top: 6px;
    }
    .layout.split .tile {
      padding: 3px 7px;
      border-radius: 8px;
    }
    .layout.split .tile .tl {
      font-size: 10.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .layout.split .tile .tv {
      font-size: 14px;
    }
    .layout.split .counters {
      margin-top: 6px;
      padding: 3px 10px;
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .layout.split .counters > div {
      font-size: 13px;
      gap: 2px 14px;
    }
    .layout.split .chips {
      margin-top: 6px;
      gap: 6px;
    }
    .layout.split .chip {
      flex-direction: row;
      justify-content: center;
      gap: 6px;
      padding: 2px 4px;
      border-radius: 14px;
    }
    .layout.split .chip b {
      font-size: 13px;
    }
    /* pulsanti nel titolo della scheda della caldaia: programmazione e preferenze */
    .hbtns {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: none;
    }
    .gearbtn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      min-height: 36px;
      margin: -10px 0;
      padding: 0;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .gearbtn ha-icon {
      --mdc-icon-size: 20px;
    }
    .gearbtn:hover {
      border-color: var(--primary-color, #03a9f4);
      color: var(--primary-text-color);
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .ctitle {
      font-size: 20px;
      font-weight: 700;
      margin: 4px 4px 8px;
    }
    .topbar .gearbtn {
      margin: 0 0 4px auto;
    }
    .layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      align-items: start;
    }
    @container (min-width: 900px) {
      .layout {
        grid-template-columns: 7fr 6fr;
      }
      .layout.solo {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    svg.boiler {
      width: 100%;
      height: auto;
      display: block;
      max-width: 700px;
      margin: 0 auto;
    }
    svg.narrow .pufgroup {
      display: none;
    }
    svg.narrow .s13 {
      font-size: 15px;
    }
    svg.narrow .s14 {
      font-size: 16px;
    }
    /* testi e forme dell'SVG, colori dal tema di Home Assistant */
    .t1 {
      fill: var(--primary-text-color);
    }
    .t2 {
      fill: var(--secondary-text-color);
    }
    .b {
      font-weight: 700;
    }
    .s13 {
      font-size: 13px;
    }
    .s14 {
      font-size: 14px;
    }
    .s15 {
      font-size: 15px;
    }
    .s16 {
      font-size: 17px;
    }
    .val {
      font-size: 26px;
    }
    .tv {
      font-size: 17px;
      font-weight: 600;
      fill: var(--secondary-text-color);
    }
    /* fascia sotto il boiler su telefono: puffer e pannello con scritte piu' grandi */
    svg.mini {
      margin-top: 4px;
    }
    svg.mini .s15 {
      font-size: 21px;
    }
    svg.mini .s16 {
      font-size: 23px;
    }
    svg.mini .val {
      font-size: 36px;
    }
    svg.mini .tv {
      font-size: 22px;
    }
    .sep {
      stroke: var(--divider-color);
      stroke-width: 2;
    }
    .outline {
      stroke: var(--divider-color);
      stroke-width: 3;
    }
    .pill {
      fill: var(--card-background-color);
      fill-opacity: 0.9;
    }
    .pill.big {
      fill-opacity: 0.94;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
    }
    .card {
      fill: var(--secondary-background-color);
      stroke-width: 2;
    }
    .card.hi {
      stroke: #ef4444;
    }
    .card.lo {
      stroke: #3b82f6;
    }
    .card.sun {
      stroke: #22c55e;
    }
    .card.eta {
      stroke: var(--divider-color);
    }
    .btn {
      cursor: pointer;
      outline: none;
    }
    .btn text {
      fill: var(--text-primary-color, #fff);
    }
    .btn .btnbg {
      fill: var(--primary-color, #03a9f4);
    }
    .btn.armed .btnbg {
      fill: #f59e0b;
    }
    .btn:focus-visible .btnbg {
      stroke: var(--primary-text-color);
      stroke-width: 3;
    }
    .btn.off {
      cursor: default;
    }
    .btn.off .btnbg {
      fill: var(--secondary-background-color);
      stroke: var(--divider-color);
      stroke-width: 2;
    }
    .btn.off text {
      fill: var(--secondary-text-color);
    }
    .btn.info .infobg {
      fill: var(--secondary-background-color);
      stroke: var(--divider-color);
      stroke-width: 2;
    }
    .btn.info:hover .infobg {
      stroke: var(--primary-color);
    }
    .btn.info text {
      fill: var(--primary-text-color);
    }
    .btn.info .infoc {
      fill: none;
      stroke: var(--primary-color);
      stroke-width: 2;
    }
    .btn.info text:nth-of-type(1) {
      fill: var(--primary-color);
    }
    .probe {
      fill: var(--card-background-color);
      stroke: var(--primary-text-color);
      stroke-width: 3;
    }
    .lead {
      stroke: var(--secondary-text-color);
      stroke-width: 2;
    }
    .pipe {
      fill: none;
      stroke-width: 10;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .pipe.thin {
      stroke-width: 8;
    }
    /* acqua che scorre dentro la serpentina: tratteggio chiaro che si muove */
    .panelbody {
      stroke-width: 3;
    }
    .panelgrid line {
      stroke: #ffffff;
      stroke-opacity: 0.5;
      stroke-width: 1.5;
    }
    .panelleg {
      stroke: #64748b;
      stroke-width: 4;
      stroke-linecap: round;
    }
    .clesstint { mix-blend-mode: color; opacity: 0.85; }
    .clessflow { fill: none; stroke: #ffffff; stroke-opacity: 0.85; stroke-width: 7; stroke-linecap: round; stroke-dasharray: 14 30; animation: clessflow 1s linear infinite; }
    @keyframes clessflow { to { stroke-dashoffset: -44; } }
    .cutpipe { fill: var(--card-background-color, #fff); stroke-width: 2.6; }
    .plate { fill: #64748b; }
    .radbody { fill: var(--secondary-background-color, #e5e5e5); stroke: var(--secondary-text-color, #727272); stroke-width: 2; }
    .radfin { stroke: var(--secondary-text-color, #727272); stroke-width: 2; opacity: 0.6; }
    .stub { fill: #334155; stroke: #64748b; stroke-width: 1.5; }
    .tube { fill: none; stroke: #94a3b8; stroke-width: 3; }
    .tubefill { fill: rgba(255, 255, 255, 0.2); }
    .inpipe { fill: none; stroke-width: 4; stroke-linecap: round; }
    .inpipe.hot { stroke: #ef4444; }
    .inpipe.cold { stroke: #3b82f6; }
    .coilflow {
      fill: none;
      stroke: #ffffff;
      stroke-opacity: 0.9;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-dasharray: 5 11;
      animation: coilflow 0.8s linear infinite;
    }
    @keyframes coilflow {
      to {
        stroke-dashoffset: -16;
      }
    }
    .pulse {
      animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes pulse {
      50% {
        opacity: 0.35;
      }
    }
    .pumpring {
      fill: rgba(100, 116, 139, 0.12);
      stroke: #64748b;
      stroke-width: 1.4;
    }
    .pumprotor path {
      fill: none;
      stroke: #64748b;
      stroke-width: 1.6;
      stroke-linecap: round;
    }
    .pumphub {
      fill: #64748b;
    }
    .pump.on .pumpring {
      fill: rgba(34, 197, 94, 0.16);
      stroke: #22c55e;
    }
    .pump.on .pumprotor path {
      stroke: #22c55e;
    }
    .pump.on .pumphub {
      fill: #22c55e;
    }
    .pump.on .pumprotor {
      transform-origin: 0 0;
      animation: pumpspin 0.9s linear infinite;
    }
    @keyframes pumpspin {
      to {
        transform: rotate(360deg);
      }
    }
    .pumplab {
      fill: #64748b;
    }
    .pumplab.on {
      fill: #86efac;
    }
    @media (prefers-reduced-motion: reduce) {
      .coilflow,
      .pulse,
      .pump.on .pumprotor {
        animation: none;
      }
    }
    .pipe.hot {
      stroke: #dc2626;
    }
    .pipe.warm {
      stroke: #f97316;
    }
    .pipe.cold {
      stroke: #2563eb;
    }
    .coil {
      fill: none;
      stroke-width: 5;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-opacity: 0.9;
    }
    /* pannello caldaia */
    .stove {
      background: var(--secondary-background-color);
      border-radius: 20px;
      padding: 14px;
      border: 1px solid var(--divider-color);
      /* le regole di larghezza (tessere su due colonne) guardano la scheda della caldaia, non l'intera scheda */
      container-type: inline-size;
    }
    .stove h3 {
      margin: 0;
      font-size: 17px;
    }
    .shead {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 0 0 12px;
    }
    .shead:has(.hbtns) {
      justify-content: space-between;
    }
    /* pulsante alto 36 px senza alzare la riga del titolo */
    .progbtn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex: none;
      min-height: 36px;
      margin: -10px 0;
      padding: 4px 12px;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .progbtn ha-icon {
      --mdc-icon-size: 18px;
      color: var(--primary-color, #03a9f4);
    }
    .progbtn:hover {
      border-color: var(--primary-color, #03a9f4);
    }
    .top {
      display: grid;
      grid-template-columns: minmax(120px, 1fr) minmax(150px, 1fr);
      gap: 12px;
    }
    .stoveimg {
      width: 100%;
      max-width: 200px;
      height: auto;
      justify-self: center;
    }
    .flicker {
      transform-origin: 90px 168px;
    }
    .stoveimg.work .flicker,
    .stoveimg.start .flicker {
      animation: flicker 1.6s ease-in-out infinite;
    }
    @keyframes flicker {
      0%,
      100% {
        transform: scale(1, 1);
      }
      50% {
        transform: scale(1.03, 1.06);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .stoveimg .flicker {
        animation: none !important;
      }
    }
    .statecard {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
      justify-content: center;
      background: var(--card-background-color);
      border-radius: 16px;
      padding: 12px;
      text-align: center;
    }
    .tl {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .statepill {
      font-weight: 700;
      font-size: 20px;
      border-radius: 20px;
      padding: 4px 18px;
      margin-bottom: 8px;
      background: var(--divider-color);
    }
    .statepill.work {
      background: color-mix(in srgb, #22c55e 28%, transparent);
      color: #22c55e;
    }
    .statepill.start {
      background: color-mix(in srgb, #f59e0b 28%, transparent);
      color: #f59e0b;
    }
    .statepill.standby {
      background: color-mix(in srgb, #ef4444 28%, transparent);
      color: #ef4444;
    }
    .pelletpill {
      font-weight: 700;
      font-size: 15px;
      border-radius: 14px;
      padding: 2px 14px;
      background: var(--divider-color);
    }
    .pelletpill.ok {
      background: color-mix(in srgb, #22c55e 25%, transparent);
      color: #22c55e;
    }
    .pelletpill.riserva {
      background: color-mix(in srgb, #f59e0b 28%, transparent);
      color: #f59e0b;
    }
    .pelletpill.vuoto {
      background: color-mix(in srgb, #ef4444 28%, transparent);
      color: #ef4444;
    }
    .pelletpill.aperto {
      background: color-mix(in srgb, #3b82f6 28%, transparent);
      color: #3b82f6;
    }
    .water {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .water small {
      font-size: 16px;
    }
    .since {
      font-weight: 600;
    }
    .legendbar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-top: 12px;
      padding: 8px;
      background: var(--card-background-color);
      border-radius: 12px;
      font-size: 12px;
    }
    .legendbar > div {
      display: grid;
      grid-template-columns: 30px 1fr;
      grid-template-rows: auto auto;
      column-gap: 6px;
      align-items: center;
    }
    .legendbar .lg,
    .legendbar .dot {
      grid-row: 1 / span 2;
      width: 28px;
      height: 28px;
    }
    .legendbar .dot {
      border-radius: 50%;
      background: var(--divider-color);
      border: 2px solid var(--secondary-text-color);
      box-sizing: border-box;
    }
    .legendbar small {
      color: var(--secondary-text-color);
      font-size: 11px;
    }
    .legendbar .amber {
      color: #f59e0b;
    }
    .legendbar .red {
      color: #ef4444;
    }
    .rightcol {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
    }
    /* prova: layout "split": boiler, caldaia e stufa in tre schede alte uguali, termostato in una striscia sotto */
    .layout.split {
      grid-template-columns: 1fr;
    }
    .boilerpanel {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 20px;
      padding: 8px 6px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
    }
    .splitthermo {
      min-width: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 12px;
    }
    .roomsbox {
      min-width: 0;
    }
    .missingbox {
      background: var(--secondary-background-color);
      border: 1px dashed var(--divider-color);
      border-radius: 20px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
      justify-content: center;
      font-size: 14px;
      color: var(--secondary-text-color);
      min-width: 0;
    }
    .missingbox b {
      color: var(--primary-text-color);
      font-size: 15px;
    }
    .missingbox .missingdiag {
      font-size: 12px;
      font-family: monospace;
      word-break: break-word;
    }
    .missingbox button {
      min-height: 44px;
      border-radius: 22px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      padding: 0 18px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    /* scheda completa della stufa: stesso sfondo, bordo e angoli delle altre schede; le tessere prendono il colore delle tessere della caldaia */
    .stufapanel {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 20px;
      overflow: hidden;
      min-width: 0;
    }
    .stufapanel.fit {
      position: relative;
    }
    /* a schede larghe la scheda della stufa non allunga la riga: sta nel pannello, scalata se serve (--fit) */
    .stufapanel.fit .stufafull {
      position: absolute;
      top: 0;
      left: 0;
      width: calc(100% / var(--fit, 1));
      height: calc(100% / var(--fit, 1));
      transform: scale(var(--fit, 1));
      transform-origin: top left;
    }
    .stufafull {
      min-width: 0;
      --ha-card-background: transparent;
      --ha-card-box-shadow: none;
      --ha-card-border-width: 0px;
      --secondary-background-color: var(--card-background-color);
    }
    @container (min-width: 1150px) {
      .layout.split {
        grid-template-columns: var(--cols, minmax(0, 1fr) minmax(0, 1.15fr) minmax(0, 1fr));
        align-items: stretch;
      }
      .layout.split > .splitthermo {
        grid-column: 1 / -1;
      }
      /* con le stanze il termostato sta su meta' riga e la scheda delle stanze sull'altra meta' */
      .layout.split > .splitthermo.two {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        align-items: stretch;
      }
      .layout.split svg.boiler {
        margin: 0 auto;
      }
      .layout.split svg.boiler .tv {
        font-size: 19px;
      }
    }
    /* le coppie etichetta/valore dello stato: nel layout normale restano figli diretti della griglia */
    .scp {
      display: contents;
    }
    /* figura Polygon del layout split */
    .top.figure {
      display: block;
    }
    .polyfig {
      display: block;
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
      height: auto;
    }
    .polyfig .cabinet {
      cursor: pointer;
      outline: none;
    }
    .polyfig .chartbtn {
      cursor: pointer;
    }
    .polyfig .chartbtn rect {
      fill: #334155;
      stroke: #64748b;
      stroke-width: 1;
    }
    .polyfig .chartbtn polyline {
      stroke: #fbbf24;
    }
    .polyfig .chartbtn text {
      fill: #e2e8f0;
    }
    .polyfig .chartbtn:hover rect,
    .polyfig .chartbtn:focus-visible rect {
      fill: #475569;
      stroke: #fbbf24;
    }
    .polyfig .cabinet:hover > rect:first-child,
    .polyfig .cabinet:focus-visible > rect:first-child {
      stroke: var(--primary-color, #03a9f4);
    }
    .polyfig .flicker {
      transform-origin: 272px 156px;
    }
    .polyfig.work .flicker,
    .polyfig.start .flicker {
      animation: flicker 1.6s ease-in-out infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .polyfig .flicker {
        animation: none !important;
      }
    }
    .sp {
      fill: rgba(148, 163, 184, 0.28);
    }
    .sp.work {
      fill: rgba(34, 197, 94, 0.28);
    }
    .sp.start,
    .sp.wait {
      fill: rgba(245, 158, 11, 0.3);
    }
    .sp.stopping {
      fill: rgba(96, 165, 250, 0.3);
    }
    .spt {
      fill: #cbd5e1;
    }
    .spt.work {
      fill: #4ade80;
    }
    .spt.start,
    .spt.wait {
      fill: #fbbf24;
    }
    .spt.stopping {
      fill: #93c5fd;
    }
    /* prova: sintesi della stufa a pellet a destra della scheda della caldaia (sotto 1150 px una sopra l'altra) */
    .stoverow {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
    }
    @container (min-width: 1150px) {
      .stoverow {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 164px;
        align-items: stretch;
      }
    }
    .stufa {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 20px;
      padding: 14px;
    }
    .stufa h3 {
      margin: 0;
      text-align: center;
      font-size: 17px;
    }
    .sumstate {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .statepill.st-spenta {
      background: rgba(107, 114, 128, 0.25);
    }
    .statepill.st-accensione {
      background: rgba(245, 158, 11, 0.25);
      color: #f59e0b;
    }
    .statepill.st-accesa {
      background: rgba(239, 68, 68, 0.22);
      color: #ef4444;
    }
    .statepill.st-spegnimento {
      background: rgba(96, 165, 250, 0.25);
      color: #60a5fa;
    }
    .statepill.st-non_disponibile {
      background: rgba(220, 38, 38, 0.2);
      color: #dc2626;
    }
    .sumrow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .stufa .statepill {
      white-space: nowrap;
      font-size: 15px;
      padding: 3px 12px;
    }
    .stufa .mid {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 10px;
    }
    @container (min-width: 1150px) {
      .stufa .sumrow {
        flex-direction: column;
        gap: 0;
        text-align: center;
      }
      .stufa .sumrow b {
        font-size: 15px;
      }
    }
    .sbtn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      min-height: 52px;
      padding: 8px 12px;
      border: none;
      border-radius: 14px;
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      font: inherit;
      font-size: 17px;
      font-weight: 700;
      cursor: pointer;
    }
    .sbtn small {
      font-size: 12.5px;
      font-weight: 400;
      opacity: 0.9;
    }
    .sbtn.stop {
      background: #ef4444;
    }
    .sbtn.armed {
      background: #f59e0b;
    }
    .sbtn.off,
    .sbtn:disabled {
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      border: 1px solid var(--divider-color);
      cursor: default;
    }
    .more.full {
      width: 100%;
      min-height: 44px;
    }
    .more {
      white-space: nowrap;
    }
    .alarmbar {
      display: flex;
      gap: 10px;
      align-items: baseline;
      margin-top: 8px;
      padding: 6px 12px;
      border-radius: 10px;
      background: rgba(239, 68, 68, 0.16);
      color: #ef4444;
      font-size: 14px;
    }
    .more {
      margin-left: auto;
      min-height: 36px;
      padding: 4px 12px;
      border-radius: 10px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 13px;
      cursor: pointer;
    }
    .counters {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tiles {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 12px;
    }
    /* scheda della caldaia stretta: le quattro tessere restano in una riga, con carattere piu' piccolo */
    @container (max-width: 520px) {
      .tiles {
        gap: 6px;
      }
      .tile {
        padding: 6px 8px;
      }
      .tile .tl {
        font-size: 10.5px;
      }
      .tile .tv {
        font-size: 15px;
      }
    }
    .tile {
      background: var(--card-background-color);
      border-radius: 10px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .tv {
      font-size: 18px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .counters {
      margin-top: 12px;
      padding: 8px 12px;
      border-radius: 10px;
      background: color-mix(in srgb, #f59e0b 14%, transparent);
    }
    .counters > div {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 18px;
      font-size: 15px;
    }
    .chips {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 12px;
    }
    .chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 6px 4px;
      border-radius: 18px;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      font-size: 11px;
      color: var(--secondary-text-color);
      text-align: center;
    }
    .chip b {
      font-size: 14px;
      color: var(--primary-text-color);
    }
    .chip.yes {
      border-color: #22c55e;
    }
    .chip.yes b {
      color: #22c55e;
    }
    .look {
      display: none;
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], ImpiantoOverviewCard.prototype, "hass", 2);
__decorateClass([
  r5()
], ImpiantoOverviewCard.prototype, "_config", 2);
__decorateClass([
  r5()
], ImpiantoOverviewCard.prototype, "_narrow", 2);
__decorateClass([
  r5()
], ImpiantoOverviewCard.prototype, "_wide", 2);
__decorateClass([
  r5()
], ImpiantoOverviewCard.prototype, "_sections", 2);
__decorateClass([
  r5()
], ImpiantoOverviewCard.prototype, "_stufa", 2);
__decorateClass([
  r5()
], ImpiantoOverviewCard.prototype, "_waited", 2);
__decorateClass([
  r5()
], ImpiantoOverviewCard.prototype, "_loadInfo", 2);
customElements.define(CARD_TAG2, ImpiantoOverviewCard);

// src/schedule-logic.ts
var STEP_MIN = 10;
var DAY_SLUGS = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"];
var DAY_SHORT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
var DAY_LONG = ["Luned\xEC", "Marted\xEC", "Mercoled\xEC", "Gioved\xEC", "Venerd\xEC", "Sabato", "Domenica"];
var PROGRAMS = [1, 2, 3, 4];
var DAY_ALIASES = {};
[
  ["lun", "mon", "lunedi", "monday"],
  ["mar", "tue", "martedi", "tuesday"],
  ["mer", "wed", "mercoledi", "wednesday"],
  ["gio", "thu", "giovedi", "thursday"],
  ["ven", "fri", "venerdi", "friday"],
  ["sab", "sat", "sabato", "saturday"],
  ["dom", "sun", "domenica", "sunday"]
].forEach((names, i5) => names.forEach((n5) => DAY_ALIASES[n5] = i5));
function dayIndex(name) {
  if (typeof name === "number") return name >= 0 && name <= 6 ? name : null;
  const k2 = name.trim().toLowerCase().replace("\xEC", "i");
  return k2 in DAY_ALIASES ? DAY_ALIASES[k2] : null;
}
function parseTimeState(state) {
  if (!state) return null;
  const m2 = /^(\d{1,2}):(\d{2})/.exec(state);
  if (!m2) return null;
  const h3 = Number(m2[1]);
  const min = Number(m2[2]);
  if (h3 > 24 || min > 59) return null;
  return h3 * 60 + min;
}
function formatHM(minutes) {
  if (minutes === null || minutes === void 0 || Number.isNaN(minutes)) return "--:--";
  const m2 = (minutes % 1440 + 1440) % 1440;
  return `${String(Math.floor(m2 / 60)).padStart(2, "0")}:${String(m2 % 60).padStart(2, "0")}`;
}
function hmToMinutes(hm) {
  const m2 = parseTimeState(hm);
  if (m2 === null) return null;
  return Math.min(1440, Math.round(m2 / STEP_MIN) * STEP_MIN);
}
function toTimeValue(minutes) {
  return `${formatHM(minutes)}:00`;
}
function programEntityIds(prefix, n5) {
  return {
    on: `time.${prefix}_crono_p${n5}_accensione`,
    off: `time.${prefix}_crono_p${n5}_spegnimento`,
    setBoiler: `number.${prefix}_crono_p${n5}_setpoint_boiler`,
    setWater: `number.${prefix}_crono_p${n5}_setpoint_acqua`,
    day: DAY_SLUGS.map((d3) => `switch.${prefix}_crono_p${n5}_${d3}`)
  };
}
function hasWindow(p3) {
  return p3.on !== null && p3.off !== null && p3.on !== p3.off;
}
function segmentsOnDay(p3, d3) {
  const out = [];
  if (!hasWindow(p3)) return out;
  const on2 = p3.on;
  const off2 = p3.off;
  if (p3.days[d3]) {
    if (off2 === 0 || off2 > on2) out.push({ start: on2, end: off2 === 0 ? 1440 : off2 });
    else out.push({ start: on2, end: 1440 });
  }
  const prev = (d3 + 6) % 7;
  if (p3.days[prev] && off2 > 0 && off2 < on2) out.push({ start: 0, end: off2 });
  return out;
}
function findOverlaps(programs) {
  const found = [];
  for (let d3 = 0; d3 < 7; d3++) {
    for (let i5 = 0; i5 < programs.length; i5++) {
      for (let j = i5 + 1; j < programs.length; j++) {
        for (const sa of segmentsOnDay(programs[i5], d3)) {
          for (const sb of segmentsOnDay(programs[j], d3)) {
            const start = Math.max(sa.start, sb.start);
            const end = Math.min(sa.end, sb.end);
            if (start < end) found.push({ day: d3, a: programs[i5].n, b: programs[j].n, start, end });
          }
        }
      }
    }
  }
  return found;
}
function describeOverlaps(overlaps) {
  const byPair = /* @__PURE__ */ new Map();
  for (const o6 of overlaps) {
    const key = `${o6.a}-${o6.b}`;
    byPair.set(key, [...byPair.get(key) ?? [], o6]);
  }
  const lines = [];
  for (const [key, list] of byPair) {
    const [a3, b3] = key.split("-");
    const days = [...new Set(list.map((o6) => DAY_SHORT[o6.day]))].join(", ");
    const first = list[0];
    lines.push(`P${a3} e P${b3} si sovrappongono (${days}) dalle ${formatHM(first.start)} alle ${formatHM(first.end)}`);
  }
  return lines;
}
var DEFAULT_PRESETS = [
  {
    name: "Settimana tipo",
    icon: "mdi:calendar-week",
    description: "Feriale mattina e sera, weekend tutto il giorno",
    crono: true,
    programs: {
      "1": { on: "05:30", off: "08:00", days: ["lun", "mar", "mer", "gio", "ven"] },
      "2": { on: "17:00", off: "22:30", days: ["lun", "mar", "mer", "gio", "ven"] },
      "3": { on: "07:30", off: "23:00", days: ["sab", "dom"] },
      "4": null
    }
  },
  {
    name: "Feriale",
    icon: "mdi:briefcase-outline",
    description: "Mattina e sera, tutti i giorni",
    crono: true,
    programs: {
      "1": { on: "05:30", off: "08:00", days: ["lun", "mar", "mer", "gio", "ven", "sab", "dom"] },
      "2": { on: "17:00", off: "22:30", days: ["lun", "mar", "mer", "gio", "ven", "sab", "dom"] },
      "3": null,
      "4": null
    }
  },
  {
    name: "Weekend",
    icon: "mdi:home-heart",
    description: "Sempre acceso dalle 7 alle 23, tutti i giorni",
    crono: true,
    programs: {
      "1": { on: "07:00", off: "23:00", days: ["lun", "mar", "mer", "gio", "ven", "sab", "dom"] },
      "2": null,
      "3": null,
      "4": null
    }
  },
  {
    name: "Vacanza",
    icon: "mdi:palm-tree",
    description: "Cronotermostato disattivato, i programmi restano salvati",
    crono: false
  }
];
function planPreset(input, preset) {
  const actions = [];
  for (const n5 of PROGRAMS) {
    const raw = preset.programs?.[String(n5)];
    if (raw === void 0) continue;
    const pp = raw === null ? { days: [] } : raw;
    const cur = input.programs.find((p3) => p3.n === n5);
    if (!cur) continue;
    const ids = programEntityIds(input.prefix, n5);
    const tag = `P${n5}`;
    if (pp.on !== void 0) {
      const m2 = hmToMinutes(pp.on);
      if (m2 !== null && m2 !== cur.on)
        actions.push({ domain: "time", service: "set_value", entity_id: ids.on, data: { time: toTimeValue(m2) }, label: `${tag} accensione ${formatHM(m2)}` });
    }
    if (pp.off !== void 0) {
      const m2 = hmToMinutes(pp.off);
      if (m2 !== null && m2 !== cur.off)
        actions.push({ domain: "time", service: "set_value", entity_id: ids.off, data: { time: toTimeValue(m2) }, label: `${tag} spegnimento ${formatHM(m2)}` });
    }
    if (pp.set_boiler !== void 0 && pp.set_boiler !== cur.setBoiler)
      actions.push({ domain: "number", service: "set_value", entity_id: ids.setBoiler, data: { value: pp.set_boiler }, label: `${tag} set boiler ${pp.set_boiler} \xB0C` });
    if (pp.set_water !== void 0 && pp.set_water !== cur.setWater)
      actions.push({ domain: "number", service: "set_value", entity_id: ids.setWater, data: { value: pp.set_water }, label: `${tag} set acqua ${pp.set_water} \xB0C` });
    if (pp.days !== void 0) {
      const wanted = new Set(pp.days.map((d3) => dayIndex(d3)).filter((d3) => d3 !== null));
      for (let d3 = 0; d3 < 7; d3++) {
        const want = wanted.has(d3);
        if (cur.days[d3] !== want)
          actions.push({
            domain: "switch",
            service: want ? "turn_on" : "turn_off",
            entity_id: ids.day[d3],
            data: {},
            label: `${tag} ${DAY_SHORT[d3]} ${want ? "attivo" : "spento"}`
          });
      }
    }
  }
  if (preset.crono !== void 0 && input.cronoOn !== preset.crono)
    actions.push({
      domain: "switch",
      service: preset.crono ? "turn_on" : "turn_off",
      entity_id: input.master,
      data: {},
      label: `Cronotermostato ${preset.crono ? "attivo" : "disattivato"}`
    });
  return actions;
}
var SAVED_PRESETS_KEY = "impianto_riscaldamento_presets";
function formatDays(days) {
  const on2 = days.map((d3, i5) => d3 ? i5 : -1).filter((i5) => i5 >= 0);
  if (on2.length === 0) return "nessun giorno";
  if (on2.length === 7) return "tutti i giorni";
  const runs = [];
  for (const i5 of on2) {
    const last = runs[runs.length - 1];
    if (last && last[1] === i5 - 1) last[1] = i5;
    else runs.push([i5, i5]);
  }
  return runs.map(([a3, b3]) => a3 === b3 ? DAY_SHORT[a3] : b3 === a3 + 1 ? `${DAY_SHORT[a3]}, ${DAY_SHORT[b3]}` : `${DAY_SHORT[a3]}\u2013${DAY_SHORT[b3]}`).join(", ");
}
function describeProgram(p3) {
  const when = `${formatHM(p3.on)}\u2013${formatHM(p3.off)}`;
  const temps = [
    p3.setBoiler !== null ? `Set boiler ${p3.setBoiler} \xB0C` : null,
    p3.setWater !== null ? `Set acqua ${p3.setWater} \xB0C` : null
  ].filter(Boolean).join(", ");
  return `P${p3.n} ${when} \xB7 ${formatDays(p3.days)}${temps ? ` \xB7 ${temps}` : ""}`;
}
function snapshotPreset(name, programs, cronoOn, base, now = /* @__PURE__ */ new Date()) {
  const out = {};
  for (const n5 of PROGRAMS) {
    const p3 = programs.find((x2) => x2.n === n5);
    if (!p3) continue;
    const pp = { days: p3.days.map((on2, i5) => on2 ? DAY_SHORT[i5].toLowerCase() : "").filter(Boolean) };
    if (p3.on !== null) pp.on = formatHM(p3.on);
    if (p3.off !== null) pp.off = formatHM(p3.off);
    if (p3.setBoiler !== null) pp.set_boiler = p3.setBoiler;
    if (p3.setWater !== null) pp.set_water = p3.setWater;
    out[String(n5)] = pp;
  }
  const d3 = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  const preset = {
    name: name.trim(),
    icon: base?.icon ?? "mdi:bookmark-outline",
    description: `Salvato il ${d3}`,
    programs: out
  };
  if (cronoOn !== null) preset.crono = cronoOn;
  return preset;
}
function mergePresets(base, saved) {
  const out = base.map((b3) => saved.find((s4) => s4.name === b3.name) ?? b3);
  for (const s4 of saved) if (!base.some((b3) => b3.name === s4.name)) out.push(s4);
  return out;
}
function upsertSaved(saved, preset) {
  const i5 = saved.findIndex((s4) => s4.name === preset.name);
  return i5 >= 0 ? saved.map((s4, k2) => k2 === i5 ? preset : s4) : [...saved, preset];
}
function removeSaved(saved, name) {
  return saved.filter((s4) => s4.name !== name);
}
function sanitizeSaved(raw) {
  const list = raw?.presets;
  if (!Array.isArray(list)) return [];
  return list.filter((p3) => !!p3 && typeof p3 === "object" && typeof p3.name === "string" && p3.name.trim() !== "");
}

// src/schedule-card.ts
var CARD_TAG3 = "caldaia-schedule-card";
var COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7"];
var CaldaiaScheduleCard = class extends i4 {
  constructor() {
    super(...arguments);
    this._pending = {};
    this._confirm = null;
    this._saved = [];
    this._saving = null;
    this._savedRequested = false;
    this._busy = null;
    this._message = null;
  }
  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("caldaia-schedule-card: configurazione non valida");
    this._config = { prefix: "casale", ...config };
  }
  getCardSize() {
    return 12;
  }
  static getStubConfig() {
    return { type: `custom:${CARD_TAG3}` };
  }
  connectedCallback() {
    super.connectedCallback();
    this._tick = window.setInterval(() => this.requestUpdate(), 6e4);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._tick) window.clearInterval(this._tick);
  }
  // ---- lettura dello stato -------------------------------------------------
  get _prefix() {
    return this._config.prefix ?? "casale";
  }
  get _master() {
    return this._config.master ?? `switch.${this._prefix}_cronotermostato_settimanale`;
  }
  get _status() {
    return this._config.status ?? `sensor.${this._prefix}_stato`;
  }
  _programs() {
    return PROGRAMS.map((n5) => {
      const ids = programEntityIds(this._prefix, n5);
      const st = (id) => this.hass.states[id]?.state;
      return {
        n: n5,
        on: parseTimeState(st(ids.on)),
        off: parseTimeState(st(ids.off)),
        days: ids.day.map((d3) => st(d3) === "on"),
        setBoiler: toNumber(st(ids.setBoiler)),
        setWater: toNumber(st(ids.setWater))
      };
    });
  }
  _cronoOn() {
    const s4 = this.hass.states[this._master]?.state;
    return s4 === "on" ? true : s4 === "off" ? false : null;
  }
  // ---- scritture ------------------------------------------------------------
  async _call(a3) {
    await this.hass.callService(a3.domain, a3.service, { entity_id: a3.entity_id, ...a3.data });
  }
  _markPending(entityId) {
    this._pending = { ...this._pending, [entityId]: Date.now() + 2e4 };
    window.setTimeout(() => {
      const { [entityId]: _drop, ...rest } = this._pending;
      this._pending = rest;
    }, 2e4);
  }
  async _run(action) {
    this._message = null;
    this._markPending(action.entity_id);
    try {
      await this._call(action);
    } catch (err) {
      this._message = { kind: "err", text: `Non riuscito: ${action.label} (${err.message ?? err})` };
    }
  }
  _setTime(n5, which, value) {
    const m2 = hmToMinutes(value);
    if (m2 === null) return;
    const ids = programEntityIds(this._prefix, n5);
    void this._run({
      domain: "time",
      service: "set_value",
      entity_id: which === "on" ? ids.on : ids.off,
      data: { time: toTimeValue(m2) },
      label: `P${n5} ${which === "on" ? "accensione" : "spegnimento"} ${formatHM(m2)}`
    });
  }
  _setNumber(n5, which, raw) {
    const v2 = Number(raw);
    if (!Number.isFinite(v2)) return;
    const ids = programEntityIds(this._prefix, n5);
    void this._run({
      domain: "number",
      service: "set_value",
      entity_id: which === "setBoiler" ? ids.setBoiler : ids.setWater,
      data: { value: v2 },
      label: `P${n5} ${which === "setBoiler" ? "set boiler" : "set acqua"} ${v2} \xB0C`
    });
  }
  _toggleDay(n5, d3, isOn) {
    const ids = programEntityIds(this._prefix, n5);
    void this._run({
      domain: "switch",
      service: isOn ? "turn_off" : "turn_on",
      entity_id: ids.day[d3],
      data: {},
      label: `P${n5} ${DAY_SHORT[d3]} ${isOn ? "spento" : "attivo"}`
    });
  }
  _toggleMaster() {
    const on2 = this._cronoOn();
    void this._run({
      domain: "switch",
      service: on2 ? "turn_off" : "turn_on",
      entity_id: this._master,
      data: {},
      label: `Cronotermostato ${on2 ? "disattivato" : "attivo"}`
    });
  }
  get _presets() {
    const base = this._config.presets && this._config.presets.length ? this._config.presets : DEFAULT_PRESETS;
    return mergePresets(base, this._saved);
  }
  get _basePresets() {
    return this._config.presets && this._config.presets.length ? this._config.presets : DEFAULT_PRESETS;
  }
  updated(changed) {
    if (changed.has("hass") && this.hass && !this._savedRequested) {
      this._savedRequested = true;
      void this._loadSaved();
    }
  }
  _ws(msg) {
    const cw = this.hass.callWS;
    return cw ? cw.call(this.hass, msg) : Promise.reject(new Error("callWS non disponibile"));
  }
  async _loadSaved() {
    try {
      const r6 = await this._ws({ type: "frontend/get_user_data", key: SAVED_PRESETS_KEY });
      this._saved = sanitizeSaved(r6?.value);
    } catch {
      this._saved = [];
    }
  }
  async _persistSaved(next) {
    await this._ws({ type: "frontend/set_user_data", key: SAVED_PRESETS_KEY, value: { version: 1, presets: next } });
    this._saved = next;
  }
  _openSave() {
    this._confirm = null;
    this._message = null;
    this._saving = { target: "__new__", newName: "" };
  }
  async _doSave() {
    const sv = this._saving;
    if (!sv) return;
    const isNew = sv.target === "__new__";
    const name = isNew ? sv.newName.trim() : sv.target;
    if (!name) return;
    const base = this._presets.find((p3) => p3.name === name);
    const preset = snapshotPreset(name, this._programs(), this._cronoOn(), base);
    try {
      await this._persistSaved(upsertSaved(this._saved, preset));
      this._saving = null;
      this._message = { kind: "ok", text: `Preset "${name}" salvato con la programmazione attuale (orari, giorni, temperature e cronotermostato).` };
    } catch (err) {
      this._message = { kind: "err", text: `Non sono riuscito a salvare: ${err.message ?? err}` };
    }
  }
  async _deleteSaved(name) {
    const isDefault = this._basePresets.some((p3) => p3.name === name);
    try {
      await this._persistSaved(removeSaved(this._saved, name));
      this._message = { kind: "ok", text: isDefault ? `Preset "${name}" ripristinato com'era in origine.` : `Preset "${name}" eliminato.` };
      if (this._saving?.target === name) this._saving = { target: "__new__", newName: "" };
    } catch (err) {
      this._message = { kind: "err", text: `Non sono riuscito a eliminare: ${err.message ?? err}` };
    }
  }
  _plan(preset) {
    return planPreset(
      { prefix: this._prefix, master: this._master, programs: this._programs(), cronoOn: this._cronoOn() },
      preset
    );
  }
  async _applyPreset(preset) {
    const plan = this._plan(preset);
    this._confirm = null;
    this._message = null;
    if (!plan.length) {
      this._message = { kind: "ok", text: `"${preset.name}" \xE8 gi\xE0 impostato.` };
      return;
    }
    for (let i5 = 0; i5 < plan.length; i5++) {
      this._busy = { done: i5, total: plan.length, label: plan[i5].label };
      try {
        await this._call(plan[i5]);
        this._markPending(plan[i5].entity_id);
      } catch (err) {
        this._busy = null;
        this._message = { kind: "err", text: `Fermato a "${plan[i5].label}": ${err.message ?? err}. Eseguite ${i5} operazioni su ${plan.length}.` };
        return;
      }
    }
    this._busy = null;
    this._message = { kind: "ok", text: `"${preset.name}" applicato (${plan.length} modifiche). La caldaia aggiorna i dati tramite il cloud: pu\xF2 servire qualche minuto.` };
  }
  // ---- disegno --------------------------------------------------------------
  _renderHeader(crono) {
    const status = this.hass.states[this._status]?.state;
    return b2`
      <div class="head">
        <div>
          <div class="title">${this._config.title ?? "Programmazione caldaia"}</div>
          <div class="sub">
            Cronotermostato settimanale · stato caldaia: <b>${status ?? "\u2013"}</b>
          </div>
        </div>
        <button
          class="master ${crono ? "on" : crono === false ? "off" : "na"}"
          @click=${() => this._toggleMaster()}
          ?disabled=${crono === null}
          title="Attiva o disattiva tutti i programmi"
        >
          <span class="knob"></span>
          <span>${crono ? "Crono attivo" : crono === false ? "Crono spento" : "n.d."}</span>
        </button>
      </div>
      ${crono === false ? b2`<div class="note">Il cronotermostato è disattivato: nessun programma parte, anche se i giorni sono attivi.</div>` : A}
    `;
  }
  _renderWarnings(programs) {
    const lines = describeOverlaps(findOverlaps(programs));
    if (!lines.length) return A;
    return b2`<div class="warn">
      <b>Attenzione, programmi sovrapposti</b>
      <ul>${lines.map((l3) => b2`<li>${l3}</li>`)}</ul>
    </div>`;
  }
  _renderSave() {
    const sv = this._saving;
    if (!sv) return A;
    const programs = this._programs();
    const crono = this._cronoOn();
    const isNew = sv.target === "__new__";
    const canSave = isNew ? sv.newName.trim() !== "" : true;
    const targetName = isNew ? sv.newName.trim() : sv.target;
    const exists = this._presets.some((p3) => p3.name === targetName);
    return b2`<div class="confirm save">
      <div><b>Salva la programmazione attuale</b></div>
      <ul>
        ${programs.map((p3) => b2`<li>${describeProgram(p3)}</li>`)}
        <li>Cronotermostato ${crono === null ? "non disponibile" : crono ? "attivo" : "spento"}</li>
      </ul>
      <div class="small">In quale preset la salvo?</div>
      <div class="targets">
        ${this._presets.map((p3) => {
      const saved = this._saved.some((x2) => x2.name === p3.name);
      const isDefault = this._basePresets.some((b3) => b3.name === p3.name);
      return b2`<div class="target">
            <label>
              <input type="radio" name="target" .checked=${sv.target === p3.name} @change=${() => this._saving = { ...sv, target: p3.name }} />
              <span>${p3.name}${saved ? b2` <small>(personalizzato)</small>` : b2` <small>(predefinito)</small>`}</span>
            </label>
            ${saved ? b2`<button class="mini" @click=${() => this._deleteSaved(p3.name)}>${isDefault ? "Ripristina" : "Elimina"}</button>` : A}
          </div>`;
    })}
        <div class="target">
          <label>
            <input type="radio" name="target" .checked=${isNew} @change=${() => this._saving = { ...sv, target: "__new__" }} />
            <span>Nuovo preset</span>
          </label>
          <input
            class="name"
            type="text"
            placeholder="Nome (per esempio Inverno)"
            maxlength="30"
            .value=${sv.newName}
            @focus=${() => this._saving = { ...sv, target: "__new__" }}
            @input=${(e5) => this._saving = { target: "__new__", newName: e5.target.value }}
          />
        </div>
      </div>
      ${canSave && targetName ? b2`<div class="small">${exists ? b2`Sostituisce il contenuto di <b>${targetName}</b>.` : b2`Crea il preset <b>${targetName}</b>.`}</div>` : A}
      <div class="row">
        <button class="primary" ?disabled=${!canSave} @click=${() => this._doSave()}>Salva</button>
        <button @click=${() => this._saving = null}>Annulla</button>
      </div>
    </div>`;
  }
  _renderPresets() {
    if (this._config.hide?.includes("presets")) return A;
    const confirm = this._confirm;
    const plan = confirm ? this._plan(confirm) : [];
    return b2`
      <div class="section">Preset</div>
      <div class="presets">
        ${this._presets.map(
      (p3) => b2`<button class="preset" ?disabled=${!!this._busy} @click=${() => {
        this._saving = null;
        this._confirm = p3;
      }} title=${p3.description ?? ""}>
            ${p3.icon ? b2`<ha-icon .icon=${p3.icon}></ha-icon>` : A}<span>${p3.name}</span>
          </button>`
    )}
        <button class="preset save" ?disabled=${!!this._busy} @click=${() => this._openSave()} title="Salva la programmazione attuale come preset">
          <ha-icon icon="mdi:content-save-outline"></ha-icon><span>Salva…</span>
        </button>
      </div>
      ${this._renderSave()}
      ${confirm ? b2`<div class="confirm">
            <div><b>${confirm.name}</b>${confirm.description ? b2` · ${confirm.description}` : A}</div>
            ${plan.length ? b2`<div class="small">${plan.length} modifiche:</div>
                  <ul>${plan.slice(0, 12).map((a3) => b2`<li>${a3.label}</li>`)}${plan.length > 12 ? b2`<li>… e altre ${plan.length - 12}</li>` : A}</ul>` : b2`<div class="small">Già impostato, non c'è niente da cambiare.</div>`}
            <div class="row">
              <button class="primary" @click=${() => this._applyPreset(confirm)}>Applica</button>
              <button @click=${() => this._confirm = null}>Annulla</button>
            </div>
          </div>` : A}
      ${this._busy ? b2`<div class="busy">
            <div class="bar"><div style="width:${this._busy.done / this._busy.total * 100}%"></div></div>
            ${this._busy.done + 1}/${this._busy.total} · ${this._busy.label}
          </div>` : A}
      ${this._message ? b2`<div class="msg ${this._message.kind}">${this._message.text}</div>` : A}
    `;
  }
  _renderProgram(p3) {
    const ids = programEntityIds(this._prefix, p3.n);
    const color = COLORS[p3.n - 1];
    const active = p3.days.some(Boolean);
    const pend = (id) => this._pending[id] ? "pending" : "";
    const numAttr = (id, key, dflt) => {
      const v2 = this.hass.states[id]?.attributes?.[key];
      return typeof v2 === "number" ? v2 : dflt;
    };
    const timeVal = (m2) => m2 === null ? "" : formatHM(m2);
    return b2`
      <div class="prog" style="--c:${color}">
        <div class="prog-head">
          <b>Programma ${p3.n}</b>
          <span class="badge ${active ? "yes" : "no"}">${active ? "attivo" : "nessun giorno"}</span>
        </div>
        <div class="times">
          <label class=${pend(ids.on)}>
            <span>Accensione</span>
            <input type="time" step="600" .value=${timeVal(p3.on)} @change=${(e5) => this._setTime(p3.n, "on", e5.target.value)} />
          </label>
          <label class=${pend(ids.off)}>
            <span>Spegnimento</span>
            <input type="time" step="600" .value=${timeVal(p3.off === 1440 ? 0 : p3.off)} @change=${(e5) => this._setTime(p3.n, "off", e5.target.value)} />
          </label>
        </div>
        <div class="days">
          ${DAY_SHORT.map(
      (name, d3) => b2`<button
              class="day ${p3.days[d3] ? "on" : ""} ${pend(ids.day[d3])}"
              title=${DAY_LONG[d3]}
              aria-pressed=${p3.days[d3]}
              @click=${() => this._toggleDay(p3.n, d3, p3.days[d3])}
            >${name}</button>`
    )}
        </div>
        <div class="temps">
          <label class=${pend(ids.setBoiler)}>
            <span>Set boiler</span>
            <span class="num"><input type="number" min=${numAttr(ids.setBoiler, "min", 45)} max=${numAttr(ids.setBoiler, "max", 70)} step=${numAttr(ids.setBoiler, "step", 1)} .value=${p3.setBoiler === null ? "" : String(p3.setBoiler)} @change=${(e5) => this._setNumber(p3.n, "setBoiler", e5.target.value)} /> °C</span>
          </label>
          <label class=${pend(ids.setWater)}>
            <span>Set acqua</span>
            <span class="num"><input type="number" min=${numAttr(ids.setWater, "min", 50)} max=${numAttr(ids.setWater, "max", 75)} step=${numAttr(ids.setWater, "step", 1)} .value=${p3.setWater === null ? "" : String(p3.setWater)} @change=${(e5) => this._setNumber(p3.n, "setWater", e5.target.value)} /> °C</span>
          </label>
        </div>
      </div>
    `;
  }
  _renderWeekly(programs) {
    if (this._config.hide?.includes("weekly")) return A;
    const overlaps = findOverlaps(programs);
    const now = /* @__PURE__ */ new Date();
    const today = (now.getDay() + 6) % 7;
    const nowPct = (now.getHours() * 60 + now.getMinutes()) / 1440 * 100;
    const ticks = [0, 3, 6, 9, 12, 15, 18, 21, 24];
    return b2`
      <div class="section">Vista settimanale</div>
      <div class="weekly">
        <div class="axis">${ticks.map((h3) => b2`<span style="left:${h3 / 24 * 100}%">${h3}</span>`)}</div>
        ${DAY_SHORT.map((name, d3) => {
      const bars = programs.flatMap((p3) => segmentsOnDay(p3, d3).map((s4) => ({ p: p3.n, ...s4 })));
      const ov = overlaps.filter((o6) => o6.day === d3);
      return b2`<div class="wrow ${d3 === today ? "today" : ""}">
            <span class="wlabel">${name}</span>
            <div class="track">
              ${ticks.slice(1, -1).map((h3) => b2`<i class="grid" style="left:${h3 / 24 * 100}%"></i>`)}
              ${bars.map(
        (b3) => b2`<div class="bar" style="left:${b3.start / 1440 * 100}%;width:${(b3.end - b3.start) / 1440 * 100}%;background:${COLORS[b3.p - 1]}" title="P${b3.p} ${formatHM(b3.start)}–${formatHM(b3.end)}"></div>`
      )}
              ${ov.map((o6) => b2`<div class="bar clash" style="left:${o6.start / 1440 * 100}%;width:${(o6.end - o6.start) / 1440 * 100}%"></div>`)}
              ${d3 === today ? b2`<div class="now" style="left:${nowPct}%"></div>` : A}
            </div>
          </div>`;
    })}
        <div class="legend">
          ${PROGRAMS.map((n5) => b2`<span><i style="background:${COLORS[n5 - 1]}"></i>P${n5}</span>`)}
          <span><i class="clashkey"></i>sovrapposizione</span>
        </div>
      </div>
    `;
  }
  render() {
    if (!this._config || !this.hass) return A;
    const programs = this._programs();
    const crono = this._cronoOn();
    return b2`
      <ha-card>
        <div class="wrap">
          ${this._renderHeader(crono)} ${this._renderWarnings(programs)} ${this._renderPresets()}
          <div class="section">Programmi</div>
          <div class="grid">${programs.map((p3) => this._renderProgram(p3))}</div>
          ${this._renderWeekly(programs)}
        </div>
      </ha-card>
    `;
  }
  static {
    this.styles = i`
    :host {
      display: block;
    }
    .wrap {
      padding: 16px;
      color: var(--primary-text-color);
    }
    .head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
    }
    .sub {
      color: var(--secondary-text-color);
      font-size: 13px;
      margin-top: 2px;
    }
    .section {
      margin: 18px 0 8px;
      font-weight: 700;
      font-size: 14px;
    }
    button {
      font: inherit;
      color: inherit;
      cursor: pointer;
    }
    .master {
      display: flex;
      align-items: center;
      gap: 10px;
      border: none;
      border-radius: 22px;
      padding: 8px 16px 8px 10px;
      font-weight: 700;
      font-size: 14px;
      background: var(--secondary-background-color);
    }
    .master .knob {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--disabled-text-color, #94a3b8);
    }
    .master.on {
      background: color-mix(in srgb, var(--success-color, #22c55e) 25%, transparent);
      color: var(--success-color, #16a34a);
    }
    .master.on .knob {
      background: var(--success-color, #22c55e);
    }
    .master.off {
      color: var(--secondary-text-color);
    }
    .note {
      margin-top: 10px;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 13px;
      background: color-mix(in srgb, var(--warning-color, #f59e0b) 18%, transparent);
    }
    .warn {
      margin-top: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid var(--error-color, #ef4444);
      background: color-mix(in srgb, var(--error-color, #ef4444) 12%, transparent);
      font-size: 13px;
    }
    .warn ul,
    .confirm ul {
      margin: 6px 0 0;
      padding-left: 18px;
    }
    .presets {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .preset {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid var(--divider-color);
      background: var(--secondary-background-color);
      border-radius: 20px;
      padding: 8px 14px;
      font-size: 14px;
    }
    .preset:hover:not(:disabled) {
      border-color: var(--primary-color);
    }
    .preset:disabled {
      opacity: 0.5;
      cursor: default;
    }
    .confirm.save .targets {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 6px 0;
    }
    .target {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 4px 0;
      border-bottom: 1px solid var(--divider-color);
    }
    .target label {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
      color: var(--primary-text-color);
      text-transform: none;
      letter-spacing: 0;
    }
    .target label small {
      color: var(--secondary-text-color);
      font-size: 12px;
    }
    .target input[type="radio"] {
      width: auto;
      margin: 0;
    }
    .target input.name {
      flex: 1;
      min-width: 0;
      max-width: 240px;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
    }
    .mini {
      font-size: 12px;
      padding: 4px 10px;
    }
    .confirm {
      margin-top: 10px;
      padding: 12px;
      border-radius: 12px;
      background: var(--secondary-background-color);
      font-size: 14px;
    }
    .small {
      color: var(--secondary-text-color);
      font-size: 12px;
      margin-top: 4px;
    }
    .row {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }
    .row button {
      border: 1px solid var(--divider-color);
      background: transparent;
      border-radius: 8px;
      padding: 6px 14px;
    }
    .row button.primary {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .busy {
      margin-top: 10px;
      font-size: 13px;
    }
    .busy .bar {
      height: 6px;
      border-radius: 3px;
      background: var(--divider-color);
      margin-bottom: 4px;
      overflow: hidden;
    }
    .busy .bar div {
      height: 100%;
      background: var(--primary-color);
      transition: width 0.3s;
    }
    .msg {
      margin-top: 10px;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 13px;
    }
    .msg.ok {
      background: color-mix(in srgb, var(--success-color, #22c55e) 18%, transparent);
    }
    .msg.err {
      background: color-mix(in srgb, var(--error-color, #ef4444) 18%, transparent);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
      gap: 12px;
    }
    .prog {
      border: 1px solid var(--divider-color);
      border-left: 6px solid var(--c);
      border-radius: 14px;
      padding: 12px 14px;
      background: var(--secondary-background-color);
    }
    .prog-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .badge {
      font-size: 12px;
      border-radius: 12px;
      padding: 2px 10px;
      font-weight: 700;
    }
    .badge.yes {
      background: color-mix(in srgb, var(--success-color, #22c55e) 25%, transparent);
      color: var(--success-color, #16a34a);
    }
    .badge.no {
      background: var(--divider-color);
      color: var(--secondary-text-color);
    }
    .times,
    .temps {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    label {
      display: flex;
      flex-direction: column;
      font-size: 11px;
      color: var(--secondary-text-color);
      gap: 3px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .temps label {
      margin-top: 10px;
      text-transform: none;
      font-size: 12px;
    }
    input {
      font: inherit;
      font-size: 22px;
      font-weight: 700;
      color: var(--primary-text-color);
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 4px 8px;
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
    }
    input[type="number"] {
      font-size: 17px;
      width: 4.2em;
    }
    .num {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--primary-text-color);
      font-weight: 700;
    }
    input:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    label.pending input,
    label.pending {
      opacity: 0.55;
    }
    .days {
      display: flex;
      gap: 6px;
      margin: 12px 0 2px;
    }
    .day {
      flex: 1;
      min-width: 0;
      aspect-ratio: 1;
      max-height: 40px;
      border-radius: 50%;
      border: none;
      font-size: 12px;
      font-weight: 600;
      background: var(--divider-color);
      color: var(--secondary-text-color);
    }
    .day.on {
      background: var(--c);
      color: #fff;
    }
    .day.pending {
      opacity: 0.5;
    }
    .weekly {
      position: relative;
    }
    .axis {
      position: relative;
      height: 14px;
      margin-left: 38px;
      font-size: 10px;
      color: var(--secondary-text-color);
    }
    .axis span {
      position: absolute;
      transform: translateX(-50%);
    }
    .wrow {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
    }
    .wlabel {
      width: 32px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .wrow.today .wlabel {
      color: var(--primary-text-color);
      font-weight: 700;
    }
    .track {
      position: relative;
      flex: 1;
      height: 20px;
      border-radius: 6px;
      background: var(--secondary-background-color);
      overflow: hidden;
    }
    .track .grid {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 1px;
      background: var(--divider-color);
      display: block;
      padding: 0;
    }
    .track .bar {
      position: absolute;
      top: 0;
      bottom: 0;
      border-radius: 4px;
      opacity: 0.92;
    }
    .track .bar.clash {
      background: repeating-linear-gradient(45deg, var(--error-color, #ef4444) 0 4px, transparent 4px 8px);
      border: 1px solid var(--error-color, #ef4444);
      opacity: 1;
    }
    .now {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--primary-text-color);
      opacity: 0.8;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin: 10px 0 0 38px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .legend i {
      display: inline-block;
      width: 11px;
      height: 11px;
      border-radius: 3px;
      margin-right: 5px;
      vertical-align: -1px;
    }
    .legend i.clashkey {
      background: repeating-linear-gradient(45deg, var(--error-color, #ef4444) 0 3px, transparent 3px 6px);
      border: 1px solid var(--error-color, #ef4444);
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], CaldaiaScheduleCard.prototype, "hass", 2);
__decorateClass([
  r5()
], CaldaiaScheduleCard.prototype, "_config", 2);
__decorateClass([
  r5()
], CaldaiaScheduleCard.prototype, "_pending", 2);
__decorateClass([
  r5()
], CaldaiaScheduleCard.prototype, "_confirm", 2);
__decorateClass([
  r5()
], CaldaiaScheduleCard.prototype, "_saved", 2);
__decorateClass([
  r5()
], CaldaiaScheduleCard.prototype, "_saving", 2);
__decorateClass([
  r5()
], CaldaiaScheduleCard.prototype, "_busy", 2);
__decorateClass([
  r5()
], CaldaiaScheduleCard.prototype, "_message", 2);
customElements.define(CARD_TAG3, CaldaiaScheduleCard);

// src/impianto-riscaldamento-dashboard.ts
var VERSION = "0.5.0";
window.customCards = window.customCards || [];
window.customCards.push(
  {
    type: "impianto-overview-card",
    name: "Impianto: boiler solare e caldaia",
    description: "Boiler solare con temperature alta e bassa, docce stimate, puffer e caldaia a pellet con i dati principali."
  },
  {
    type: "impianto-rooms-card",
    name: "Stanze: temperatura e umidit\xE0",
    description: "Temperatura e umidit\xE0 di ogni stanza in colonne affiancate, con l'obiettivo del termostato e i grafici al tocco."
  },
  {
    type: "caldaia-schedule-card",
    name: "Caldaia: programmazione settimanale",
    description: "4 programmi, giorni, orari e temperature, vista settimanale, avviso di sovrapposizione e preset."
  }
);
console.info(
  `%c IMPIANTO-RISCALDAMENTO-DASHBOARD %c v${VERSION} `,
  "color: white; background: #b45309; font-weight: 700;",
  "color: #b45309; background: white; font-weight: 700;"
);
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/custom-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/property.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/state.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/event-options.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/base.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-all.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-async.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
