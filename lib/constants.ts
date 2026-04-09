export const COLORS = {
  bg: '#0A0A0A',
  surface: '#111111',
  accent: '#E8FF00',
  text: '#F0F0F0',
  muted: '#555555',
  border: 'rgba(255,255,255,0.07)',
} as const

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const

export const SERVICES = [
  {
    num: '01',
    title: 'WRAP COMPLET',
    tagline: 'Transformare totală a vehiculului, orice finisaj',
    image: '/images/service-wrap.jpg',
    price: '€2.400',
    inclusions: [
      'Demontare parțială acolo unde este necesar',
      'Folie premium 3M sau Avery Dennison',
      'Garanție 5 ani la material și montaj',
      'Kit de îngrijire post-wrap inclus',
    ],
  },
  {
    num: '02',
    title: 'PPF PROTECȚIE',
    tagline: 'Armură invizibilă pentru vopseaua ta',
    image: '/images/service-ppf.jpg',
    price: '€1.800',
    inclusions: [
      'Folie auto-vindecătoare XPEL sau SunTek',
      'Acoperire față completă sau vehicul întreg',
      'Strat hidrofob superior',
      'Garanție producător 10 ani',
    ],
  },
  {
    num: '03',
    title: 'CROMATE & ACCENTE',
    tagline: 'Ștergere crom, stâlpi, borduri și insigne',
    image: '/images/service-chrome.jpg',
    price: '€480',
    inclusions: [
      'Ștergere ornamente și insigne crom',
      'Foliere stâlpi geamuri',
      'Opțiune wrap plafon',
      'Folie turnată premium KPMF',
    ],
  },
  {
    num: '04',
    title: 'WRAP INTERIOR',
    tagline: 'Bord, ornamente și consolă transformate',
    image: '/images/service-interior.jpg',
    price: '€950',
    inclusions: [
      'Panouri bord și consolă centrală',
      'Finisaj fibră de carbon, oțel periat sau custom',
      'Inserții panouri uși',
      'Folie Hexis sau Avery Dennison',
    ],
  },
] as const

export const PORTFOLIO = [
  { id: 1, make: 'Porsche', model: '911 GT3', wrap: 'Satin Midnight Blue', year: '2025', img: '/images/p1.jpg', badge: 'WRAP COMPLET' },
  { id: 2, make: 'Mercedes', model: 'C63 AMG', wrap: 'Gloss Alb + Ștergere Crom', year: '2025', img: '/images/p2.jpg', badge: 'WRAP COMPLET' },
  { id: 3, make: 'Audi', model: 'RS6 Avant', wrap: 'Satin Oțel Periat', year: '2026', img: '/images/p3.jpg', badge: 'WRAP COMPLET' },
  { id: 4, make: 'Range Rover', model: 'Sport', wrap: 'Color-Shift Cameleon', year: '2026', img: '/images/p4.jpg', badge: 'WRAP COMPLET' },
  { id: 5, make: 'BMW', model: 'M3 Competition', wrap: 'Matte Verde Militar', year: '2026', img: '/images/p5.jpg', badge: 'WRAP COMPLET' },
  { id: 6, make: 'Tesla', model: 'Model S Plaid', wrap: 'Gloss Fibră de Carbon', year: '2026', img: '/images/p6.jpg', badge: 'PPF + WRAP' },
] as const

export const REVIEWS = [
  {
    name: 'Alexandru M.',
    car: 'BMW M4 — Negru Mat',
    date: 'Februarie 2026',
    stars: 5,
    quote: 'Absolut impecabil. Mașina arată mai bine decât din fabrică. Echipa WOB ART este profesionistă, comunicativă și livrează exact ce promite.',
  },
  {
    name: 'Mihai D.',
    car: 'Porsche 911 — Satin Albastru',
    date: 'Ianuarie 2026',
    stars: 5,
    quote: 'Am ales WOB ART după mult research. Nu m-am înșelat. Finisajul satin este perfect, fără bule sau margini vizibile. Recomand cu toată încrederea.',
  },
  {
    name: 'Răzvan C.',
    car: 'Audi RS6 — Oțel Periat',
    date: 'Martie 2026',
    stars: 5,
    quote: 'Experiență premium de la început până la sfârșit. Consultație rapidă, termenul respectat, rezultat excepțional. Vin și cu următoarea mașină.',
  },
  {
    name: 'Cristina P.',
    car: 'Range Rover — Color Shift',
    date: 'Martie 2026',
    stars: 5,
    quote: 'Folie color-shift pe Range Rover — toată lumea se întoarce după mine. Calitate incredibilă și prețul a fost corect pentru ceea ce am primit.',
  },
] as const
