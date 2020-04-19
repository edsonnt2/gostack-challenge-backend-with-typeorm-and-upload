import path from 'path';
import fs from 'fs';
import csv from 'csv-parse';

import upload from '../config/upload';
import Transaction from '../models/Transaction';
import CreateRepositoryService from './CreateCategoryService';
import CreateTransactionService from './CreateTransactionService';

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: { filename: string }): Promise<Transaction[]> {
    const FilePath = path.join(upload.folderUpload, filename);

    const parse: TransactionCSV[] = await new Promise((resolve, reject) => {
      const file: TransactionCSV[] = [];
      fs.createReadStream(FilePath)
        .pipe(
          csv({
            delimiter: ',',
            columns: true,
            trim: true,
          }),
        )
        .on('data', fileCSV => {
          file.push(fileCSV);
        })
        .on('end', async () => {
          resolve(file);
          await fs.promises.unlink(FilePath);
        })
        .on('error', () => reject);
    });
    const createCategoryService = new CreateRepositoryService();
    const createTransactionService = new CreateTransactionService();
    const transactions: Transaction[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const { category, value, title, type } of parse) {
      // eslint-disable-next-line no-await-in-loop
      const { category_id } = await createCategoryService.execute({
        title: category,
      });
      // eslint-disable-next-line no-await-in-loop
      const transaction = await createTransactionService.execute({
        title,
        value,
        type,
        category_id,
      });
      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
