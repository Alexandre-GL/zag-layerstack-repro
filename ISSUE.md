# 🐛 Bug report

When rendering a Dialog with `open={true}` on mount in React Strict Mode, the dialog content element gets incorrect `data-has-nested="dialog"` and `data-nested` attributes, as if a nested dialog were open — even though only a single dialog exists in the DOM.

## 💥 Steps to reproduce

1. Render a `<Dialog.Root open>` that mounts with `open={true}` (controlled, not triggered by user interaction)
2. Run in React development mode (Strict Mode enabled)
3. Inspect the `[data-scope="dialog"][data-part="content"]` element

**Observed:**
- `data-has-nested="dialog"` is set on the only dialog in the DOM
- `--layer-index: 1` instead of `0`
- `--nested-layer-count: 1` instead of `0`

**In production mode** (Strict Mode disabled), the bug does not occur.

## 💻 Link to reproduction

https://codesandbox.io/p/devbox/github/Alexandre-GL/zag-layerstack-repro/main

GitHub repo: https://github.com/Alexandre-GL/zag-layerstack-repro

```sh
git clone <repo>
npm install
npm run dev
# Open http://localhost:5173, click "Mount always-open dialog"
```

## 🧐 Expected behavior

A single open dialog should have:
- `--layer-index: 0`
- `--nested-layer-count: 0`
- No `data-has-nested` attribute

## 🧭 Possible Solution

It seems like `layerStack` ends up with two entries for the same DOM node. This is likely caused by React Strict Mode's double-invocation of effects, where the cleanup doesn't fully undo the first `layerStack.add()` call before the second one runs.

A possible fix would be to add a deduplication guard in `layerStack.add()`:

```ts
// packages/utilities/dismissable/src/layer-stack.ts
add(layer: Layer) {
  const existingIndex = this.indexOf(layer.node);
  if (existingIndex !== -1) {
    this.layers.splice(existingIndex, 1);
  }
  this.layers.push(layer);
  this.syncLayers();
},
```

This way, if the same DOM node is added again, the previous entry is removed first — making `add()` idempotent.

## 🌍 System information

| Software         | Version    |
| ---------------- | ---------- |
| Zag Version      | 1.39.1     |
| Browser          | Chrome 137 |
| Operating System | Linux      |

Tested via `@ark-ui/react@5.36.0` which depends on `@zag-js/*@1.39.1`.

## 📝 Additional information

This affects any dialog opened programmatically with `open={true}` on mount (e.g., route-driven dialogs, fullpage dialog views). It can cause visual issues if styles depend on `data-has-nested` (e.g., dimming the parent dialog content).

We are currently working around this with a `pnpm patch` on `@zag-js/dismissable` using the deduplication guard above. Happy to open a PR if that approach looks right.
