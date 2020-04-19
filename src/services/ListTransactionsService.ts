import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface Response {
  transactions: Transaction[];
  balance: {
    income: number;
    outcome: number;
    total: number;
  };
}

class ListTransactionsService {
  public async execute(): Promise<Response> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactions = await transactionsRepository.find({
      select: ['id', 'title', 'value', 'type'],
      relations: ['category'],
    });

    transactions.forEach((_, index) => {
      delete transactions[index].category.created_at;
      delete transactions[index].category.updated_at;
    });

    const balance = await transactionsRepository.getBalance();

    return { transactions, balance };
  }
}

export default ListTransactionsService;
