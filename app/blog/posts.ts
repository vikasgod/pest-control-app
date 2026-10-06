export type BlogPost = {
  slug: string;
  image: string;
  title: string;
  category: string;
  excerpt: string;
  publishedAt: string;
  readTime: string;
  sections: {
    heading: string;
    paragraphs: string[];
    tips?: string[];
  }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "prepare-home-for-pest-control",
    image: "/blog/pest-treatment-preparation.svg",
    title: "How to prepare your home for pest control",
    category: "Pest control tips",
    excerpt:
      "A simple room-by-room checklist to help your technician inspect and treat your home effectively.",
    publishedAt: "October 3, 2026",
    readTime: "5 min read",
    sections: [
      {
        heading: "Before the technician arrives",
        paragraphs: [
          "When you book a service, ask the provider what preparation is needed for the specific treatment. Instructions can differ depending on the pest, product and areas being treated.",
          "Make a note of where and when you have seen pest activity. Move everyday items away from those areas if asked, and secure food, dishes and pet supplies.",
        ],
        tips: [
          "Follow the technician's preparation instructions.",
          "Keep children and pets away from treatment areas as directed.",
          "Mention allergies, pets, or other household concerns in advance.",
        ],
      },
      {
        heading: "During the inspection and treatment",
        paragraphs: [
          "Show the technician the places where you have noticed pests, droppings or damage. This helps them inspect likely entry points and hiding places instead of relying only on visible activity.",
          "Ask which products or methods will be used, which areas need to be avoided, and how long you should wait before cleaning or returning to treated rooms.",
        ],
      },
      {
        heading: "After the service",
        paragraphs: [
          "Use the aftercare instructions provided for your treatment. Avoid cleaning treated surfaces or re-entering restricted areas until the technician says it is safe to do so. Contact the provider if you have questions or pest activity continues.",
        ],
      },
    ],
  },
  {
    slug: "keep-rodents-out-of-your-home",
    image: "/blog/rodent-proofing-home.svg",
    title: "How to keep rats and mice out of your home",
    category: "Rodent control",
    excerpt:
      "Reduce food sources, seal common entry gaps and spot early signs of rodent activity around your property.",
    publishedAt: "September 30, 2026",
    readTime: "5 min read",
    sections: [
      {
        heading: "Seal gaps and entry points",
        paragraphs: [
          "Rats and mice can enter through surprisingly small openings around pipes, doors, vents and utility lines. Inspect the outside of your home and seal gaps with suitable durable materials.",
          "Check door sweeps, window screens and vents too. Keep stored items slightly raised and away from walls so it is easier to notice signs of activity.",
        ],
        tips: [
          "Look for droppings, gnaw marks or shredded nesting material.",
          "Store dry food and pet food in sealed containers.",
          "Keep bins closed and clear food waste promptly.",
        ],
      },
      {
        heading: "Reduce shelter and food outdoors",
        paragraphs: [
          "Trim vegetation close to the building and keep firewood or other stored materials away from exterior walls. Remove fallen fruit and avoid leaving food for pets outside overnight.",
          "If you find droppings, avoid sweeping or vacuuming them dry. Follow local public-health guidance or contact a pest professional for safe cleanup and control advice.",
        ],
      },
      {
        heading: "Get help for recurring activity",
        paragraphs: [
          "Repeated signs of rodents may mean an entry route or nesting area has been missed. A pest professional can inspect the property, identify likely access points and recommend an appropriate control plan.",
        ],
      },
    ],
  },
  {
    slug: "choose-pest-control-service",
    image: "/blog/choose-pest-control-service.svg",
    title: "What to look for in a pest control service",
    category: "Pest control guide",
    excerpt:
      "Questions to ask about inspections, treatment plans, safety instructions and follow-up before booking a service.",
    publishedAt: "September 27, 2026",
    readTime: "4 min read",
    sections: [
      {
        heading: "Look for a clear inspection and plan",
        paragraphs: [
          "A reliable service should ask about the pest, where it has been seen and how long the problem has been present. The inspection findings should guide the recommended treatment rather than a one-size-fits-all promise.",
          "Ask what the service includes, whether follow-up is recommended and how you will know if the treatment is working.",
        ],
      },
      {
        heading: "Ask about safety and preparation",
        paragraphs: [
          "Before work begins, request clear information about the products or methods being used, preparation steps, ventilation and any time you need to stay away from treated areas.",
          "Tell the provider about children, pets, or household sensitivities so they can explain the relevant precautions for your service.",
        ],
        tips: [
          "Get the service scope and price explained before treatment.",
          "Follow written preparation and aftercare instructions.",
          "Be cautious of guarantees that sound unrealistic.",
        ],
      },
      {
        heading: "Choose communication you can trust",
        paragraphs: [
          "A professional should be willing to answer questions and explain why a treatment is suitable for your situation. Clear communication helps you understand what to expect and what steps can help prevent pests from returning.",
        ],
      },
    ],
  },
  {
    slug: "stop-cockroaches-from-coming-back",
    image: "/blog/cockroach-prevention.svg",
    title: "How to stop cockroaches from coming back",
    category: "Cockroach control",
    excerpt:
      "Practical ways to remove the food, water and hiding places that attract cockroaches—and when to call a professional.",
    publishedAt: "October 1, 2026",
    readTime: "5 min read",
    sections: [
      {
        heading: "Start by removing what attracts them",
        paragraphs: [
          "Cockroaches thrive wherever they can find food, water and a sheltered place to hide. A quick surface clean helps, but focusing on these three needs is what makes prevention last.",
          "Wipe cooking surfaces after meals, clean crumbs from under appliances and store pantry food in sealed containers. Empty indoor bins regularly and avoid leaving pet food out overnight.",
        ],
        tips: [
          "Fix leaking taps and dry sinks before bed.",
          "Keep food and waste in tightly closed containers.",
          "Reduce clutter around cabinets and appliances.",
        ],
      },
      {
        heading: "Close entry points and check hidden areas",
        paragraphs: [
          "Small gaps around pipes, doors and windows can give pests a way inside. Seal visible openings and check warm, dark areas such as cupboards, drains and the space behind refrigerators.",
          "Look for droppings, egg cases or a musty smell. These signs can help identify where cockroaches are active and whether the problem is growing.",
        ],
      },
      {
        heading: "Know when to get professional help",
        paragraphs: [
          "If cockroaches keep appearing after cleaning and sealing gaps, there may be a nest in a wall void or another hard-to-reach area. A trained technician can identify the source and recommend a treatment plan suited to your home.",
        ],
      },
    ],
  },
  {
    slug: "early-signs-of-termite-damage",
    image: "/blog/termite-warning-signs.svg",
    title: "7 early signs of termite damage",
    category: "Termite control",
    excerpt:
      "Learn what to look for in woodwork, walls and around your home so you can investigate possible termite activity early.",
    publishedAt: "September 24, 2026",
    readTime: "6 min read",
    sections: [
      {
        heading: "Check wood and paint for changes",
        paragraphs: [
          "Termites can work inside wood for a long time before the damage is obvious. Soft or hollow-sounding timber, blistered paint and doors that suddenly stick may be reasons to investigate further.",
          "These signs can have other causes, including moisture damage, so look for more than one clue before drawing conclusions.",
        ],
        tips: [
          "Tap wooden skirting boards and door frames for hollow spots.",
          "Check for small piles of wings near windows and lights.",
          "Look for mud tubes along foundations or walls.",
        ],
      },
      {
        heading: "Inspect less-visible places",
        paragraphs: [
          "Basements, storage areas and places where wood touches soil are easy to overlook. Check these areas periodically, especially after heavy rain or if you have noticed dampness around the property.",
          "Mud tubes, discarded wings and tiny droppings can all be warning signs. Avoid disturbing suspected activity before an inspection, as this can make it harder to identify the source.",
        ],
      },
      {
        heading: "Arrange an inspection if signs persist",
        paragraphs: [
          "A professional inspection can determine whether the damage is caused by termites and how far it may have spread. Early identification helps you choose the right next step and protect unaffected parts of the property.",
        ],
      },
    ],
  },
  {
    slug: "prevent-mosquitoes-at-home",
    image: "/blog/mosquito-prevention.svg",
    title: "The right way to prevent mosquitoes at home",
    category: "Mosquito control",
    excerpt:
      "Simple weekly checks and a few changes around the house can reduce places where mosquitoes rest and breed.",
    publishedAt: "September 17, 2026",
    readTime: "4 min read",
    sections: [
      {
        heading: "Remove standing water every week",
        paragraphs: [
          "Mosquitoes can breed in surprisingly small amounts of still water. Check plant saucers, buckets, trays, drains and unused containers around your home at least once a week.",
          "Empty and scrub containers rather than simply topping them up. Keep water storage securely covered and make sure outdoor drains are not blocked.",
        ],
        tips: [
          "Turn over buckets and other containers when not in use.",
          "Refresh pet water bowls regularly.",
          "Clear leaves from gutters and outdoor drains.",
        ],
      },
      {
        heading: "Keep screens and resting areas in good condition",
        paragraphs: [
          "Repair holes in window screens and use doors carefully, especially at dawn and dusk. Trim dense vegetation near entrances and remove clutter where adult mosquitoes can rest.",
          "A fan can also help make indoor spaces less attractive to mosquitoes because moving air makes it harder for them to fly and settle.",
        ],
      },
      {
        heading: "Treat persistent activity at its source",
        paragraphs: [
          "If mosquitoes remain a problem despite regular checks, a professional can help locate overlooked breeding or resting areas and advise on appropriate treatment options.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
