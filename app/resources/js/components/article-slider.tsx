import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ArticleSlider({ images, title }: { images: string[]; title: string }) {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const multiple = images.length > 1;

    useEffect(() => {
        if (!multiple || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const timer = window.setInterval(() => setCurrent((value) => (value + 1) % images.length), 4500);
        return () => window.clearInterval(timer);
    }, [images.length, multiple, paused]);

    if (!images.length) return null;
    const go = (index: number) => setCurrent((index + images.length) % images.length);

    return <section className="relative mt-12 overflow-hidden rounded-[28px] border border-white/15 bg-slate-950 shadow-2xl" aria-label={`Galerie de l’article ${title}`}>
        <div className="relative aspect-[16/9] sm:aspect-[16/8]">
            {images.map((image, index) => <img key={image} src={image} alt={`${title} — photo ${index + 1} sur ${images.length}`} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === current ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={index !== current} />)}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-gradient-to-t from-slate-950/90 to-transparent px-4 pb-4 pt-16 sm:px-6">
                <span className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">{current + 1} / {images.length}</span>
                {multiple && <button type="button" onClick={() => setPaused((value) => !value)} className="flex items-center gap-2 rounded-full bg-black/35 px-3 py-2 text-xs font-bold text-white backdrop-blur" aria-label={paused ? 'Reprendre le défilement' : 'Mettre le défilement en pause'}>{paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}{paused ? 'Lecture' : 'Pause'}</button>}
            </div>
        </div>
        {multiple && <>
            <button type="button" onClick={() => go(current - 1)} aria-label="Photo précédente" className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/55 text-white backdrop-blur transition hover:bg-blue-600"><ChevronLeft className="size-6" /></button>
            <button type="button" onClick={() => go(current + 1)} aria-label="Photo suivante" className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/55 text-white backdrop-blur transition hover:bg-blue-600"><ChevronRight className="size-6" /></button>
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">{images.map((_, index) => <button key={index} type="button" onClick={() => go(index)} aria-label={`Afficher la photo ${index + 1}`} aria-current={index === current} className={`h-2 rounded-full transition-all ${index === current ? 'w-7 bg-white' : 'w-2 bg-white/45 hover:bg-white/75'}`} />)}</div>
        </>}
    </section>;
}
