import { Container } from "../../../notusComponents/container";
import { SectionHeading } from "../../../notusComponents/section-heading";

const Blog = () => {
  return (
    <div className="pt-20">
      <Container className="border-divide border-x">
        <div className="py-20">
          <SectionHeading>Blog</SectionHeading>
          <div className="mt-8">
            <p className="text-lg text-gray-600 dark:text-neutral-400">
              Stay updated with the latest insights on AI-driven workflows, 
              agentic systems, and technical innovations.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Blog;
