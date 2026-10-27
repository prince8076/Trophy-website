// Order channels for the Shreeji Corporates landing page.
// The user said: orders ONLY via this WhatsApp number and email —
// no cart, no checkout, no fake contact form. So every "order" CTA
// in the site goes to one of these two, with the product / engraving
// details already filled in, so the customer just taps Send.
// WhatsApp number supplied by the user: 8796977707 (also in the
// company profile as +91 87969 77707). wa.me needs the country code,
// so the link uses 91 + the number, with no spaces or '+'.
export const WHATSAPP_NUMBER = '918796977707';
export const WHATSAPP_DISPLAY = '+91 87969 77707';
export const ORDER_EMAIL = 'shreejicorporates@gmail.com';
export const ORDER_ADDRESS =
  'Plot D-102, FF Back Side, Hastsal Vihar Part-III, Uttam Nagar, New Delhi – 110059';

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function emailUrl(subject: string, body: string): string {
  return `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function quoteMessage(productName: string, material: string): string {
  return `Hi Shreeji Corporates, I would like a quote for ${productName} (${material}). Please share price and delivery details.`;
}

export function engravingMessage(text: string, fontLabel: string, plateLabel: string): string {
  const t = text.trim();
  if (!t) {
    return `Hi Shreeji Corporates, I would like to discuss a custom engraving. Please share a quote.`;
  }
  return `Hi Shreeji Corporates, I would like an engraving: "${t}" — Font: ${fontLabel}, Plate: ${plateLabel}. Please share a quote.`;
}

export const GENERAL_ORDER_MESSAGE =
  'Hi Shreeji Corporates, I would like to place an order. Please share details.';
