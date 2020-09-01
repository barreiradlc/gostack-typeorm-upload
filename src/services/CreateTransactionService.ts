// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRespository = getCustomRepository(TransactionsRepository);
    const categoryRespository = getRepository(Category);

    const { total } = await transactionRespository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError("You don't have enough money");
    }

    let transactionCategory = await categoryRespository.findOne({
      where: {
        title: category,
      },
    });

    if (!transactionCategory) {
      transactionCategory = categoryRespository.create({
        title: category,
      });

      await categoryRespository.save(transactionCategory);
    }

    const transaction = transactionRespository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionRespository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
