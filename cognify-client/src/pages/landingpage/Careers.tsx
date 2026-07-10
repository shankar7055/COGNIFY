import { Badge } from "../../../notusComponents/badge";
import { Button } from "../../../notusComponents/button";
import { Container } from "../../../notusComponents/container";
import { CTA } from "../../../notusComponents/cta";
import { DivideX } from "../../../notusComponents/divide";
import { ScalesContainer } from "../../../notusComponents/scales-container";
import { SectionHeading } from "../../../notusComponents/section-heading";
import { SubHeading } from "../../../notusComponents/subheading";
import { careers, Department } from "../../../landingSettings/constants/careers";
import {
  BoltIcon,
  CloudCheckIcon,
  HeartHandsIcon,
  ShieldSplitIcon,
  SparklesIcon,
  TelescopeIcon,
} from "../../../landingSettings/icons/card-icons";

import { getSEOTags } from "../../../landingSettings/lib/seo";
import { cn } from "../../../landingSettings/lib/utils";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

// Define career type
type Career = {
  id: string;
  title: string;
  department: Department;
  location: string;
  type: string;
  href: string;
  createdAt: string;
  description: string;
  shortDescription: string;
  requirements: string[];
};

// SEO metadata
const seoData = getSEOTags({
  title: "Careers - Aceternity",
  description:
    "We're Building the Future of Agent-Driven Development. Founded by engineers and AI researchers, Notus was born out of a simple frustration: building intelligent systems still required too much manual orchestration. We set out to change that by creating a tool that lets teams design, simulate, and launch autonomous agents visually and intuitively.",
});

export default function CareersPage() {
  const images = [
    {
      src: "/team/1.png",
      className: "lg:col-span-2 col-span-1",
    },
    {
      src: "/team/2.png",
      className: "lg:col-span-2 col-span-1",
    },
    {
      src: "/team/3.png",
      className: "lg:col-span-4 col-span-1",
    },
    {
      src: "/team/4.png",
      className: "lg:col-span-3 col-span-1",
    },
    {
      src: "/team/5.png",
      className: "lg:col-span-3 col-span-1",
    },
    {
      src: "/team/6.png",
      className: "lg:col-span-2 col-span-1",
    },
  ];

  const uniqueDepartments = [
    ...new Set(careers.map((career: Career) => career.department)),
  ];

  const why = [
    {
      title: "Complete Ownership",
      description:
        "You will own your work and be able to see the impact of your work on the company.",
      icon: <CloudCheckIcon className="text-brand size-6" />,
    },
    {
      title: "High-Paced Environment",
      description:
        "Move fast and ship quality. We operate at startup velocity with enterprise precision.",
      icon: <BoltIcon className="text-brand size-6" />,
    },
    {
      title: "Absolute Integrity",
      description:
        "We do what we say. Transparency and honesty guide every decision and interaction.",
      icon: <ShieldSplitIcon className="text-brand size-6" />,
    },
    {
      title: "People-First Culture",
      description:
        "Your growth, well-being, and success are fundamental to our mission.",
      icon: <HeartHandsIcon className="text-brand size-6" />,
    },
    {
      title: "Meaningful Impact",
      description:
        "Build technology that transforms how millions of teams work. Your code matters.",
      icon: <SparklesIcon className="text-brand size-6" />,
    },
    {
      title: "Vision Driven",
      description:
        "Join us in reimagining the future of work through autonomous AI systems.",
      icon: <TelescopeIcon className="text-brand size-4" />,
    },
  ];
  return (
    <>
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords?.join(', ')} />
        {seoData.openGraph && (
          <>
            <meta property="og:title" content={seoData.openGraph.title} />
            <meta property="og:description" content={seoData.openGraph.description} />
            <meta property="og:url" content={seoData.openGraph.url} />
            <meta property="og:site_name" content={seoData.openGraph.siteName} />
            <meta property="og:locale" content={seoData.openGraph.locale} />
            <meta property="og:type" content={seoData.openGraph.type} />
            {seoData.openGraph.images && seoData.openGraph.images[0] && (
              <meta property="og:image" content={seoData.openGraph.images[0].url} />
            )}
          </>
        )}
        {seoData.twitter && (
          <>
            <meta name="twitter:card" content={seoData.twitter.card} />
            <meta name="twitter:title" content={seoData.twitter.title} />
            <meta name="twitter:description" content={seoData.twitter.description} />
            {seoData.twitter.images && seoData.twitter.images[0] && (
              <meta name="twitter:image" content={seoData.twitter.images[0].url} />
            )}
          </>
        )}
      </Helmet>
      <main>
      <DivideX />
      <Container className="border-divide flex flex-col items-center border-x pb-20">
        <div className="divide-divide border-divide grid grid-cols-1 border-b lg:grid-cols-2 lg:divide-x">
          <div className="flex flex-col items-start justify-start px-4 py-10 md:px-8 md:py-32">
            <Badge text="Careers" />
            <SectionHeading className="mt-4 text-left">
              Let's Change How Modern <br />
              Enterprise Teams Function
            </SectionHeading>
            <SubHeading className="mt-6 mr-auto max-w-md text-left">
              Building a generational company requires exceptional, hard-working
              people. We are tackling the complexities of commerce
              infrastructure that no one else has dared to.
            </SubHeading>
            <Button className="mt-4">View Roles</Button>

            <h2 className="mt-8 text-left font-mono text-sm tracking-tight text-neutral-500 uppercase">
              Our Investors
            </h2>
            <div className="mt-8 grid w-full grid-cols-3 items-start justify-start gap-10 md:grid-cols-3">
              <div className="relative h-10">
                <img
                  src="/logos/y-combinator.png"
                  alt="Investor 1"
                  className="absolute inset-0 h-6 w-full object-contain dark:invert dark:filter"
                />
              </div>
              <div className="relative h-10">
                <img
                  src="/logos/accel.png"
                  alt="Investor 2"
                  className="absolute inset-0 h-6 w-full object-contain dark:invert dark:filter"
                />
              </div>
              <div className="relative h-10">
                <img
                  src="/logos/softbank.png"
                  alt="Investor 3"
                  className="absolute inset-0 h-6 w-full object-contain dark:invert dark:filter"
                />
              </div>
            </div>
          </div>
          <div className="divide-divide border-divide flex flex-col items-center justify-center divide-y">
            {careers.slice(0, 3).map((career: Career) => (
              <Link
                to={career.href}
                key={career.id}
                className="block cursor-pointer px-4 py-4 hover:bg-gray-100 md:px-8 dark:hover:bg-neutral-800"
              >
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                  <h3 className="text-brand font-medium">{career.title}</h3>
                  <div className="hidden size-1 rounded-full bg-gray-400 sm:block dark:bg-neutral-600"></div>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    {career.location}
                  </p>
                  <div className="hidden size-1 rounded-full bg-gray-400 sm:block dark:bg-neutral-600"></div>
                  <span className="text-xs font-medium text-gray-600 dark:text-neutral-400">
                    {Math.floor(
                      (new Date().getTime() -
                        new Date(career.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    days ago
                  </span>
                </div>
                <p className="mt-2 font-medium text-neutral-500 dark:text-neutral-200">
                  {career.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </Container>
      <Container className="border-divide border-x border-b px-4 pb-20 md:px-8">
        <div className="flex w-full flex-col items-center py-10 md:py-20 lg:flex-row">
          <h2 className="mb-4 min-w-40 text-center font-mono text-sm tracking-tight text-neutral-500 uppercase lg:mb-0 lg:text-left dark:text-neutral-400">
            As featured in
          </h2>
          <div className="grid w-full grid-cols-2 items-center gap-4 md:grid-cols-4">
            <img
              src="/logos/bloomberg.png"
              alt="Bloomberg"
              className="h-6 w-full object-contain dark:invert dark:filter"
            />
            <img
              src="/logos/wired.png"
              alt="Wired"
              className="h-6 w-full object-contain dark:invert dark:filter"
            />
            <img
              src="/logos/forbes.png"
              alt="Forbes"
              className="h-6 w-full object-contain dark:invert dark:filter"
            />
            <img
              src="/logos/the-guardian.png"
              alt="The Guardian"
              className="h-6 w-full object-contain dark:invert dark:filter"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-8">
          {images.map((image) => (
            <ScalesContainer
              className={cn("h-80 w-full", image.className)}
              key={image.src + "careers"}
            >
              <img
                src={image.src}
                alt="Team"
                className={cn(
                  "h-80 w-full rounded-2xl object-cover object-top",
                  image.className,
                )}
              />
            </ScalesContainer>
          ))}
        </div>
      </Container>
      <Container className="border-divide flex flex-col items-center border-x border-b py-16 pb-20">
        <Badge text="Open Roles" />
        <SectionHeading className="mt-4 px-4 text-center">
          Checkout Our Open Roles
        </SectionHeading>
        <div className="mt-12 w-full">
          {uniqueDepartments.map((department) => (
            <JobSection
              key={department}
              title={department}
              jobs={careers.filter(
                (career) => career.department === department,
              )}
            />
          ))}
        </div>
      </Container>
      <Container className="border-divide flex flex-col items-center border-x border-b py-16 pb-20">
        <Badge text="Goals" />
        <SectionHeading className="mt-4 px-4 text-center">
          Why Work at Nodus?
        </SectionHeading>
        <div className="mt-12 grid grid-cols-1 gap-10 px-4 md:grid-cols-2 md:px-8 lg:grid-cols-3">
          {why.map((useCase) => (
            <div
              key={useCase.title}
              className="relative z-10 rounded-lg bg-gray-50 p-4 transition duration-200 md:p-5 dark:bg-neutral-800"
            >
              <div className="flex items-center gap-2">{useCase.icon}</div>
              <h3 className="mt-4 mb-2 text-lg font-medium">{useCase.title}</h3>
              <p className="text-gray-600">{useCase.description}</p>
            </div>
          ))}
        </div>
      </Container>

      <CTA />
      <DivideX />
      </main>
    </>
  );
}

const Row = ({ job, index }: { job: Career; index: number }) => {
  return (
    <Link
      to={job.href}
      className="group flex flex-col px-4 py-4 hover:bg-gray-100 md:flex-row md:items-center md:justify-between md:px-8 dark:hover:bg-neutral-800"
    >
      <div className="flex items-center gap-6">
        <span className="group-hover:text-brand font-mono text-sm text-gray-500 dark:text-neutral-400">
          {String(index + 1).padStart(2, "0")}
        </span>

        <h3 className="text-charcoal-700 text-lg font-medium dark:text-neutral-100">
          {job.title}
        </h3>
      </div>
      <div className="flex items-center gap-2 pl-10 md:pl-0">
        <p className="text-sm text-gray-600 dark:text-neutral-400">
          {job.location}
        </p>
        <svg
          className="group-hover:text-brand hidden h-5 w-5 text-gray-400 transition duration-200 group-hover:translate-x-1 md:block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
};

const JobSection = ({ title, jobs }: { title: string; jobs: Career[] }) => {
  return (
    <div className="border-divide mb-12 border-b">
      <h2 className="text-charcoal-700 bg-gray-50 px-4 py-4 text-xl font-semibold md:px-8 dark:bg-neutral-800 dark:text-neutral-100">
        {title}
      </h2>
      <div className="divide-divide divide-y">
        {jobs.map((job, index) => (
          <Row key={job.id} job={job} index={index} />
        ))}
      </div>
    </div>
  );
};
