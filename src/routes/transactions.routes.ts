import { Router } from 'express';

import multer from 'multer';
import CreateTransactionService from '../services/CreateTransactionService';
import CreateCategoryService from '../services/CreateCategoryService';
import ListTransactionsService from '../services/ListTransactionsService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import upload from '../config/upload';
// import Transaction from '../models/Transaction';
// import AppError from '../errors/AppError';

const transactionsRouter = Router();
const uploadCSV = multer(upload);

transactionsRouter.get('/', async (req, res) => {
  const listTransactionsService = new ListTransactionsService();

  const transactions = await listTransactionsService.execute();

  return res.json(transactions);
});

transactionsRouter.post('/', async (req, res) => {
  const createCategoryService = new CreateCategoryService();
  const createTransactionService = new CreateTransactionService();
  const { title, value, type, category } = req.body;

  const { category_id } = await createCategoryService.execute({
    title: category,
  });

  const transation = await createTransactionService.execute({
    title,
    value,
    type: type.trim(),
    category_id,
  });

  transation.category = category;

  return res.json(transation);
});

transactionsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const deleteTransactionService = new DeleteTransactionService();

  await deleteTransactionService.execute({ id });

  res.status(204).send();
});
transactionsRouter.post(
  '/import',
  uploadCSV.single('file'),
  async (req, res) => {
    const importTransactionsService = new ImportTransactionsService();
    const fileCsv = await importTransactionsService.execute({
      filename: req.file.filename,
    });

    return res.json(fileCsv);
  },
);

export default transactionsRouter;
