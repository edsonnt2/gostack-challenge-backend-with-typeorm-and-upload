import path from 'path';
import fs from 'fs';
import csv from 'csv-parse';

import { getRepository, In } from 'typeorm';
import upload from '../config/upload';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: { filename: string }): Promise<Transaction[]> {
    const categories: string[] = [];
    const transactions: TransactionCSV[] = [];
    const FilePath = path.join(upload.folderUpload, filename);

    const createReadStream = fs.createReadStream(FilePath).pipe(
      csv({
        from_line: 2,
        trim: true,
      }),
    );

    createReadStream.on('data', dataCsv => {
      const [title, type, value, category] = dataCsv;

      if (!title || !type || !value) return;
      categories.push(category);
      transactions.push({
        value,
        title,
        category,
        type,
      });
    });

    await new Promise((resolve, reject) => {
      createReadStream.on('end', resolve);
      createReadStream.on('error', reject);
    });

    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);

    const existsCategory = await categoryRepository.find({
      where: In(categories),
    });

    const TitleCategoryExist = existsCategory.map(category => category.title);

    const filterCategoryNotExists = categories
      .filter(category => !TitleCategoryExist.includes(category))
      .filter(
        (value, index, arrayCategory) => arrayCategory.indexOf(value) === index,
      );

    const newCategory = categoryRepository.create(
      filterCategoryNotExists.map(title => ({
        title,
      })),
    );

    await categoryRepository.save(newCategory);

    const allCategory = [...existsCategory, ...newCategory];

    const Alltransactions = transactionRepository.create(
      transactions.map(({ title, value, type, category }) => ({
        title,
        value,
        type,
        category: allCategory.find(cat => cat.title === category),
      })),
    );

    await transactionRepository.save(Alltransactions);

    return Alltransactions;
  }
}

export default ImportTransactionsService;
