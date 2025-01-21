import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface UrlCreationAttrs {
  originalUrl: string;
  shortUrl: string;
}

@Table({ tableName: 'urls' })
export class Url extends Model<Url, UrlCreationAttrs> {
  @Column({
    type: DataType.STRING,
    unique: true,
    primaryKey: true,
  })
  originalUrl: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  shortUrl: string;

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
