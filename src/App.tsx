import { useEffect, useState } from 'react'
import { Dialog } from '@ark-ui/react/dialog'
import { Portal } from '@ark-ui/react/portal'

/**
 * Minimal reproduction: layerStack duplicate entry in React Strict Mode
 */

function AlwaysOpenDialog() {
  return (
    <Dialog.Root open>
      <Portal>
        <Dialog.Backdrop
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
          }}
        />
        <Dialog.Positioner
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
        >
          <Dialog.Content
            style={{
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 24,
              minWidth: 400,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <Dialog.Title>Always-Open Dialog</Dialog.Title>
            <Dialog.Description style={{ marginTop: 8, color: '#666' }}>
              This dialog is rendered with <code>open=&#123;true&#125;</code> on mount.
            </Dialog.Description>
            <LayerStackInspector />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

function LayerStackInspector() {
  const [info, setInfo] = useState<string>('Checking...')

  useEffect(() => {
    const timer = setTimeout(() => {
      const contentEl = document.querySelector('[data-scope="dialog"][data-part="content"]')
      if (!contentEl) {
        setInfo('No dialog content element found')
        return
      }

      const layerIndex = (contentEl as HTMLElement).style.getPropertyValue('--layer-index')
      const nestedCount = (contentEl as HTMLElement).style.getPropertyValue('--nested-layer-count')
      const hasNested = contentEl.getAttribute('data-has-nested')
      const nested = contentEl.getAttribute('data-nested')

      const lines = [
        `--layer-index: ${layerIndex}`,
        `--nested-layer-count: ${nestedCount}`,
        `data-has-nested: ${hasNested}`,
        `data-nested: ${nested}`,
      ]

      if (hasNested === 'dialog') {
        lines.push(
          '',
          'BUG CONFIRMED: data-has-nested="dialog" is set',
          'on a single dialog with no nested dialogs.',
        )
      } else {
        lines.push('', 'No bug detected - layerStack is clean.')
      }

      setInfo(lines.join('\n'))
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <pre
      style={{
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        fontSize: 13,
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
      }}
    >
      {info}
    </pre>
  )
}

function App() {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <div style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>layerStack Duplicate Entry Reproduction</h1>
      <p style={{ color: '#666', lineHeight: 1.6 }}>
        Click the button below to mount a Dialog with <code>open=&#123;true&#125;</code>.
      </p>
      <button
        onClick={() => setShowDialog(true)}
        style={{
          marginTop: 16,
          padding: '10px 20px',
          fontSize: 16,
          cursor: 'pointer',
          borderRadius: 6,
          border: '1px solid #ccc',
          backgroundColor: '#fff',
        }}
      >
        Mount always-open dialog
      </button>
      {showDialog && <AlwaysOpenDialog />}
    </div>
  )
}

export default App
