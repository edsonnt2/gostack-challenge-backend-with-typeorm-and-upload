import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: Category;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && balance.outcome + value > balance.income)
      throw new AppError("You don't have enough balance");

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category,
    });

    await transactionRepository.save(transaction);

    delete transaction.created_at;
    delete transaction.updated_at;
    delete transaction.category_id;

    return transaction;
  }
}

export default CreateTransactionService;
