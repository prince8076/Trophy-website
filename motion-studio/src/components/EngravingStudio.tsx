import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';
import { whatsappUrl, engravingMessage, emailUrl } from '../lib/whatsapp';

// Engraving studio — new for motion-studio, in ALIVE style only.
// A working local preview: type the text, pick a font and a plate
// colour, and the plate on the right updates live. Preview only —
// the final engraving is done by hand on the order, it is not
// produced by this page, and nothing is sent anywhere.
const FONTS = [
  { id: 'serif', label: 'Serif', css: 'Georgia, serif' },
  { id: 'sans', label: 'Sans', css: 'Inter, system-ui, sans-serif' },
  { id: 'script', label: 'Script', css: '"Segoe Script", cursive' },
] as const;

const PLATES = [
  { id: 'gold', label: 'Gold', bg: '#C9A86A', fg: '#1a1206' },
  { id: 'silver', label: 'Silver', bg: '#C0C0C0', fg: '#1a1a1a' },
  { id: 'black', label: 'Black', bg: '#1a1a1a', fg: '#c6f24e' },
] as const;

export default function EngravingStudio() {
  const [text, setText] = useState('');
  const [font, setFont] = useState<(typeof FONTS)[number]['id']>('serif');
  const [plate, setPlate] = useState<(typeof PLATES)[number]['id']>('gold');
  const fontCss = FONTS.find((f) => f.id === font)?.css || FONTS[0].css;
  const plateDef = PLATES.find((p) => p.id === plate) || PLATES[0];
  const shown = text.trim() || 'Your text here';
  return (
    <section className="section" id="engraving">
      <div className="wrap">
        <Reveal><p className="label">Engraving — Studio</p></Reveal>
        <Reveal>
          <h2 className="display" style={{ fontSize: 'clamp(44px, 7vw, 96px)', margin: '16px 0 12px' }}>
            Make it<br />yours.
          </h2>
          <p className="lead">
            Type it, pick a font and a plate, and see it live. Then send
            it straight to us on WhatsApp — the message already has your
            text, font and plate in it, so you just tap Send.
          </p>
        </Reveal>
        <div className="engrave-grid">
          <div className="engrave-controls">
            <label>
              Engraving text
              <input
                type="text"
                value={text}
                maxLength={30}
                placeholder="e.g. Champion 2026"
                onChange={(e) => setText(e.target.value)}
              />
            </label>
            <div className="engrave-group">
              <span>Font</span>
              <div className="engrave-pills">
                {FONTS.map((f) => (
                  <button key={f.id} type="button" className={font === f.id ? 'active' : ''} onClick={() => setFont(f.id)}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="engrave-group">
              <span>Plate</span>
              <div className="engrave-pills">
                {PLATES.map((p) => (
                  <button key={p.id} type="button" className={plate === p.id ? 'active' : ''} onClick={() => setPlate(p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <a
              className="btn btn-primary"
              href={whatsappUrl(engravingMessage(text, FONTS.find((f) => f.id === font)?.label || 'Serif', plateDef.label))}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp this engraving <ArrowRight size={16} />
            </a>
            <a
              className="btn btn-ghost"
              href={emailUrl('Engraving order enquiry', engravingMessage(text, FONTS.find((f) => f.id === font)?.label || 'Serif', plateDef.label))}
            >
              Order by email instead
            </a>
            <p className="engrave-note">Preview only — final engraving is done by hand on your order. Orders are taken only on WhatsApp and email, no checkout on this page.</p>
          </div>
          <div className="engrave-preview">
            <div className="engrave-plate" style={{ background: plateDef.bg, color: plateDef.fg, fontFamily: fontCss }}>
              {shown}
            </div>
            <span>{plateDef.label} plate · {FONTS.find((f) => f.id === font)?.label} font</span>
          </div>
        </div>
      </div>
    </section>
  );
}
