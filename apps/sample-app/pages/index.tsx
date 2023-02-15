import { GetServerSidePropsContext } from 'next';
import { Session, unstable_getServerSession } from 'next-auth';
import Head from 'next/head';
import { useState } from 'react';
import useSWR from 'swr';
import { DrawerMenuButton } from '../components/DrawerMenuButton';
import { PageTabs } from '../components/PageTabs';
import { Pagination } from '../components/Pagination';
import { Table } from '../components/Table';
import { TableCell } from '../components/Table/TableCell';
import { pageTabs, useActiveTab } from '../hooks';
import prisma, { SalesforceAccount, SalesforceContact, SalesforceLead, SalesforceOpportunity } from '../lib/prismadb';
import authOptions from './api/auth/[...nextauth]';

const MAX_PAGE_SIZE = 10;

type PageProps = {
  contacts: SalesforceContact[];
  count: number;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session: Session | null = await unstable_getServerSession(context.req, context.res, authOptions);
  const customerId = session?.user?.name;
  if (!customerId) {
    return {
      props: { contacts: [], count: 0 },
    };
  }
  const usersObjs = await prisma.salesforceContact.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take: MAX_PAGE_SIZE,
  });
  const count = await prisma.salesforceContact.count({
    where: { customerId },
  });
  const contacts = usersObjs.map((user) => {
    return { ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() };
  });

  return { props: { contacts, count } };
}

function ContactsTable({
  initialUsers,
  initialTotalUsers,
}: {
  initialUsers: SalesforceContact[];
  initialTotalUsers: number;
}) {
  const [pageIndex, setPageIndex] = useState(0);

  const {
    data: { users = [], count },
    error,
    isLoading,
  } = useSWR(`/api/contacts?page=${pageIndex}`, {
    fallback: { '/api/contacts?page=0': { users: initialUsers, count: initialTotalUsers } },
    keepPreviousData: true,
  });
  const userCount = count || initialTotalUsers;
  let cols = [
    { name: 'First Name' },
    { name: 'Last Name' },
    { name: 'Title' },
    { name: 'Email' },
    { name: 'Salesforce ID' },
  ];

  // Display custom properties in the table
  // Right now there's no way to consume custom properties outside of the integration config page,
  // so just look at the first record returned to see if there are any custom properties on it
  let extraFields: string[] = [];
  if (users.length && users[0].extraAttributes) {
    extraFields = Object.keys(users[0].extraAttributes);
    cols = [...cols, ...extraFields.map((attr) => ({ name: attr }))];
  }

  return (
    <Table
      columns={cols}
      emptyMessage="No record found."
      errorMessage={error?.message}
      isError={!!error}
      numPlaceholderRows={10}
      isLoading={isLoading}
      className={{ 'border-b-0 sm:rounded-b-none': !!userCount }}
      pagination={
        userCount ? (
          <Pagination maxPageSize={MAX_PAGE_SIZE} setPageIndex={setPageIndex} pageIndex={pageIndex} count={userCount} />
        ) : undefined
      }
      rows={users.map((user: SalesforceContact) => (
        <tr key={user.id}>
          <TableCell isStrong>{user.firstName}</TableCell>
          <TableCell isStrong>{user.lastName}</TableCell>
          <TableCell>{user.title}</TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>{user.salesforceId}</TableCell>
          {extraFields.map((field: string, idx) => (
            <TableCell key={idx}>{(user.extraAttributes as Record<string, any>)[field]}</TableCell>
          ))}
        </tr>
      ))}
    />
  );
}

function AccountsTable({
  initialUsers,
  initialTotalUsers,
}: {
  initialUsers: SalesforceAccount[];
  initialTotalUsers: number;
}) {
  const [pageIndex, setPageIndex] = useState(0);

  const {
    data: { users = [], count },
    error,
    isLoading,
  } = useSWR(`/api/accounts?page=${pageIndex}`, {
    fallback: { '/api/accounts?page=0': { users: initialUsers, count: initialTotalUsers } },
    keepPreviousData: true,
  });
  const userCount = count || initialTotalUsers;
  const cols = [{ name: ' Name' }, { name: 'Salesforce ID' }];

  return (
    <Table
      columns={cols}
      emptyMessage="No records found."
      errorMessage={error?.message}
      isError={!!error}
      numPlaceholderRows={10}
      isLoading={isLoading}
      className={{ 'border-b-0 sm:rounded-b-none': !!userCount }}
      pagination={
        userCount ? (
          <Pagination maxPageSize={MAX_PAGE_SIZE} setPageIndex={setPageIndex} pageIndex={pageIndex} count={userCount} />
        ) : undefined
      }
      rows={users.map((user: SalesforceAccount) => (
        <tr key={user.id}>
          <TableCell isStrong>{user.name}</TableCell>
          <TableCell>{user.salesforceId}</TableCell>
        </tr>
      ))}
    />
  );
}

function OpportunitiesTable({
  initialUsers,
  initialTotalUsers,
}: {
  initialUsers: SalesforceOpportunity[];
  initialTotalUsers: number;
}) {
  const [pageIndex, setPageIndex] = useState(0);

  const {
    data: { users = [], count },
    error,
    isLoading,
  } = useSWR(`/api/opportunities?page=${pageIndex}`, {
    fallback: { '/api/opportunities?page=0': { users: initialUsers, count: initialTotalUsers } },
    keepPreviousData: true,
  });
  const userCount = count || initialTotalUsers;
  const cols = [{ name: 'Name' }, { name: 'Stage' }, { name: 'Close Date' }, { name: 'Salesforce ID' }];

  return (
    <>
      <Table
        columns={cols}
        emptyMessage="No records found."
        errorMessage={error?.message}
        isError={!!error}
        numPlaceholderRows={10}
        isLoading={isLoading}
        className={{ 'border-b-0 sm:rounded-b-none': !!userCount }}
        pagination={
          userCount ? (
            <Pagination
              maxPageSize={MAX_PAGE_SIZE}
              setPageIndex={setPageIndex}
              pageIndex={pageIndex}
              count={userCount}
            />
          ) : undefined
        }
        rows={users.map((user: SalesforceOpportunity) => (
          <tr key={user.id}>
            <TableCell isStrong>{user.name}</TableCell>
            <TableCell>{user.stage}</TableCell>
            <TableCell>{new Date(user.closeDate).toDateString()}</TableCell>
            <TableCell>{user.salesforceId}</TableCell>
          </tr>
        ))}
      />
    </>
  );
}

function LeadsTable({
  initialUsers,
  initialTotalUsers,
}: {
  initialUsers: SalesforceLead[];
  initialTotalUsers: number;
}) {
  const [pageIndex, setPageIndex] = useState(0);

  const {
    data: { users = [], count },
    error,
    isLoading,
  } = useSWR(`/api/leads?page=${pageIndex}`, {
    fallback: { '/api/leads?page=0': { users: initialUsers, count: initialTotalUsers } },
    keepPreviousData: true,
  });
  const userCount = count || initialTotalUsers;
  const cols = [
    { name: 'First Name' },
    { name: 'Last Name' },
    { name: 'Title' },
    { name: 'Status' },
    { name: 'Salesforce ID' },
  ];

  return (
    <Table
      columns={cols}
      emptyMessage="No records found."
      errorMessage={error?.message}
      isError={!!error}
      numPlaceholderRows={10}
      isLoading={isLoading}
      className={{ 'border-b-0 sm:rounded-b-none': !!userCount }}
      pagination={
        userCount ? (
          <Pagination maxPageSize={MAX_PAGE_SIZE} setPageIndex={setPageIndex} pageIndex={pageIndex} count={userCount} />
        ) : undefined
      }
      rows={users.map((user: SalesforceLead) => (
        <tr key={user.id}>
          <TableCell isStrong>{user.firstName}</TableCell>
          <TableCell isStrong>{user.lastName}</TableCell>
          <TableCell>{user.title}</TableCell>
          <TableCell>{user.status}</TableCell>
          <TableCell>{user.salesforceId}</TableCell>
        </tr>
      ))}
    />
  );
}

export default function Users({ contacts, count }: PageProps) {
  const activeTabName = useActiveTab(pageTabs[0].name);
  return (
    <>
      <Head>
        <title>Apolla.io - App Objects</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="px-6 xl:pr-2 pb-16">
        <header className="flex items-center gap-4">
          <DrawerMenuButton />
          <h1 className="text-4xl font-bold my-6">Application Objects</h1>
        </header>

        <PageTabs className="mb-4" tabs={pageTabs} disabled={false} />
        {activeTabName === 'Contacts' && <ContactsTable initialUsers={contacts} initialTotalUsers={count} />}
        {activeTabName === 'Leads' && <LeadsTable initialUsers={[]} initialTotalUsers={0} />}
        {activeTabName === 'Accounts' && <AccountsTable initialUsers={[]} initialTotalUsers={0} />}
        {activeTabName === 'Opportunities' && <OpportunitiesTable initialUsers={[]} initialTotalUsers={0} />}
      </main>
    </>
  );
}
