# layerStack Duplicate Entry — Minimal Reproduction

## Bug

When a `Dialog` from `@ark-ui/react` is rendered with `open={true}` on mount (i.e., not opened via user interaction), the dialog content element gets incorrect `data-has-nested="dialog"` and `data-nested` attributes in React Strict Mode — as if a nested dialog were open, even though only a single dialog exists in the DOM.

This results in:
- `--layer-index: 1` instead of `0`
- `data-has-nested="dialog"` set on the only dialog
- `--nested-layer-count: 1` instead of `0`

In production mode (Strict Mode disabled), the bug does not occur. It seems like `layerStack` ends up with two entries for the same DOM node, likely caused by React Strict Mode's double-invocation of effects where the cleanup doesn't fully undo the first `layerStack.add()` call.

## Steps to Reproduce

```sh
npm install
npm run dev
```

1. Open http://localhost:5173
2. Click **"Mount always-open dialog"**
3. Inspect the `[data-scope="dialog"][data-part="content"]` element in DevTools
4. Observe: `data-has-nested="dialog"`, `--layer-index: 1`, `--nested-layer-count: 1`
5. The in-app inspector confirms the bug

## Expected Behavior

A single open dialog should have:
- `--layer-index: 0`
- `--nested-layer-count: 0`
- No `data-has-nested` attribute

## Versions

- `@ark-ui/react`: 5.36.0
- `@zag-js/dismissable`: 1.39.1
- `@zag-js/react`: 1.39.1
- `react`: 19.x (Strict Mode enabled)
- `vite`: 6.x
