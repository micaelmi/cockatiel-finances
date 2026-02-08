import 'dotenv/config';
import { TransactionType } from '@prisma/client';
import { prisma } from "../src/lib/prisma";

async function main() {
  const userId = 'user_39IJ3qN94JhzWo7nZXciPbwOTWf';

  try {
    // 1. Create User (if not exists)
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: 'testing@cockatiel.finances',
        name: 'Test User',
      },
    });

    console.log('User created/found');

    // 2. Create Accounts
    const mainAccount = await prisma.account.upsert({
      where: { id: 'main-account-id' },
      update: {},
      create: {
        id: 'main-account-id',
        name: 'Main Account',
        balance: 1500.50,
        color: '#3b82f6',
        icon: 'Bank',
        userId,
      },
    });

    const savingsAccount = await prisma.account.upsert({
      where: { id: 'savings-account-id' },
      update: {},
      create: {
        id: 'savings-account-id',
        name: 'Savings',
        balance: 5000.00,
        color: '#10b981',
        icon: 'PiggyBank',
        userId,
      },
    });

    console.log('Accounts created');

    // 3. Create Categories
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { id: 'cat-housing' },
        update: {},
        create: {
          id: 'cat-housing',
          name: 'Housing',
          color: '#ef4444',
          icon: 'Home',
          type: TransactionType.EXPENSE,
          userId,
        },
      }),
      prisma.category.upsert({
        where: { id: 'cat-food' },
        update: {},
        create: {
          id: 'cat-food',
          name: 'Food',
          color: '#f59e0b',
          icon: 'Utensils',
          type: TransactionType.EXPENSE,
          userId,
        },
      }),
      prisma.category.upsert({
        where: { id: 'cat-salary' },
        update: {},
        create: {
          id: 'cat-salary',
          name: 'Salary',
          color: '#10b981',
          icon: 'Wallet',
          type: TransactionType.INCOME,
          userId,
        },
      }),
    ]);

    console.log('Categories created');

    // 4. Create Tags
    const fixedTag = await prisma.tag.upsert({
      where: { id: 'tag-fixed' },
      update: {},
      create: {
        id: 'tag-fixed',
        name: 'Fixed',
        userId,
      },
    });

    console.log('Tags created');

    // 5. Create Transactions
    await prisma.transaction.create({
      data: {
        amount: 4500.00,
        type: TransactionType.INCOME,
        date: new Date(),
        description: 'Monthly Salary',
        accountId: mainAccount.id,
        categoryId: categories.find(c => c.name === 'Salary')?.id,
        userId,
      },
    });

    await prisma.transaction.create({
      data: {
        amount: 1200.00,
        type: TransactionType.EXPENSE,
        date: new Date(),
        description: 'Rent Payment',
        accountId: mainAccount.id,
        categoryId: categories.find(c => c.name === 'Housing')?.id,
        userId,
        tags: {
          connect: [{ id: fixedTag.id }],
        },
      },
    });

    console.log('Transactions created');
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
