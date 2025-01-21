import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface UrlCreationAttrs {
  shortUrl: string;
  originalUrl: string;
}

@Table({ tableName: 'urls' })
export class Url extends Model<Url, UrlCreationAttrs> {
  @Column({
    type: DataType.STRING,
    unique: true,
    primaryKey: true,
  })
  shortUrl: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  originalUrl: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: true,
  })
  alias: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  clickCount: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiresAt: Date;
}
