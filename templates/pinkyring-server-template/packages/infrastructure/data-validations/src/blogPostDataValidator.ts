import {BlogPost} from '@pinkyring-server-template/core/dtos/blogPost';
import {DATA_ACTION} from '@pinkyring-server-template/core/dtos/dataActions';
import {IDataValidator} from '@pinkyring-server-template/core/interfaces/IDataValidator';
import {object, string} from 'yup';
import BaseDataValidator from './baseDataValidator';
import {BLOG_POST_TITLE_LENGTH_MAX} from './messages';

/** Blog post data validator using yup */
export default class BlogPostDataValidator
  extends BaseDataValidator
  implements IDataValidator<BlogPost>
{
  async validate(blogPost: BlogPost, action?: DATA_ACTION) {
    const schema = this.getSchema(action);

    await this.throwDataValidationErrorIfInvalid(async () => {
      await schema.validate(blogPost, {
        abortEarly: false,
      });
    });
  }

  /** expose the schema in case something wants to use it */
  getSchema(action?: DATA_ACTION) {
    const def = {
      id: string().optional(),
      title: string().max(191, BLOG_POST_TITLE_LENGTH_MAX).optional(),
      text: string().optional(),
      authorId: string().optional(),
    };

    if (action === DATA_ACTION.CREATE) {
      def.title = def.title.required();
      def.text = def.text.required();
      def.authorId = def.authorId.required();
    } else if (action === DATA_ACTION.UPDATE) {
      def.id = def.id.required();
    }

    return object(def);
  }
}
