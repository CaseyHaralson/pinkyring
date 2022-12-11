import {Author, BlogPost} from '../dtos/blogPost';
import {
  AuthorSearchCriteria,
  BlogPostSearchCriteria,
} from '../services/blogService';

export default interface IBlogRepository {
  getBlogPosts(criteria: BlogPostSearchCriteria): Promise<BlogPost[]>;
  getAuthors(criteria: AuthorSearchCriteria): Promise<Author[]>;
  addAuthor(author: Author): Promise<Author>;
  addBlogPost(blogPost: BlogPost): Promise<BlogPost>;
  updateBlogPost(blogPost: BlogPost): Promise<BlogPost>;
}
