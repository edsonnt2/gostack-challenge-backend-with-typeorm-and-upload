import { getRepository } from 'typeorm';
import Category from '../models/Category';

interface Request {
  title: string;
}

interface Response {
  category_id: string;
}

class CreateRepositoryService {
  public async execute({ title }: Request): Promise<Response> {
    const categoryRepository = getRepository(Category);
    const category = await categoryRepository.findOne({
      where: {
        title,
      },
      select: ['id'],
    });

    if (category) {
      return { category_id: category.id };
    }

    const newCategory = categoryRepository.create({
      title,
    });
    await categoryRepository.save(newCategory);
    return { category_id: newCategory.id };
  }
}

export default CreateRepositoryService;
