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
        email: 'testing@ninco.finances',
        name: 'Test User',
      },
    });

    console.log('User created/found');

    // 0. Cleanup old non-UUID data (optional but recommended)
    await prisma.transaction.deleteMany({
      where: {
        OR: [
          { accountId: 'main-account-id' },
          { accountId: 'savings-account-id' }
        ]
      }
    });
    await prisma.tag.deleteMany({ where: { id: 'tag-fixed' } });
    await prisma.category.deleteMany({
      where: {
        id: { in: ['cat-housing', 'cat-food', 'cat-salary'] }
      }
    });
    await prisma.account.deleteMany({
      where: {
        id: { in: ['main-account-id', 'savings-account-id'] }
      }
    });

    console.log('Old non-UUID data cleaned up');

    const mainAccountId = '2e95a970-13ad-4e63-8f5b-594f8e589885';
    const savingsAccountId = '7b533e4b-610d-4075-813c-7389bcc77636';
    const catHousingId = 'd0f419d8-c70e-436f-876e-07a8264567e9';
    const catFoodId = 'e6f0b8e7-e5d4-4c32-9c1a-283e3c662885';
    const catSalaryId = 'a5f1e8d9-d4c3-4b2a-89a1-172e2b551774';
    const tagFixedId = 'f1e2d3c4-b5a6-4978-bdcf-827364519283';

    // 2. Create Accounts
    const mainAccount = await prisma.account.upsert({
      where: { id: mainAccountId },
      update: {},
      create: {
        id: mainAccountId,
        name: 'Main Account',
        balance: 1500.50,
        color: '#3b82f6',
        icon: 'Bank',
        userId,
      },
    });

    const savingsAccount = await prisma.account.upsert({
      where: { id: savingsAccountId },
      update: {},
      create: {
        id: savingsAccountId,
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
        where: { id: catHousingId },
        update: {},
        create: {
          id: catHousingId,
          name: 'Housing',
          color: '#ef4444',
          icon: 'Home',
          type: TransactionType.EXPENSE,
          userId,
        },
      }),
      prisma.category.upsert({
        where: { id: catFoodId },
        update: {},
        create: {
          id: catFoodId,
          name: 'Food',
          color: '#f59e0b',
          icon: 'Utensils',
          type: TransactionType.EXPENSE,
          userId,
        },
      }),
      prisma.category.upsert({
        where: { id: catSalaryId },
        update: {},
        create: {
          id: catSalaryId,
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
      where: { id: tagFixedId },
      update: {},
      create: {
        id: tagFixedId,
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
