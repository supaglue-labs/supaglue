import type { PrismaClient } from '@supaglue/db';
import { NotFoundError } from '../errors';
import { fromCustomerModel } from '../mappers/customer';
import { Customer, CustomerCreateParams, CustomerUpdateParams } from '../types/customer';

export class CustomerService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async getById(id: string): Promise<Customer> {
    const customer = await this.#prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundError(`Can't find customer with id: ${id}`);
    }
    return fromCustomerModel(customer);
  }

  // TODO: paginate
  public async list(): Promise<Customer[]> {
    const customers = await this.#prisma.customer.findMany({
      include: {
        connections: true,
      },
    });
    return customers.map((customer) => fromCustomerModel(customer, true));
  }

  public async create(customer: CustomerCreateParams): Promise<Customer> {
    const createdCustomer = await this.#prisma.customer.create({
      data: customer,
    });
    return fromCustomerModel(createdCustomer);
  }

  public async update(id: string, customer: CustomerUpdateParams): Promise<Customer> {
    const updatedCustomer = await this.#prisma.customer.update({
      where: { id },
      data: customer,
    });
    return fromCustomerModel(updatedCustomer);
  }

  public async delete(id: string): Promise<Customer> {
    const deletedCustomer = await this.#prisma.customer.delete({
      where: { id },
    });
    return fromCustomerModel(deletedCustomer);
  }
}
