import type { NavigationItem } from "@/types/content";

export const siteConfig = {
  creativePlatform: "Measured Momentum",
  descriptor: "Acrobatic Rock ’n’ Roll + Boogie Woogie in India",
  statusLine: "Proposed organisation · In development",
  shortDescription:
    "A transparent proposal in development for acrobatic rock ’n’ roll and boogie woogie in India. No legal or sporting recognition is claimed.",
  statusStatement:
    "This website presents a proposal in development. No legal, governmental, sporting or international recognition is claimed.",
  expandedStatusStatement:
    "Acrobatic Rock ’n’ Roll + Boogie Woogie in India is a working descriptor for a proposed organisation. Its name, legal structure, policies, roles and programmes remain in development. This website does not present the proposal as a federation, governing body, recognised national representative or affiliate of an international organisation.",
  statusHref: "/about/#status",
  socialImageAlt:
    "Measured Momentum editorial card for Acrobatic Rock ’n’ Roll + Boogie Woogie in India, marked Proposed organisation · In development.",
} as const;

export const routes = {
  home: { href: "/", label: "Home" },
  disciplines: { href: "/disciplines/", label: "Disciplines" },
  athletes: { href: "/athletes/", label: "Athletes" },
  coachesAndJudges: {
    href: "/coaches-and-judges/",
    label: "Coaches & judges",
  },
  about: { href: "/about/", label: "About" },
  governance: { href: "/governance/", label: "Governance" },
  team: { href: "/team/", label: "Team" },
  competitions: { href: "/competitions/", label: "Competitions" },
  news: { href: "/news/", label: "News" },
  join: { href: "/join/", label: "Register interest" },
  contact: { href: "/contact/", label: "Contact" },
  privacy: { href: "/privacy/", label: "Privacy" },
  terms: { href: "/terms/", label: "Terms" },
} as const satisfies Record<string, NavigationItem>;

export const primaryNavigation = [
  routes.home,
  routes.disciplines,
  routes.athletes,
  routes.coachesAndJudges,
  routes.about,
  routes.governance,
  routes.team,
  routes.competitions,
  routes.news,
  routes.join,
  routes.contact,
] as const satisfies readonly NavigationItem[];

export const policyNavigation = [
  routes.privacy,
  routes.terms,
] as const satisfies readonly NavigationItem[];

export const mobileNavigation = [
  ...primaryNavigation,
  ...policyNavigation,
] as const satisfies readonly NavigationItem[];

export type NavigationGroup = {
  readonly label: string;
  readonly items: readonly NavigationItem[];
};

export const desktopNavigationGroups = [
  {
    label: "People",
    items: [routes.athletes, routes.coachesAndJudges],
  },
  {
    label: "The proposal",
    items: [routes.about, routes.governance, routes.team],
  },
  {
    label: "Activity",
    items: [routes.competitions, routes.news],
  },
] as const satisfies readonly NavigationGroup[];

export const footerNavigationGroups = [
  {
    label: "Explore",
    items: [
      routes.home,
      routes.disciplines,
      routes.athletes,
      routes.coachesAndJudges,
    ],
  },
  {
    label: "The proposal",
    items: [routes.about, routes.governance, routes.team],
  },
  {
    label: "Activity",
    items: [routes.competitions, routes.news],
  },
  {
    label: "Connect & information",
    items: [routes.join, routes.contact, routes.privacy, routes.terms],
  },
] as const satisfies readonly NavigationGroup[];

export const staticPublicRoutes = [
  routes.home.href,
  routes.disciplines.href,
  routes.athletes.href,
  routes.coachesAndJudges.href,
  routes.about.href,
  routes.governance.href,
  routes.team.href,
  routes.competitions.href,
  routes.news.href,
  routes.join.href,
  routes.contact.href,
  routes.privacy.href,
  routes.terms.href,
] as const;

export const indexablePublicRoutes = staticPublicRoutes.filter(
  (pathname) =>
    pathname !== routes.privacy.href && pathname !== routes.terms.href,
);

/*
 * Kept as a data compatibility export for the original foundation checks.
 * The production shell does not render this temporary navigation.
 */
export const foundationNavigation = [
  { href: "/", label: "Foundation" },
  { href: "#status", label: "Current status" },
  { href: "#foundation", label: "What is included" },
] as const satisfies readonly NavigationItem[];

export const plannedRoutes = staticPublicRoutes.filter(
  (route) => route !== "/",
);
