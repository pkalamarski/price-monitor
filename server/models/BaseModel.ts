import {
  Item,
  Database,
  Container,
  ItemResponse,
  SqlParameter,
  RequestOptions
} from '@azure/cosmos'

export interface IDocument {
  id?: string
  createdDate?: Date | string
  updatedDate?: Date | string
}

export default class BaseContainer<T extends IDocument> {
  protected readonly containerId: string
  protected readonly container: Container

  constructor(id: string, database: Database) {
    this.containerId = id
    this.container = database.container(id)
  }

  accessItem(id: string, partitionKeyValue: string): Item {
    const item = this.container.item(id, partitionKeyValue)

    return item
  }

  async getById(id: string): Promise<T> {
    const { resources } = await this.container.items
      .query<T>({
        query: `SELECT * FROM ${this.containerId} c WHERE c.id = @id`,
        parameters: [{ name: '@id', value: id }]
      })
      .fetchAll()

    return resources[0]
  }

  async getOne(whereOptions: Partial<T>): Promise<T> {
    const items = await this.queryBuilder(whereOptions, true)

    return items[0]
  }

  async getMany(whereOptions: Partial<T>): Promise<T[]> {
    const items = await this.queryBuilder(whereOptions)

    return items
  }

  async getAll(): Promise<T[]> {
    const { resources } = await this.container.items.readAll<T>().fetchAll()

    return resources
  }

  async query(query: string, parameters: SqlParameter[]): Promise<T[]> {
    const { resources } = await this.container.items
      .query<T>({ query, parameters })
      .fetchAll()

    return resources
  }

  async create(item: T, options?: RequestOptions): Promise<ItemResponse<T>> {
    const response = await this.container.items.create<T>(
      { ...item, createdDate: new Date(), updatedDate: new Date() },
      options
    )

    return response
  }

  async upsert(newItem: T, options?: RequestOptions): Promise<ItemResponse<T>> {
    const response = await this.container.items.upsert<T>(
      { ...newItem, updatedDate: new Date() },
      options
    )

    return response
  }

  async delete(id: string, partitionKeyValue: string): Promise<void> {
    await this.accessItem(id, partitionKeyValue).delete()
  }

  private async queryBuilder(whereOptions: Partial<T>, getOne?: boolean) {
    const query = Object.keys(whereOptions).reduce(
      (query, key, i) => (query += `${i ? 'AND ' : ' '}c.${key} = @${key}`),
      `SELECT * FROM ${this.containerId} c WHERE `
    )

    const parameters: SqlParameter[] = Object.keys(whereOptions).reduce(
      (parameters, key): SqlParameter[] => [
        ...parameters,
        { name: `@${key}`, value: whereOptions[key] }
      ],
      []
    )

    const { resources } = await this.container.items
      .query<T>({
        query: getOne ? query + ' OFFSET 0 LIMIT 1' : query,
        parameters
      })
      .fetchAll()

    return resources
  }
}
