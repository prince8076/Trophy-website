import { useState } from 'react';
import { X } from 'lucide-react';

/** Working contact form with a local success state.
 *  No real contact details are invented and nothing is sent
 *  anywhere — this is a placeholder destination, as requested. */
export default function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Contact" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="display" style={{ margin: 0, fontSize: 28 }}>Start a project</h3>
          <button type="button" className="btn btn-ghost" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>
        {sent ? (
          <p style={{ marginTop: 20 }}>
            Thanks — your message is recorded locally in this demo. We’ll use the
            contact details you provide when this site is connected to a real inbox.
          </p>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <label>Name<input required placeholder="Your name" /></label>
            <label>Email<input required type="email" placeholder="you@example.com" /></label>
            <label>Project<textarea rows={4} placeholder="What should move?" /></label>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button type="submit" className="btn btn-primary">Send message</button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
