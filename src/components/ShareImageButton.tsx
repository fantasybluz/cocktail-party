import { useState } from 'react'
import { createPortal } from 'react-dom'
import { loadFont, shareCanvas } from '../lib/shareImage.ts'
import { sound } from '../lib/sound.ts'

interface Props {
  render: () => HTMLCanvasElement
  filename: string
  // 分享時附帶的文字
  message: string
  label?: string
  className?: string
}

// 「存成圖片」：產生像素風的圖，能分享就開分享選單，不能就顯示圖片讓人長按儲存
export function ShareImageButton({ render, filename, message, label = '存成圖片', className = 'btn' }: Props) {
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  async function create() {
    sound.unlock()
    setBusy(true)
    try {
      await loadFont()
      const result = await shareCanvas(render(), filename, message)
      if (result.status === 'preview' && result.url) setPreview(result.url)
      if (result.status === 'shared') sound.win()
    } finally {
      setBusy(false)
    }
  }

  function close() {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
  }

  return (
    <>
      <button className={className} type="button" disabled={busy} onClick={create}>
        {busy ? '產生中⋯' : label}
      </button>
      {preview &&
        createPortal(
          <div className="overlay" role="dialog" aria-label="分享圖" onClick={close}>
            <div className="panel image-preview" id="image-preview" onClick={(event) => event.stopPropagation()}>
              <p className="image-preview__hint">長按圖片可以儲存，再傳到 LINE</p>
              <img src={preview} alt="分享圖" />
              <div className="btn-row">
                <a className="btn" href={preview} download={filename}>
                  下載
                </a>
                <button className="btn btn--orange" type="button" onClick={close}>
                  關閉
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
