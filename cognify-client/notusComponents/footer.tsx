import { Link } from "react-router-dom";
import { Button } from "./button";
import { Container } from "./container";
import { Logo } from "./logo";
import { SubHeading } from "./subheading";
import { SendIcon } from "../landingSettings/icons/bento-icons";

export const Footer = () => {
  const product = [
    { title: "Features", href: "#" },
    { title: "Pricing", href: "/pricing" },
    { title: "Changelog", href: "#" },
    { title: "Roadmap", href: "#" },
    { title: "Status", href: "#" },
  ];

  const developers = [
    { title: "Documentation", href: "#" },
    { title: "API Reference", href: "#" },
    { title: "SDKs", href: "#" },
    { title: "GitHub", href: "https://github.com" },
    { title: "Community", href: "#" },
  ];

  const company = [
    { title: "About", href: "/about" },
    { title: "Blog", href: "/blog" },
    { title: "Careers", href: "/careers" },
    { title: "Press", href: "#" },
    { title: "Contact", href: "/contact" },
  ];

  const legal = [
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Terms of Service", href: "/terms-of-service" },
    { title: "Cookie Policy", href: "/cookie-policy" },
    { title: "Security", href: "#" },
  ];

  return (
    <Container>
      <div className="grid grid-cols-1 px-4 py-20 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-y-10 md:gap-y-8">
        <div className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2">
          <Logo />
          <SubHeading as="p" className="mt-4 max-w-xs text-left">
            Orchestrate and automate agentic workflows
          </SubHeading>
          <Button as="a" href="/sign-up" className="mt-4">Start building</Button>
        </div>

        <div className="col-span-1 flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Product</p>
          {product.map((item) => (
            <Link
              to={item.href}
              key={item.title}
              className="text-footer-link my-1.5 text-sm font-medium hover:text-brand transition-colors duration-150"
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div className="col-span-1 flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Developers</p>
          {developers.map((item) => (
            <Link
              to={item.href}
              key={item.title}
              className="text-footer-link my-1.5 text-sm font-medium hover:text-brand transition-colors duration-150"
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div className="col-span-1 flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Company</p>
          {company.map((item) => (
            <Link
              to={item.href}
              key={item.title}
              className="text-footer-link my-1.5 text-sm font-medium hover:text-brand transition-colors duration-150"
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div className="col-span-1 flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Legal</p>
          {legal.map((item) => (
            <Link
              to={item.href}
              key={item.title}
              className="text-footer-link my-1.5 text-sm font-medium hover:text-brand transition-colors duration-150"
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 flex flex-col items-start">
          <p className="text-footer-link text-sm font-medium dark:text-neutral-350">Newsletter</p>
          <div className="mt-2 flex w-full items-center rounded-xl border border-gray-300 bg-gray-200 p-1 placeholder-gray-600 dark:border-neutral-700 dark:bg-neutral-850">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 bg-transparent px-2 text-sm outline-none focus:outline-none dark:text-white"
            />
            <Button className="my-0 flex size-8 shrink-0 items-center justify-center rounded-lg px-0 py-0 text-center">
              <SendIcon />
            </Button>
          </div>
          <SubHeading
            as="p"
            className="mt-4 text-left text-sm"
          >
            Get the latest product news and updates.
          </SubHeading>
        </div>
      </div>

      <div className="my-4 flex flex-col items-center justify-between px-4 pt-8 md:flex-row border-t border-gray-200/50 dark:border-neutral-800/40">
        <p className="text-footer-link text-sm dark:text-neutral-500">
          © 2026 Cognify, Inc. All rights reserved.
        </p>
        <div className="mt-4 flex items-center gap-6 md:mt-0">

          <div className="flex items-center gap-4">
            <Link
              to="https://twitter.com"
              className="text-footer-link transition-colors hover:text-brand"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </Link>
            <Link
              to="https://linkedin.com"
              className="text-footer-link transition-colors hover:text-brand"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
};
