import { useParams } from "react-router-dom";
import { Container } from "../../../notusComponents/container";
import { SectionHeading } from "../../../notusComponents/section-heading";

const BlogPost = () => {
  const { slug } = useParams();

  return (
    <div className="pt-20">
      <Container className="border-divide border-x">
        <div className="py-20">
          <SectionHeading>Blog Post: {slug}</SectionHeading>
          <div className="mt-8">
            <p className="text-lg text-gray-600 dark:text-neutral-400">
              This is a blog post about {slug}. Content would be loaded dynamically 
              based on the slug parameter.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default BlogPost;
