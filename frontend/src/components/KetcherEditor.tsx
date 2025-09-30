import React, { useCallback, useRef, useState } from 'react'
import { Editor } from 'ketcher-react'
import 'ketcher-react/dist/index.css'
// @ts-ignore
import { StandaloneStructServiceProvider } from 'ketcher-standalone'
import { Button } from 'react-bootstrap'

const structServiceProvider = new StandaloneStructServiceProvider()

interface KetcherEditorProps {
  onExtract: (smiles: string) => void;
}

export const KetcherEditor: React.FC<KetcherEditorProps> = ({onExtract}) => {
  const editorRef = useRef<any | null>(null)
  const [ready, setReady] = useState(false)

  const handleOnInit = useCallback((editor: any) => {
    editorRef.current = editor
    setReady(true)
    try { (window as any).ketcher = editor } catch (e) {}
  }, [])

  /*useEffect(() => {
    if (editorRef.current) return
    let tries = 0
    const id = window.setInterval(() => {
      tries += 1
      const w = (window as any).ketcher
      if (w) {
        editorRef.current = w
        setReady(true)
        clearInterval(id)
      } else if (tries >= 10) {
        clearInterval(id)
      }
    }, 300)
    return () => clearInterval(id)
  }, [])*/ //seemingly unnecessary? always loads immediately

  const handleGetSmiles = useCallback(async () => {
    const ed = editorRef.current || (window as any).ketcher
    if (!ed) {
      console.error('Ketcher editor instance not available (editorRef/window.ketcher empty)')
      return
    }
    try {
      const s: string = await ed.getSmiles()
      if (s) {
        onExtract(s)
      }
    } catch (err) {
      console.error('Error reading from Ketcher editor:', err)
    }
  }, [])

  return (
    <div>
      <div style={{ height: 400 }}>
        <Editor
          staticResourcesUrl='./'
          structServiceProvider={structServiceProvider}
          onInit={handleOnInit as any}
          errorHandler={(e: any) => console.error('Ketcher error:', e)}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        <Button onClick={handleGetSmiles} disabled={!ready}>
          {ready ? 'Get SMILES' : 'Editor loading...'}
        </Button>
      </div>
    </div>
  )
}
