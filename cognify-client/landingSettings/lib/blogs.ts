type FrontMatter = {
  title: string;
  description: string;
  date: string;
  slug: string;
  image: string;
  authorName?: string;
  authorSrc?: string;
};

// Mock blog data for now
const mockBlogs = [
  {
    title: "Getting Started with Notus",
    description: "Learn how to build your first AI-driven workflow with Notus",
    date: "2024-01-15",
    slug: "getting-started-with-notus",
    image: "/blog/ace.webp",
    authorName: "Notus Team",
    authorSrc: "/avatars/manu.png",
  },
  {
    title: "Advanced Workflow Patterns",
    description: "Discover advanced patterns for complex AI workflows",
    date: "2024-01-20",
    slug: "advanced-workflow-patterns",
    image: "/blog/nextjs.webp",
    authorName: "Notus Team",
    authorSrc: "/avatars/tyler.png",
  },
];

export const getSingleBlog = async (slug: string) => {
  const blog = mockBlogs.find(b => b.slug === slug);
  if (!blog) return null;
  
  return {
    content: `<h1>${blog.title}</h1><p>${blog.description}</p>`,
    frontmatter: blog as FrontMatter,
  };
};

export const getBlogs = async () => {
  return mockBlogs.map(blog => ({
    slug: blog.slug,
    frontmatter: blog as FrontMatter,
  }));
};