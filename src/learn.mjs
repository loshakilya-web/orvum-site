// Tools and glossary content (Site Brief #2, texts approved by the owner 18 Nov 2026; currency EUR).
// Every figure in an example is illustrative and was recalculated in code.

export const TOOLS = [
  {
    slug: 'open-to-buy-calculator',
    name: 'Open-to-Buy Calculator',
    short: 'Open-to-buy for one month or a full season, from planned sales, reductions, stock and orders already placed.',
    title: 'Open-to-Buy Calculator — Monthly and Seasonal OTB',
    description: 'Calculate open-to-buy for a month or a full season: planned sales, reductions, stock and orders on order. Free, with formula and example.',
  },
  {
    slug: 'sell-through-calculator',
    name: 'Sell-Through Rate Calculator',
    short: 'Sell-through rate, weekly selling pace and weeks of supply, in units or value.',
    title: 'Sell-Through Rate Calculator — With Weeks of Supply',
    description: 'Calculate sell-through rate, weekly selling pace and weeks of supply in units or value. Free, with both formulas and a worked example.',
  },
];

export const TERMS = [
  {
    slug: 'open-to-buy',
    name: 'Open-to-buy',
    heading: 'Open-to-buy (OTB)',
    title: 'Open-to-Buy (OTB): Definition, Formula and Example',
    description: 'Open-to-buy is what a retailer can still purchase for a period without exceeding its inventory plan. Formula, worked example and how to use it.',
    definition: 'Open-to-buy is the amount of merchandise a retailer can still purchase for a period without exceeding its inventory plan.',
    formula: 'Open-to-buy = planned sales + planned reductions + planned end-of-period inventory − beginning-of-period inventory − on order.',
    example: 'Planned sales €100,000, reductions €10,000, planned closing stock €250,000, opening stock €220,000, on order €60,000 → open-to-buy €80,000.',
    body: [
      'In multi-brand retail, open-to-buy is usually planned by brand and category, because most of the season is committed at order appointments months in advance. A negative open-to-buy means the retailer is over-bought for that period. Open-to-buy is a planning figure, not a cash budget or an approval to spend.',
    ],
    related: [['sell-through-rate'], ['weeks-of-supply'], ['tool', 'open-to-buy-calculator']],
  },
  {
    slug: 'sell-through-rate',
    name: 'Sell-through rate',
    heading: 'Sell-through rate',
    title: 'Sell-Through Rate: Definition, Formula and Example',
    description: 'Sell-through rate is the share of received stock that has sold. Both formulas, a worked example and how to compare brands fairly.',
    definition: 'Sell-through rate is the share of received inventory that has been sold in a period, expressed as a percentage.',
    formula: 'Sell-through = units sold ÷ units received × 100. A stricter version divides by all stock available: units sold ÷ (beginning inventory + units received) × 100.',
    example: '130 units sold from 200 received = 65%. With 50 units carried over, 130 ÷ 250 = 52%.',
    body: [
      'Sell-through is compared across brands and categories at the same point in the season to decide on re-orders, transfers and markdowns. Always state which version of the formula a number uses.',
    ],
    related: [['open-to-buy'], ['weeks-of-supply'], ['inventory-turnover'], ['tool', 'sell-through-calculator']],
  },
  {
    slug: 'gmroi',
    name: 'GMROI',
    heading: 'GMROI (gross margin return on inventory investment)',
    title: 'GMROI: Definition, Formula and Example for Retail',
    description: 'GMROI is gross margin earned per unit of money invested in inventory at cost. Formula, worked example and how to compare brands.',
    definition: 'GMROI measures how much gross margin a retailer earns for every unit of money invested in inventory at cost.',
    formula: 'GMROI = gross margin ÷ average inventory at cost.',
    example: 'Gross margin of €180,000 over a year on average inventory of €120,000 at cost gives a GMROI of 1.5 — every €1 of stock earned €1.50 of gross margin.',
    body: [
      'GMROI combines margin and stock productivity, so it helps compare brands with different price points: a high-margin brand that turns slowly can earn the same GMROI as a lower-margin brand that sells fast.',
    ],
    related: [['inventory-turnover'], ['sell-through-rate']],
  },
  {
    slug: 'weeks-of-supply',
    name: 'Weeks of supply',
    heading: 'Weeks of supply (WOS)',
    title: 'Weeks of Supply: Definition, Formula and Example',
    description: 'Weeks of supply is how long current stock lasts at the recent rate of sales. Formula, worked example and how to read it in a season.',
    definition: 'Weeks of supply is how many weeks the current stock would last at the recent rate of sales.',
    formula: 'Weeks of supply = inventory on hand ÷ average weekly sales (both in units, or both in value).',
    example: '600 units on hand and average sales of 40 units a week give 15 weeks of supply.',
    body: [
      'Weeks of supply is most useful when compared with the weeks left in the selling season: much more supply than weeks left points to markdown risk; much less points to a re-order or a lost-sales risk.',
    ],
    related: [['sell-through-rate'], ['open-to-buy'], ['tool', 'sell-through-calculator']],
  },
  {
    slug: 'inventory-turnover',
    name: 'Inventory turnover',
    heading: 'Inventory turnover',
    title: 'Inventory Turnover: Definition, Formula, Example',
    description: 'Inventory turnover is how many times a retailer sells through average stock in a year. Formula at cost and at retail, with an example.',
    definition: 'Inventory turnover is the number of times a retailer sells through its average inventory in a year.',
    formula: 'Inventory turnover = cost of goods sold ÷ average inventory at cost. (At retail value: net sales ÷ average inventory at retail.)',
    example: 'Cost of goods sold of €400,000 and average inventory of €160,000 at cost give a turnover of 2.5 — stock sells through about every 146 days (365 ÷ 2.5).',
    body: [
      'Luxury and seasonal fashion typically turn more slowly than mass retail, so turnover is most meaningful when compared with the same business over time and alongside margin, for example through GMROI.',
    ],
    related: [['gmroi'], ['weeks-of-supply']],
  },
  {
    slug: 'clienteling',
    name: 'Clienteling',
    heading: 'Clienteling',
    title: 'Clienteling: What It Is and How It Works in Retail',
    description: 'Clienteling is building long-term personal relationships with clients using their preferences, sizes and purchase history. How it works in practice.',
    definition: 'Clienteling is the practice of building long-term, personal relationships with individual clients using what a store knows about them: preferences, sizes, purchase history and occasions.',
    formula: null,
    example: null,
    body: [
      "In practice, a sales associate keeps a client profile, suggests pieces that fit the client's taste and wardrobe, reserves items, and follows up when relevant products arrive. Done well, it depends on accurate stock information: recommending a piece that is not available damages trust.",
      "Clienteling uses personal data, so it requires the client's consent, clear purposes and secure storage under data-protection law such as the GDPR.",
    ],
    related: [['platform']],
  },
];

export function relatedLink(r) {
  if (r[0] === 'tool') { const t = TOOLS.find((x) => x.slug === r[1]); return { href: `/tools/${t.slug}`, label: t.name }; }
  if (r[0] === 'platform') return { href: '/platform', label: 'The ORVUM platform' };
  const t = TERMS.find((x) => x.slug === r[0]);
  return { href: `/glossary/${t.slug}`, label: t.name };
}
