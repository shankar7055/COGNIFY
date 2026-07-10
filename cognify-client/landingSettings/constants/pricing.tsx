import { CheckIcon } from "../icons/card-icons";
import { CloseIcon } from "../icons/general";

export enum TierName {
  TIER_1 = "Starter",
  TIER_2 = "Scale",
  TIER_3 = "Enterprise",
}

export const tiers = [
  {
    title: TierName.TIER_1,
    subtitle: "For developers exploring AI automation.",
    monthly: 0,
    yearly: 0,
    ctaText: "Start building",
    ctaLink: "/sign-up?plan=FREE",
    features: [
      "1 workspace",
      "3 agents (Code, Research, General)",
      "50,000 tokens / month",
      "5 file uploads (10MB max)",
      "Basic analytics",
      "Community support",
    ],
  },
  {
    title: TierName.TIER_2,
    subtitle: "For teams building production workflows.",
    monthly: 12,
    yearly: 9,
    ctaText: "Start building",
    ctaLink: "/sign-up?plan=PRO",
    features: [
      "Unlimited workspaces",
      "All 5 agents + custom agents",
      "2,000,000 tokens / month",
      "Unlimited file uploads (25MB max)",
      "Full analytics + cost tracking",
      "Workflow automation (50 runs/mo)",
      "Team collaboration (5 members)",
      "API key access",
      "Slack + Google Sheets integration",
      "Priority support",
    ],
    featured: true,
  },
  {
    title: TierName.TIER_3,
    subtitle: "For orgs with custom scale and compliance.",
    monthly: 0,
    yearly: 0,
    ctaText: "Contact sales",
    ctaLink: "/contact",
    features: [
      "Everything in Scale",
      "Unlimited token limits",
      "Custom agent personas",
      "SSO / SAML authentication",
      "Dedicated support + SLA",
      "On-premise deployment option",
      "Custom integrations",
      "Access to audit logs",
      "Volume discounts",
    ],
  },
];

export const pricingTable = [
  {
    title: "Workspaces",
    tiers: [
      { title: TierName.TIER_1, value: "1" },
      { title: TierName.TIER_2, value: "Unlimited" },
      { title: TierName.TIER_3, value: "Unlimited" },
    ],
  },
  {
    title: "Agents",
    tiers: [
      { title: TierName.TIER_1, value: "3 built-in" },
      { title: TierName.TIER_2, value: "All 5 + custom" },
      { title: TierName.TIER_3, value: "Unlimited custom" },
    ],
  },
  {
    title: "Token limit / month",
    tiers: [
      { title: TierName.TIER_1, value: "50K" },
      { title: TierName.TIER_2, value: "2M" },
      { title: TierName.TIER_3, value: "Unlimited" },
    ],
  },
  {
    title: "File uploads",
    tiers: [
      { title: TierName.TIER_1, value: "5 (10MB max)" },
      { title: TierName.TIER_2, value: "Unlimited (25MB)" },
      { title: TierName.TIER_3, value: "Unlimited" },
    ],
  },
  {
    title: "Workflow automation",
    tiers: [
      { title: TierName.TIER_1, value: <CloseIcon className="mx-auto size-5 text-gray-600" /> },
      { title: TierName.TIER_2, value: "50 runs / mo" },
      { title: TierName.TIER_3, value: "Unlimited" },
    ],
  },
  {
    title: "Team collaboration",
    tiers: [
      { title: TierName.TIER_1, value: <CloseIcon className="mx-auto size-5 text-gray-600" /> },
      { title: TierName.TIER_2, value: "Up to 5 members" },
      { title: TierName.TIER_3, value: "Unlimited" },
    ],
  },
  {
    title: "API key access",
    tiers: [
      { title: TierName.TIER_1, value: <CloseIcon className="mx-auto size-5 text-gray-600" /> },
      { title: TierName.TIER_2, value: <CheckIcon className="mx-auto size-5 text-gray-600" /> },
      { title: TierName.TIER_3, value: <CheckIcon className="mx-auto size-5 text-gray-600" /> },
    ],
  },
  {
    title: "SSO / SAML",
    tiers: [
      { title: TierName.TIER_1, value: <CloseIcon className="mx-auto size-5 text-gray-600" /> },
      { title: TierName.TIER_2, value: <CloseIcon className="mx-auto size-5 text-gray-600" /> },
      { title: TierName.TIER_3, value: <CheckIcon className="mx-auto size-5 text-gray-600" /> },
    ],
  },
  {
    title: "On-premise deployment",
    tiers: [
      { title: TierName.TIER_1, value: <CloseIcon className="mx-auto size-5 text-gray-600" /> },
      { title: TierName.TIER_2, value: <CloseIcon className="mx-auto size-5 text-gray-600" /> },
      { title: TierName.TIER_3, value: <CheckIcon className="mx-auto size-5 text-gray-600" /> },
    ],
  },
  {
    title: "Support",
    tiers: [
      { title: TierName.TIER_1, value: "Community" },
      { title: TierName.TIER_2, value: "Priority" },
      { title: TierName.TIER_3, value: "Dedicated + SLA" },
    ],
  },
];
