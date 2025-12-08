import { useRef, useState, useEffect } from 'react'

function getYouTubeEmbed(url) {
    try {
        const u = new URL(url)
        if (u.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`
        if (u.hostname.includes('youtube.com')) {
            const v = u.searchParams.get('v')
            if (v) return `https://www.youtube.com/embed/${v}`
            return url
        }
    } catch (e) {
        return url
    }
}

export default function ResourceCard({ title, subtitle, link, linkLabel = 'Open', actions = [], pdfUrl, videoUrl }) {
    const dialogRef = useRef(null)
    const [embedSrc, setEmbedSrc] = useState(null)
    const embedUrl = videoUrl ? getYouTubeEmbed(videoUrl) : null

    // open: show dialog and set iframe src for video preview
    function openDialog() {
        if (dialogRef.current?.showModal) dialogRef.current.showModal()
        if (embedUrl) setEmbedSrc(embedUrl)
    }

    // close: close dialog and clear iframe src to stop playback
    function closeDialog() {
        if (dialogRef.current?.close) dialogRef.current.close()
        setEmbedSrc(null)
    }

    // also clear embedSrc if dialog closed by outside click / ESC
    useEffect(() => {
        const d = dialogRef.current
        if (!d) return
        const onClose = () => setEmbedSrc(null)
        d.addEventListener('close', onClose)
        return () => d.removeEventListener('close', onClose)
    }, [])

    return (
        <div className="bg-white border border-gray-200 p-5 shadow-sm rounded-lg">
            <button type="button" className="w-full text-left" onClick={openDialog}>
                <div className="text-left text-black">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <p className="text-sm text-gray-600">{subtitle}</p>
                </div>
            </button>

            <dialog ref={dialogRef} className="modal" aria-modal="true">
                <div className="modal-box bg-white p-6 relative">
                    <button
                        type="button"
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={closeDialog}
                    >
                        ✕
                    </button>

                    <h3 className="font-bold text-lg mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{subtitle}</p>

                    {embedSrc ? (
                        <>
                            <div className="w-full h-64 sm:h-96 bg-gray-50 border border-gray-200 rounded-md overflow-hidden mb-4">
                                <iframe
                                    src={embedSrc}
                                    title={`${title} preview`}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            <div className="flex gap-3">
                                <a
                                    href={videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-indigo-600 text-white px-4 py-2 rounded text-sm"
                                >
                                    Open on YouTube
                                </a>
                            </div>
                        </>
                    ) : pdfUrl ? (
                        <>
                            <div className="w-full h-96 bg-gray-50 border border-gray-200 rounded-md overflow-hidden mb-4">
                                <iframe src={pdfUrl} title={`${title} preview`} className="w-full h-full" />
                            </div>

                            <div className="flex gap-3">
                                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded text-sm">
                                    Open PDF
                                </a>
                                <a href={pdfUrl} download className="inline-block bg-gray-100 border border-gray-200 px-4 py-2 rounded text-sm text-black">
                                    Download PDF
                                </a>
                            </div>
                        </>
                    ) : actions.length > 0 ? (
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            {actions.map((a, i) =>
                                a.type === 'download' ? (
                                    <a key={i} href={a.href} target="_blank" rel="noopener noreferrer" className="inline-block bg-gray-100 border border-gray-200 px-4 py-2 rounded text-sm text-black" download>
                                        {a.label}
                                    </a>
                                ) : (
                                    <a key={i} href={a.href} target="_blank" rel="noopener noreferrer" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded text-sm">
                                        {a.label}
                                    </a>
                                )
                            )}
                        </div>
                    ) : link ? (
                        <a className="text-lg text-gray-700 break-all" href={link} target="_blank" rel="noopener noreferrer">
                            {linkLabel}
                        </a>
                    ) : null}
                </div>
            </dialog>
        </div>
    )
}