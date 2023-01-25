import {Author, BlogPost} from '../dtos/blogPost';

export default interface IBlogRepository {
  getBlogPosts(criteria: BlogPostSearchCriteria): Promise<BlogPost[]>;
  getAuthors(criteria: AuthorSearchCriteria): Promise<Author[]>;
  addAuthor(author: Author): Promise<Author>;
  addBlogPost(blogPost: BlogPost): Promise<BlogPost>;
  updateBlogPost(blogPost: BlogPost): Promise<BlogPost>;
}

export interface BlogPostSearchCriteria {
  ids?: string[];
  authorId?: string;
  title?: string;
}

export interface AuthorSearchCriteria {
  ids?: string[];
  name?: string;
}
