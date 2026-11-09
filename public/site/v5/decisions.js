/* ORVUM hero module panels — one short explanation per module: what it is responsible for,
   and how ORVUM's intelligence helps. Designed capabilities; ORVUM is in development. */
window.DECISIONS = {
  agents: {
    tag: 'AI Agents',
    role: 'The intelligence that works across every module: it watches the business, explains what is changing and prepares the next decision.',
    intel: ['Explains what changed and why, with the evidence behind it', 'Recommends options with their consequences for profit, stock and cash', 'Acts only after the responsible person approves — and records it']
  },
  buying: {
    tag: 'Buying',
    role: 'Decides what to buy, how much and from whom — and how much buying capital to commit.',
    intel: ['Reads demand by category, brand and size from real sell-through', 'Shows how much buying capital is committed and how much is left', 'Flags over-buying before the order is placed']
  },
  inventory: {
    tag: 'Inventory',
    role: 'Keeps one true picture of stock by store, size and age.',
    intel: ['Finds where stock and demand do not match', 'Spots ageing stock early, while it can still sell at full price', 'Shows how much capital is tied up in stock — and how to recover it']
  },
  stores: {
    tag: 'Stores & POS',
    role: 'Runs sales and returns in store and on mobile, connected to stock, clients and finance.',
    intel: ['Each sale and return updates stock, client and finance records once', 'Brings the client’s sizes and history to the sales associate', 'Surfaces store issues — missing sizes, unusual returns — the same day']
  },
  people: {
    tag: 'People',
    role: 'Organises the team by store and role, with tasks and permissions.',
    intel: ['Shows where the team needs support, by store and role', 'Turns approved decisions into clear tasks with an owner', 'Lets each person see and approve only what their role allows']
  },
  pricing: {
    tag: 'Pricing',
    role: 'Protects margin and decides when, and how far, to mark down.',
    intel: ['Tracks margin and sell-through for every product', 'Compares marking down now with holding the price', 'Recommends the timing designed to recover the most value']
  },
  crm: {
    tag: 'CRM',
    role: 'Knows each client — purchases, sizes, preferences and contact consent.',
    intel: ['Matches clients to the products they are most likely to want', 'Suggests who to contact, about what, and when', 'Helps sell current stock at full price and builds loyalty']
  },
  finance: {
    tag: 'Finance',
    role: 'Connects commitments, supplier payments, sales and margin in one financial view.',
    intel: ['Sets upcoming supplier payments against expected sales', 'Calculates true profit by product, store and season', 'Warns early when the plan and the cash no longer fit']
  },
  analytics: {
    tag: 'Analytics',
    role: 'Explains what is driving performance across the business.',
    intel: ['Separates the real drivers from noise', 'Flags risks before they reach the P&L', 'Forecasts likely outcomes, with the source of every number']
  },
  planning: {
    tag: 'Planning',
    role: 'Aligns demand, deliveries and replenishment by store and season.',
    intel: ['Forecasts demand by store and size', 'Times deliveries and reorders to that demand', 'Designed to reduce missing sizes in season and excess stock at its end']
  },
  brands: {
    tag: 'Brand Partners', planned: 'Planned capability',
    role: 'A shared space where the retailer and its brand partners plan together.',
    intel: ['Shares agreed sell-through and stock insights with brands', 'Supports joint planning of replenishment and the next buy', 'The retailer controls exactly what is shared']
  }
};
