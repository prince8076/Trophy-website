// Feedback data — MOCK for now, backend-ready by design.
// The user asked: show feedback now as mock, then integrate the
// backend so it becomes real-time later. So this file is the ONLY
// place feedback lives, and the Feedback component just renders
// whatever is in this array — no other code touches the shape.
// To go real-time later, replace the MOCK_FEEDBACK export below with
// a fetch to your backend (e.g. GET /api/feedback returning the same
// shape: { name, role, sector, quote, rating }), and set the
// component's data from that fetch instead of this import. Do NOT
// keep these mock entries live once real feedback exists — they are
// placeholders, not verified customer reviews, and they use first
// name + initial only, no invented company names, dates or order sizes.
export type FeedbackItem = {
  name: string;
  role: string;
  sector: string;
  quote: string;
  rating: number;
};

export const MOCK_FEEDBACK: FeedbackItem[] = [
  {
    name: 'Priya S.',
    role: 'Event Organiser',
    sector: 'Event Management',
    quote: 'The trophies arrived exactly as we designed them, engraving and all, and on time for our event. Ordering on WhatsApp was the easiest part.',
    rating: 5,
  },
  {
    name: 'Rahul K.',
    role: 'Sports Coordinator',
    sector: 'Sports Association',
    quote: 'We needed medals for a full tournament. Quality was consistent across every piece, and the team helped us pick the right design quickly.',
    rating: 5,
  },
  {
    name: 'Anjali M.',
    role: 'Administrator',
    sector: 'Educational Institution',
    quote: 'Elegant trophies for our academic awards, with our logo engraved precisely. The students and parents both noticed the finish.',
    rating: 5,
  },
  {
    name: 'Vikram T.',
    role: 'HR Manager',
    sector: 'Corporate Organisation',
    quote: 'Employee recognition gifts that actually feel premium. Branding was clean, packaging was secure, and delivery was dependable.',
    rating: 5,
  },
  {
    name: 'Sana A.',
    role: 'Programme Lead',
    sector: 'Social Organisation',
    quote: 'Mementos for our community programme, customised to our theme. Good value, and the team listened to what we actually needed.',
    rating: 5,
  },
  {
    name: 'Arjun D.',
    role: 'Festival Coordinator',
    sector: 'Government Body',
    quote: 'Formal mementos for an official function, delivered with care and on schedule. Professional from first message to delivery.',
    rating: 5,
  },
];
